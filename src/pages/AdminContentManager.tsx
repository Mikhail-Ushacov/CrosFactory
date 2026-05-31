import { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, Newspaper, ArrowLeft, Edit2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export const AdminContentManager = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, nRes] = await Promise.all([
        api.get('/banners'), 
        api.get('/news')
      ]);
      setBanners(bRes.data);
      setNews(nRes.data);
    } catch (err) {
      console.error("Помилка завантаження даних", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleDelete = async (type: 'banners' | 'news', id: number) => {
    if (confirm('Видалити цей елемент?')) {
      try {
        await api.delete(`/${type}/${id}`);
        fetchData();
      } catch (err) {
        alert("Помилка при видаленні");
      }
    }
  };

  // Функція для зміни порядку банерів (якщо сервер підтримує PATCH /banners/reorder)
  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    setBanners(newBanners);

    try {
      await api.patch('/banners/reorder', { ids: newBanners.map(b => b.id) });
    } catch (err) {
      console.error("Не вдалося зберегти порядок", err);
      fetchData(); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Кнопка назад */}
      <button 
        onClick={() => navigate('/admin')} 
        className="flex items-center gap-2 text-slate-500 mb-8 hover:text-indigo-600 cursor-pointer transition-colors font-medium"
      >
        <ArrowLeft size={20} /> До панелі керування
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* --- СЕКЦІЯ БАНЕРІВ --- */}
        <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Layout size={20} />
              </div>
              Банери
            </h2>
            <Link 
              to="/admin/content/banner/new" 
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold"
            >
              <Plus size={18} /> Додати
            </Link>
          </div>

          <div className="space-y-3">
            {banners.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-50 rounded-2xl">Банерів ще немає</p>
            ) : (
              banners.map((b, idx) => (
                <div key={b.id} className="flex items-center gap-4 p-3 border border-slate-50 rounded-2xl group hover:border-indigo-100 transition-colors">
                  {/* Кнопки сортування */}
                  <div className="flex flex-col gap-1">
                    <button 
                      disabled={idx === 0}
                      onClick={() => moveBanner(idx, 'up')}
                      className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-0 cursor-pointer"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button 
                      disabled={idx === banners.length - 1}
                      onClick={() => moveBanner(idx, 'down')}
                      className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-0 cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  {/* Перегляд фото */}
                  <div className="w-20 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    {b.images && b.images[0] ? (
                      <img src={b.images[0]} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><Layout size={16}/></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{b.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{b.text || 'Кнопка не задана'}</p>
                  </div>
                  
                  {/* Дії */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigate(`/admin/content/banner/${b.id}`)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                      title="Редагувати"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete('banners', b.id)} 
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Видалити"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* --- СЕКЦІЯ НОВИН --- */}
        <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Newspaper size={20} />
              </div>
              Новини
            </h2>
            <Link 
              to="/admin/content/news/new" 
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all text-sm font-bold"
            >
              <Plus size={18} /> Створити
            </Link>
          </div>

          <div className="space-y-3">
            {news.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-50 rounded-2xl">Новин ще немає</p>
            ) : (
              news.map(n => (
                <div key={n.id} className="flex items-center gap-4 p-4 border border-slate-50 rounded-2xl group hover:border-emerald-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {n.tag || 'Новина'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-slate-900 truncate">{n.title}</p>
                  </div>

                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigate(`/admin/content/news/${n.id}`)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                      title="Редагувати"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete('news', n.id)} 
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Видалити"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};