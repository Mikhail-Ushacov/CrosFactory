import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  date: string;
  tag: string;
  images: string[];
}

export const NewsList = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/news')
      .then(res => setNews(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Новини та Акції</h1>
        <p className="text-slate-500">Дізнавайтеся першими про наші новинки та спеціальні пропозиції</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <Link 
            key={item.id} 
            to={`/news/${item.id}`}
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
          >
            <div className="aspect-video overflow-hidden bg-slate-100">
              <img 
                src={item.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={item.title}
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {item.tag}
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                  <Calendar size={12} />
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                Читати далі <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};