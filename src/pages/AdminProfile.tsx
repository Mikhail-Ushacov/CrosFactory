import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, PlusCircle, ShoppingCart, Users, TrendingUp, Shield } from 'lucide-react';
import type { Product } from '../types';
import api from '../api';

export const AdminProfile = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Видалити цей товар безповоротно?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert("Помилка при видаленні");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Замовлень', val: '24', icon: <ShoppingCart size={20}/>, color: 'bg-blue-500' },
          { label: 'Клієнтів', val: '12', icon: <Users size={20}/>, color: 'bg-indigo-500' },
          { label: 'Дохід', val: '18k ₴', icon: <TrendingUp size={20}/>, color: 'bg-emerald-500' },
          { label: 'Товарів', val: products.length, icon: <Shield size={20}/>, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
            <p className="text-xl font-black text-slate-900">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Усі товари</h2>
        <Link to="/admin/product/new" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <PlusCircle size={20} /> Додати новий
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Товар</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Категорія</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Ціна</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.main_image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      <span className="font-semibold text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{product.category_name}</td>
                  <td className="p-4 font-bold text-indigo-600">{product.price.toLocaleString()} ₴</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/product/edit/${product.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit2 size={18} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};