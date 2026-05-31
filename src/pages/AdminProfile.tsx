import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, PlusCircle, ShoppingCart, Users, TrendingUp, Shield, Layout, Package } from 'lucide-react';
import type { Product, Order } from '../types'; // Видалив User, бо він не використовується
import api from '../api';

export const AdminProfile = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Отримуємо тільки товари та замовлення
      const [prodRes, statsRes] = await Promise.all([
        api.get('/products'),
        api.get('/admin/stats')
      ]);

      setProducts(prodRes.data);
          setOrders(statsRes.data.orders);
        } catch (err) {
          console.error("Помилка:", err);
        } finally {
          setLoading(false);
        }
      };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyIncome = orders
      .filter(order => new Date(order.date) >= startOfMonth)
      .reduce((sum, order) => sum + order.sum, 0);

    // Рахуємо клієнтів по унікальним ID в замовленнях
    const activeClientsCount = new Set(orders.map(o => o.userId)).size;

    return {
      ordersCount: orders.length,
      clientsCount: activeClientsCount,
      income: monthlyIncome,
      productsCount: products.length
    };
  }, [orders, products]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Видалити цей товар?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err) {
        alert("Помилка при видаленні");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Завантаження...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'Замовлень', val: stats.ordersCount, icon: <ShoppingCart size={18}/>, color: 'bg-blue-500' },
          { label: 'Клієнтів', val: stats.clientsCount, icon: <Users size={18}/>, color: 'bg-indigo-500' },
          { 
            label: 'Дохід (міс.)', 
            val: `${stats.income >= 1000 ? (stats.income / 1000).toFixed(1) + 'k' : stats.income} ₴`, 
            icon: <TrendingUp size={18}/>, 
            color: 'bg-emerald-500' 
          },
          { label: 'Товарів', val: stats.productsCount, icon: <Shield size={18}/>, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
            <div className={`${stat.color} w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white mb-2 sm:mb-3`}>
              {stat.icon}
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Решта коду (кнопки та список товарів) залишається без змін */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Усі товари</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/product/new" className="flex-1 sm:flex-none justify-center bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all">
            <PlusCircle size={18} /> Додати товар
          </Link>
          <Link to="/admin/content" className="flex-1 sm:flex-none justify-center bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            <Layout size={18} /> Контент
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="block md:hidden divide-y divide-slate-50">
          {products.map(product => (
            <div key={product.id} className="p-4 flex items-center gap-4">
              {product.main_image ? (
                <img src={product.main_image} className="w-14 h-14 rounded-xl object-cover bg-slate-100" alt="" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                  <Package size={20} />
                </div>
              )}              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{product.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="truncate">{product.category_name}</span>
                  <span>•</span>
                  <span className="font-bold text-indigo-600 whitespace-nowrap">{product.price.toLocaleString()} ₴</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Link to={`/admin/product/edit/${product.id}`} className="p-2 text-slate-400 hover:text-indigo-600">
                  <Edit2 size={18} />
                </Link>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
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
                <tr key={product.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.main_image ? (
                        <img src={product.main_image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                          <Package size={16} />
                        </div>
                      )}                      
                      <span className="font-semibold text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{product.category_name}</td>
                  <td className="p-4 font-bold text-indigo-600">{product.price.toLocaleString()} ₴</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/product/edit/${product.id}`} className="p-2 text-slate-400 hover:text-indigo-600">
                        <Edit2 size={18} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600">
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