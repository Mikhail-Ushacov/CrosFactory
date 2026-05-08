import { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { User, Building2, CreditCard, ArrowRight, Truck, Mail, Phone, Hash, Landmark, FileText, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

type CustomerType = 'individual' | 'business';

export const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const [customerType, setCustomerType] = useState<CustomerType>('individual');
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Стан для фізичної особи
  const [individualForm, setIndividualForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Стан для юридичної особи
  const [businessForm, setBusinessForm] = useState({
    companyName: '',
    edrpou: '',
    iban: '',
    bank: '',
    taxStatus: '',
    address: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      type: customerType,
      details: customerType === 'individual' ? individualForm : businessForm,
      items: cart,
      total,
      date: new Date().toISOString()
    };

    try {
      await axios.post('http://localhost:3001/api/orders', orderData);
      clearCart();
      setOrdered(true);
    } catch (err) {
      alert("Помилка при оформленні замовлення");
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Замовлення прийнято!</h1>
        <p className="text-slate-500 mb-8">Ми зв'яжемося з вами найближчим часом для підтвердження.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
          Повернутись до магазину
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Оформлення замовлення</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Вибір типу клієнта */}
          <div className="bg-white p-2 rounded-2xl border border-slate-100 flex gap-2">
            <button
              onClick={() => setCustomerType('individual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                customerType === 'individual' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <User size={18} /> Фізична особа
            </button>
            <button
              onClick={() => setCustomerType('business')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                customerType === 'business' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Building2 size={18} /> Юридична особа
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} /> 
              Контактні дані та реквізити
            </h3>

            {customerType === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ПІБ Покупця</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="Іванов Іван Іванович"
                      value={individualForm.fullName}
                      onChange={e => setIndividualForm({...individualForm, fullName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="example@mail.com"
                      value={individualForm.email}
                      onChange={e => setIndividualForm({...individualForm, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Телефон</label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="+380"
                      value={individualForm.phone}
                      onChange={e => setIndividualForm({...individualForm, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Адреса доставки</label>
                  <div className="relative mt-1">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="Місто, відділення пошти або вулиця"
                      value={individualForm.address}
                      onChange={e => setIndividualForm({...individualForm, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Назва компанії</label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="ТОВ 'Приклад'"
                      value={businessForm.companyName}
                      onChange={e => setBusinessForm({...businessForm, companyName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ЄДРПОУ</label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="8 цифр"
                      value={businessForm.edrpou}
                      onChange={e => setBusinessForm({...businessForm, edrpou: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">IBAN</label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="UA..."
                      value={businessForm.iban}
                      onChange={e => setBusinessForm({...businessForm, iban: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Банк</label>
                  <div className="relative mt-1">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="Назва банку"
                      value={businessForm.bank}
                      onChange={e => setBusinessForm({...businessForm, bank: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Статус платника податків</label>
                  <select 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none cursor-pointer"
                    value={businessForm.taxStatus}
                    onChange={e => setBusinessForm({...businessForm, taxStatus: e.target.value})}
                  >
                    <option value="">Оберіть варіант</option>
                    <option value="Платник ПДВ">Платник ПДВ</option>
                    <option value="Єдиний податок">Єдиний податок</option>
                    <option value="Загальні підстави">На загальних підставах</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Юридична адреса</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="Повна адреса"
                      value={businessForm.address}
                      onChange={e => setBusinessForm({...businessForm, address: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
                  <input 
                    required className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                    value={businessForm.email}
                    onChange={e => setBusinessForm({...businessForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Телефон</label>
                  <input 
                    required className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                    value={businessForm.phone}
                    onChange={e => setBusinessForm({...businessForm, phone: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Обробка..." : (
                <>Підтвердити замовлення <ArrowRight size={22} /></>
              )}
            </button>
          </form>
        </div>

        {/* Підсумок замовлення */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Ваше замовлення</h3>
            <div className="divide-y divide-slate-50 mb-6">
              {cart.map(item => (
                <div key={item.id} className="py-3 flex justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.quantity} шт. × {item.price.toLocaleString()} ₴</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{(item.price * item.quantity).toLocaleString()} ₴</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Сума</span>
                <span>{total.toLocaleString()} ₴</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Доставка</span>
                <span className="text-emerald-500 font-bold">Безкоштовно</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-dashed border-slate-100 mt-2">
                <span>Разом</span>
                <span className="text-indigo-600">{total.toLocaleString()} ₴</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};