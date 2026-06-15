import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import api from '../api';
import type { Order, OrderItem } from '../types';

const ProformaInvoice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  if (!order) return <div className="text-center p-20">Замовлення не знайдено</div>;

  const vat = order.sum * 0.2;
  const totalNoVat = order.sum - vat;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
          <ArrowLeft size={20} /> Назад
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 cursor-pointer">
          <Printer size={20} /> Друкувати рахунок
        </button>
      </div>

      <div className="max-w-[800px] mx-auto p-10 bg-white text-[12px] font-sans text-black leading-tight border border-slate-200 print:border-none">
        {/* Банківські реквізити для оплати */}
        <div className="border border-black p-2 mb-6">
          <p className="font-bold mb-1">Увага! Рахунок дійсний до оплати протягом 3-х банківських днів.</p>
          <p className="text-[10px]">При оплаті вказуйте номер рахунку в призначенні платежу.</p>
        </div>

        {/* Постачальник */}
        <div className="grid grid-cols-[120px_1fr] mb-1">
          <div className="font-bold border-b border-black">Постачальник</div>
          <div className="border-b border-black font-bold uppercase">ТОВ "ЗАПОРІЖЖЯ-МЕТИЗ"</div>
        </div>
        <div className="grid grid-cols-[120px_1fr] mb-4">
          <div></div>
          <div className="text-[11px]">
            <p>Р/р UA403510050000026005878977392 в АТ "УкрСиббанк", МФО 351005</p>
            <p>ЄДРПОУ 43296611, ІПН 432966108069</p>
            <p>Адреса: Запорізька обл., Вільнянський р-н, с. Матвіївка, пров. Тихий 1</p>
          </div>
        </div>

        {/* Одержувач */}
        <div className="grid grid-cols-[120px_1fr] mb-1">
          <div className="font-bold border-b border-black">Одержувач</div>
          <div className="border-b border-black font-bold">{order.customerName}</div>
        </div>
        <div className="grid grid-cols-[120px_1fr] mb-6">
          <div></div>
          <div className="text-[11px]">
            <p>тел. {order.phone}</p>
            {order.iban && <p>Р/р: {order.iban} в {order.bank}</p>}
          </div>
        </div>

        <div className="text-center my-8">
          <h1 className="text-lg font-bold uppercase">Рахунок-фактура № СФ-{order.id.toString().padStart(6, '0')}</h1>
          <div className="font-bold underline">від {formatDate(order.date)}</div>
        </div>

        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">№</th>
              <th className="border border-black p-1 w-1/2">Товар (послуга)</th>
              <th className="border border-black p-1">Од.</th>
              <th className="border border-black p-1">Кількість</th>
              <th className="border border-black p-1">Ціна без ПДВ</th>
              <th className="border border-black p-1">Сума без ПДВ</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: OrderItem, idx: number) => (
              <tr key={idx}>
                <td className="border border-black p-1 text-center">{idx + 1}</td>
                <td className="border border-black p-1">{item.product!.name}</td>
                <td className="border border-black p-1 text-center">шт.</td>
                <td className="border border-black p-1 text-center">{item.quantity}</td>
                <td className="border border-black p-1 text-right">{(item.product!.price / 1.2).toFixed(2)}</td>
                <td className="border border-black p-1 text-right font-bold">{((item.product!.price / 1.2) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between font-bold">
              <span>Разом без ПДВ:</span>
              <span>{totalNoVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-y border-black py-1 my-1">
              <span>ПДВ (20%):</span>
              <span>{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Всього до сплати:</span>
              <span>{order.sum.toFixed(2)} ₴</span>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-black pb-1 mb-8">
          <p className="font-bold italic">Всього на суму: {order.sum.toLocaleString('uk-UA')} грн. {(order.sum % 1).toFixed(2).split('.')[1]} коп.</p>
          <p className="text-[10px]">ПДВ: {vat.toFixed(2)} грн.</p>
        </div>

        <div className="grid grid-cols-2 gap-20">
          <div>
            <div className="font-bold italic mb-10">Виписав(ла):</div>
            <div className="border-b border-black flex justify-between items-end">
              <span className="text-[10px]">директор Анічкіна І.В.</span>
              <span className="text-[8px] text-gray-400">(підпис)</span>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-300 italic text-[10px]">
              М.П.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaInvoice;