import React from 'react';

// Типи для даних
interface InvoiceItem {
  name: string;
  unit: string;
  quantity: number;
  priceNoVat: number;
  totalNoVat: number;
}

interface ProformaData {
  supplier: {
    name: string;
    edrpou: string;
    iban: string;
    bank: string;
    mfo: string;
    ipn: string;
    taxStatus: string;
    address: string;
  };
  receiver: {
    name: string;
    phone: string;
  };
  orderStatus: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: InvoiceItem[];
  discount: number;
}

const ProformaInvoice: React.FC = () => {
  // Дані для Рахунку-фактури
  const data: ProformaData = {
    supplier: {
      name: 'ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ "ЗАПОРІЖЖЯ-МЕТИЗ"',
      edrpou: '43296611',
      iban: 'UA403510050000026005878977392',
      bank: 'АТ "УкрСиббанк"',
      mfo: '351005',
      ipn: '432966108069',
      taxStatus: 'Є платником податку на прибуток на загальних підставах',
      address: 'Запорізька обл., Вільнянський р-н, село Матвіївка, провулок Тихий 1',
    },
    receiver: {
      name: 'ГАЙДА МАРІЯ ФЕДОРІВНА',
      phone: '0677948526',
    },
    orderStatus: 'Без замовлення',
    invoiceNumber: 'СФ-000014',
    invoiceDate: '05 березня 2026 р.',
    items: [
      {
        name: 'Дріт термічно-оброблений ф 3.0 мм',
        unit: 'т',
        quantity: 1.970,
        priceNoVat: 68667.00,
        totalNoVat: 135273.99,
      }
    ],
    discount: 0.00,
  };

  const totalNoVat = data.items.reduce((sum, item) => sum + item.totalNoVat, 0);
  const vat = totalNoVat * 0.2;
  const totalWithVat = totalNoVat + vat;

  return (
    <div className="max-w-200 mx-auto p-8 bg-white text-[12px] font-sans text-black leading-tight border border-gray-200 shadow-sm print:shadow-none print:border-none">
      
      {/* Шапка: Постачальник */}
      <div className="grid grid-cols-[120px_1fr] mb-1">
        <div className="font-bold border-b border-black">Постачальник</div>
        <div className="border-b border-black font-bold">{data.supplier.name}</div>
      </div>
      <div className="grid grid-cols-[120px_1fr] mb-4">
        <div></div>
        <div className="text-[11px]">
          <p>ЄДРПОУ {data.supplier.edrpou}</p>
          <p>{data.supplier.iban} в {data.supplier.bank} МФО {data.supplier.mfo}</p>
          <p>ІПН {data.supplier.ipn}</p>
          <p>{data.supplier.taxStatus}</p>
          <p>Адреса: {data.supplier.address}</p>
        </div>
      </div>

      {/* Одержувач */}
      <div className="grid grid-cols-[120px_1fr] mb-1">
        <div className="font-bold border-b border-black">Одержувач</div>
        <div className="border-b border-black font-bold">{data.receiver.name}</div>
      </div>
      <div className="grid grid-cols-[120px_1fr] mb-4 text-gray-700">
        <div></div>
        <div>тел. {data.receiver.phone}</div>
      </div>

      {/* Платник */}
      <div className="grid grid-cols-[120px_1fr] mb-1">
        <div className="font-bold border-b border-black">Платник</div>
        <div className="border-b border-black">той самий</div>
      </div>

      {/* Замовлення */}
      <div className="grid grid-cols-[120px_1fr] mb-8">
        <div className="font-bold border-b border-black">Замовлення</div>
        <div className="border-b border-black">{data.orderStatus}</div>
      </div>

      {/* Заголовок документа */}
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold">
          Рахунок-фактура № {data.invoiceNumber}
        </h1>
        <div className="font-bold underline">від {data.invoiceDate}</div>
      </div>

      {/* Таблиця товарів */}
      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black p-1 text-center w-1/2">Товар (послуга)</th>
            <th className="border border-black p-1 text-center">Од.</th>
            <th className="border border-black p-1 text-center">Кількість</th>
            <th className="border border-black p-1 text-center">Ціна без ПДВ</th>
            <th className="border border-black p-1 text-center">Сума без ПДВ</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-black p-1">{item.name}</td>
              <td className="border border-black p-1 text-center">{item.unit}</td>
              <td className="border border-black p-1 text-right">{item.quantity.toFixed(3)}</td>
              <td className="border border-black p-1 text-right">{item.priceNoVat.toFixed(2)}</td>
              <td className="border border-black p-1 text-right font-bold">{item.totalNoVat.toFixed(2)}</td>
            </tr>
          ))}
          {/* Додатковий рядок для візуальної висоти */}
          <tr className="h-6">
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
        </tbody>
      </table>

      {/* Підсумки */}
      <div className="flex justify-end mb-6">
        <div className="w-75">
          {data.discount > 0 && (
             <div className="flex justify-between p-1">
                <span className="font-bold">Знижка:</span>
                <span>{data.discount.toFixed(2)}</span>
             </div>
          )}
          <div className="flex justify-between font-bold">
            <span>Разом без ПДВ:</span>
            <span>{totalNoVat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-y border-black py-1 my-1">
            <span>ПДВ (20%):</span>
            <span>{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>Всього до сплати:</span>
            <span>{totalWithVat.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Сума прописом */}
      <div className="mb-8 border-b border-black pb-1">
        <p className="font-bold">
          Всього на суму: Сто шістдесят дві тисячі триста двадцять вісім гривень 79 копійок
        </p>
        <p className="italic text-[10px]">у т.ч. ПДВ: {vat.toFixed(2)} грн.</p>
      </div>

      {/* Підписи (адаптовано під рахунок) */}
      <div className="grid grid-cols-2 gap-16 mt-10">
        <div>
          <div className="flex items-end gap-2 mb-6">
            <span className="whitespace-nowrap">Місце складання:</span>
            <span className="border-b border-black w-full italic px-2">Запоріжжя</span>
          </div>
          <div className="mt-4">
            <div className="font-bold mb-1 italic">Виписав(ла)*</div>
            <div className="flex items-end border-b border-black mt-6">
              <span className="text-[10px] pb-1 px-1">директор Анічкіна І.В</span>
              <div className="flex-1 text-center text-[8px] text-gray-500">(підпис)</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end">
            <div className="p-4 border border-dashed border-gray-400 text-center text-gray-400">
                М.П. (за наявності)
            </div>
        </div>
      </div>

      <p className="text-[8px] mt-12 italic text-gray-500">
        * Рахунок дійсний до сплати протягом трьох банківських днів
      </p>
      
      {/* Кнопка друку */}
      <div className="mt-8 flex justify-center print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-8 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
        >
          Друкувати рахунок
        </button>
      </div>
    </div>
  );
};

export default ProformaInvoice;