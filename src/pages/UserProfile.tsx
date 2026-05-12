import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Package, FileText, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export const UserProfile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/my-orders').then(res => setOrders(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Мій профіль</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center h-fit">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} />
          </div>
          <h2 className="font-bold text-slate-900">{user?.login}</h2>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" /> Мої замовлення
            </h3>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center py-4 text-slate-400">Замовлень поки немає</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-4 border border-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-bold text-slate-900">Замовлення №{order.id}</p>
                      <p className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-indigo-600 font-bold">{order.sum} ₴</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link to={`/outvoice/${order.id}`} className="flex-1 sm:flex-none flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">
                        <FileText size={14} /> Рахунок
                      </Link>
                      <Link to={`/invoice/${order.id}`} className="flex-1 sm:flex-none flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">
                        <FileCheck size={14} /> Накладна
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};