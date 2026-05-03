import { useAuth } from '../context/AuthContext';
import { User, Package, Settings, CreditCard } from 'lucide-react';

export const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Мій профіль</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user?.login}</h2>
          <p className="text-sm text-slate-500 capitalize">{user?.role === 'user' ? 'Покупець' : 'Адміністратор'}</p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" /> Останні замовлення
            </h3>
            <div className="text-center py-8 border-2 border-dashed border-slate-50 rounded-2xl">
              <p className="text-slate-400">У вас поки немає замовлень</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <CreditCard size={18} /> <span className="font-medium">Оплата</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <Settings size={18} /> <span className="font-medium">Налаштування</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};