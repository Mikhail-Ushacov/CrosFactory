import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import api from '../api';
import type { Order, OrderItem } from '../types';

const InvoiceTemplate: React.FC = () => {
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

  // Проста функція для відображення дати
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
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer">
          <Printer size={20} /> Друкувати накладну
        </button>
      </div>

      <div className="max-w-[800px] mx-auto p-10 bg-white text-[12px] font-sans text-black leading-tight shadow-sm print:shadow-none border border-slate-200 print:border-none">
        {/* Постачальник */}
        <div className="grid grid-cols-[120px_1fr] mb-1">
          <div className="font-bold border-b border-black">Постачальник</div>
          <div className="border-b border-black font-bold uppercase">ТОВ "ЗАПОРІЖЖЯ-МЕТИЗ"</div>
        </div>
        <div className="grid grid-cols-[120px_1fr] mb-4">
          <div></div>
          <div className="text-[11px]">
            <p>ЄДРПОУ 43296611, ІПН 432966108069</p>
            <p>UA403510050000026005500052379 в АТ "УкрСиббанк" МФО 351006</p>
            <p>Адреса: Запорізька обл., Вільнянський р-н, с. Матвіївка, пров. Тихий 1</p>
          </div>
        </div>

        {/* Одержувач */}
        <div className="grid grid-cols-[120px_1fr] mb-1">
          <div className="font-bold border-b border-black">Одержувач</div>
          <div className="border-b border-black font-bold">{order.customerName}</div>
        </div>
        <div className="grid grid-cols-[120px_1fr] mb-4">
          <div></div>
          <div className="text-[11px]">
            <p>тел. {order.phone}, {order.email}</p>
            <p>Адреса: {order.address}</p>
            {order.edrpou && <p>ЄДРПОУ: {order.edrpou}</p>}
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] mb-1">
          <div className="font-bold border-b border-black">Замовлення</div>
          <div className="border-b border-black">Прийнято через онлайн-магазин</div>
        </div>

        {/* Заголовок */}
        <div className="text-center my-8">
          <h1 className="text-lg font-bold">ВИДАТКОВА НАКЛАДНА № РН-{order.id.toString().padStart(6, '0')}</h1>
          <div className="font-bold underline">від {formatDate(order.date)}</div>
        </div>

        {/* Таблиця */}
        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-center">№</th>
              <th className="border border-black p-1 text-center w-1/2">Найменування товару</th>
              <th className="border border-black p-1 text-center">Од.</th>
              <th className="border border-black p-1 text-center">Кільк.</th>
              <th className="border border-black p-1 text-center">Ціна з ПДВ</th>
              <th className="border border-black p-1 text-center">Сума з ПДВ</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: OrderItem, idx: number) => (
              <tr key={idx}>
                <td className="border border-black p-1 text-center">{idx + 1}</td>
                <td className="border border-black p-1">{item.product!.name}</td>
                <td className="border border-black p-1 text-center">шт.</td>
                <td className="border border-black p-1 text-center">{item.quantity}</td>
                <td className="border border-black p-1 text-right">{item.product!.price.toFixed(2)}</td>
                <td className="border border-black p-1 text-right font-bold">{(item.product!.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Підсумки */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between">
              <span>Разом без ПДВ:</span>
              <span>{totalNoVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-y border-black py-1 my-1">
              <span>ПДВ (20%):</span>
              <span>{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>Всього з ПДВ:</span>
              <span>{order.sum.toFixed(2)} ₴</span>
            </div>
          </div>
        </div>

        <div className="border-b border-black pb-1 mb-10">
          <p className="font-bold italic">Всього на суму: {order.sum.toLocaleString('uk-UA')} грн. {(order.sum % 1).toFixed(2).split('.')[1]} коп.</p>
        </div>

        {/* Підписи */}
        <div className="grid grid-cols-2 gap-20">
          <div>
            <p className="font-bold italic mb-8 text-center">Від постачальника*</p>
            <div className="border-b border-black flex justify-between items-end">
              <span className="text-[10px]">директор Анічкіна І.В.</span>
              <span className="text-[8px] text-gray-400">(підпис)</span>
            </div>
          </div>
          <div>
            <p className="font-bold italic mb-8 text-center">Отримав(ла)</p>
            <div className="border-b border-black h-5"></div>
          </div>
        </div>

        <p className="text-[8px] mt-10 text-gray-400 italic">
          * Відповідальний за здійснення господарської операції і правильність її оформлення. Дякуємо за співпрацю!
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;