import React, { useState, useEffect } from 'react'; // Додано useEffect
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Building2, 
  ArrowRight, 
  Truck, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Lock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import api from '../api';

type CustomerType = 'individual' | 'business';

export const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [customerType, setCustomerType] = useState<CustomerType>('individual');
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false); // Стан для завантаження історії
  const [error, setError] = useState('');

  // Дані для реєстрації (якщо гість)
  const [regData, setRegData] = useState({ login: '', password: '' });

  // Стан форми
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    edrpou: '',
    iban: '',
    bank: '',
    taxStatus: ''
  });

  // --- ЛОГІКА ПІДТЯГУВАННЯ ДАНИХ ---
  useEffect(() => {
    if (user) {
      setIsPrefilling(true);
      api.get('/orders/my')
        .then(res => {
          if (res.data && res.data.length > 0) {
            // Беремо найсвіжіше замовлення (вони відсортовані desc за id на бекенді)
            const lastOrder = res.data[0];
            
            setCustomerType(lastOrder.customerType as CustomerType);
            setFormData({
              fullName: lastOrder.customerType === 'individual' ? lastOrder.customerName : '',
              companyName: lastOrder.customerType === 'business' ? lastOrder.customerName : '',
              email: lastOrder.email || '',
              phone: lastOrder.phone || '',
              address: lastOrder.address || '',
              edrpou: lastOrder.edrpou || '',
              iban: lastOrder.iban || '',
              bank: lastOrder.bank || '',
              taxStatus: lastOrder.taxStatus || ''
            });
          }
        })
        .catch(err => console.error("Помилка завантаження історії:", err))
        .finally(() => setIsPrefilling(false));
    }
  }, [user]);
  // ---------------------------------

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const orderPayload = {
      cartItems: cart,
      totalPrice: total,
      type: customerType,
      userData: !user ? regData : null,
      details: {
        ...formData,
        customerName: customerType === 'individual' ? formData.fullName : formData.companyName
      }
    };

    try {
      await api.post('/orders', orderPayload);
      clearCart();
      setOrdered(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка при оформленні замовлення.");
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white p-10 rounded-3xl border border-slate-100 shadow-xl">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Дякуємо за замовлення!</h1>
        <p className="text-slate-500 mb-8">Дані успішно збережено в системі.</p>
        <Link to="/profile" className="block w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
          До моїх замовлень
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Оформлення замовлення</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {!user ? (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-amber-800">
                <Lock size={20} />
                <h3 className="font-bold">Новий користувач?</h3>
              </div>
              <p className="text-sm text-amber-700">Створіть акаунт для автоматичного заповнення реквізитів у майбутньому.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  required placeholder="Логін"
                  className="p-3 bg-white border border-amber-200 rounded-xl outline-none"
                  value={regData.login}
                  onChange={e => setRegData({...regData, login: e.target.value})}
                />
                <input 
                  required type="password" placeholder="Пароль"
                  className="p-3 bg-white border border-amber-200 rounded-xl outline-none"
                  value={regData.password}
                  onChange={e => setRegData({...regData, password: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="text-indigo-600" />
                <p className="text-sm text-indigo-900 font-medium">Ви як: <span className="font-bold">{user.login}</span></p>
              </div>
              {isPrefilling && (
                <div className="flex items-center gap-2 text-xs text-indigo-500 animate-pulse">
                  <Loader2 size={12} className="animate-spin" /> завантажуємо ваші реквізити...
                </div>
              )}
            </div>
          )}

          <div className="bg-white p-2 rounded-2xl border border-slate-100 flex gap-2 shadow-sm">
            <button
              type="button"
              onClick={() => setCustomerType('individual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                customerType === 'individual' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <User size={18} /> Фізична особа
            </button>
            <button
              type="button"
              onClick={() => setCustomerType('business')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                customerType === 'business' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
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

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerType === 'individual' ? (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ПІБ Покупця</label>
                  <input 
                    name="fullName" required
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                    placeholder="Прізвище, Ім'я, По батькові"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Назва компанії</label>
                    <input 
                      name="companyName" required
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="ТОВ 'Метіз Постач'"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">ЄДРПОУ</label>
                    <input 
                      name="edrpou" required
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="8 цифр"
                      value={formData.edrpou}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Статус ПДВ</label>
                    <select 
                      name="taxStatus" required
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      value={formData.taxStatus}
                      onChange={handleInputChange}
                    >
                      <option value="">Оберіть статус</option>
                      <option value="Платник ПДВ 20%">Платник ПДВ 20%</option>
                      <option value="Не платник ПДВ">Не платник ПДВ</option>
                      <option value="Єдиний податок">Єдиний податок</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">IBAN</label>
                    <input 
                      name="iban" required
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="UA..."
                      value={formData.iban}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Банк</label>
                    <input 
                      name="bank" required
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                      placeholder="Назва банку"
                      value={formData.bank}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Адреса доставки / Юридична адреса</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="address" required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                    placeholder="Місто, вулиця, № буд."
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="email" type="email" required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Телефон</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="phone" type="tel" required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                    placeholder="+380"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading || isPrefilling}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} /> Обробка...
                </>
              ) : (
                <>Підтвердити замовлення <ArrowRight size={22} /></>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar підсумок */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-indigo-600" /> Ваше замовлення
            </h3>
            
            <div className="max-h-60 overflow-y-auto pr-2 divide-y divide-slate-50 mb-6">
              {cart.map(item => (
                <div key={item.id} className="py-3 flex justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.quantity} шт.</p>
                  </div>
                  <div className="text-right">
                    {item.isOnSale && item.salePrice ? (
                      <>
                        <p className="text-[10px] text-slate-400 line-through">
                          {(item.price * item.quantity).toLocaleString()} ₴
                        </p>
                        <p className="text-sm font-bold text-red-600">
                          {(item.salePrice * item.quantity).toLocaleString()} ₴
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-slate-900">
                        {(item.price * item.quantity).toLocaleString()} ₴
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-xl font-black text-slate-900">
                <span>Разом</span>
                <span className="text-indigo-600">{total.toLocaleString()} ₴</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Ціни вказані з ПДВ 20%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;