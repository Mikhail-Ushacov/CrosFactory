import { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, Newspaper, ArrowLeft, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export const AdminContentManager = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [bRes, nRes] = await Promise.all([api.get('/banners'), api.get('/news')]);
      // Сортуємо банери за полем order (якщо воно є) або залишаємо як є
      setBanners(bRes.data);
      setNews(nRes.data);
    } catch (err) {
      console.error("Помилка завантаження даних", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (type: 'banners' | 'news', id: number) => {
    if (confirm('Видалити цей елемент?')) {
      await api.delete(`/${type}/${id}`);
      fetchData();
    }
  };

  // Функція для зміни порядку банерів
  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    // Міняємо місцями в локальному стані
    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    setBanners(newBanners);

    // Відправляємо на сервер оновлений порядок
    // Припускаємо, що сервер приймає масив ID у новому порядку
    try {
      await api.patch('/banners/reorder', { ids: newBanners.map(b => b.id) });
    } catch (err) {
      console.error("Не вдалося зберегти порядок", err);
      fetchData(); // Відкат до серверних даних у разі помилки
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 cursor-pointer">
        <ArrowLeft size={20} /> До адмін-панелі
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Секція Банерів */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Layout className="text-indigo-600" /> Банери</h2>
            <Link to="/admin/content/new?type=banner" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              <Plus size={20} />
            </Link>
          </div>
          <div className="space-y-4">
            {banners.map((b, idx) => (
              <div key={b.id} className="flex items-center gap-4 p-3 border border-slate-50 rounded-2xl group">
                <div className="flex flex-col gap-1">
                  <button 
                    disabled={idx === 0}
                    onClick={() => moveBanner(idx, 'up')}
                    className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-0"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    disabled={idx === banners.length - 1}
                    onClick={() => moveBanner(idx, 'down')}
                    className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-0"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                
                <img src={b.images[0]} className="w-16 h-10 object-cover rounded-lg bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{b.title}</p>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => navigate(`/admin/content/edit/${b.id}?type=banner`)}
                    className="p-2 text-slate-300 hover:text-amber-500 cursor-pointer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete('banners', b.id)} className="p-2 text-slate-300 hover:text-red-500 cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Секція Новин */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Newspaper className="text-emerald-600" /> Новини</h2>
            <Link to="/admin/content/new?type=news" className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
              <Plus size={20} />
            </Link>
          </div>
          <div className="space-y-4">
            {news.map(n => (
              <div key={n.id} className="flex items-center gap-4 p-3 border border-slate-50 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">{n.tag}</span>
                  <p className="font-bold text-sm truncate">{n.title}</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => navigate(`/admin/content/edit/${n.id}?type=news`)}
                    className="p-2 text-slate-300 hover:text-amber-500 cursor-pointer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete('news', n.id)} className="p-2 text-slate-300 hover:text-red-500 cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};