import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Loader2, ArrowRight, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import type { PaginatedResponse } from '../types';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  date: string;
  tag: string;
  images: string[];
}

export const NewsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setLoading(true);
    api.get<PaginatedResponse<NewsItem>>('/news', {
      params: {
        page: currentPage,
        limit: 9
      }
    })
      .then(res => {
        setNews(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(err => console.error("Помилка завантаження новин:", err))
      .finally(() => setLoading(false));
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-medium">Завантаження стрічки новин...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-12 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Newspaper size={24} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900">Новини та статті</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-2xl">
          Дізнавайтесь першими про нові надходження, акції та корисні поради від наших експертів.
        </p>
      </header>

      {news.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
          <p className="text-slate-400">Наразі новин немає. Заходьте пізніше!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {news.map((item) => (
              <Link 
                key={item.id} 
                to={`/news/${item.id}`} 
                className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-50 relative">
                  <img 
                    src={item.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={item.title} 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Calendar size={14} />
                    {new Date(item.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h2>

                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    Читати далі 
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-100">
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 1}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    meta.page === page 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                      : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
