import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Tag, Loader2, ArrowLeft } from 'lucide-react';
import api from '../api';

export const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/news/${id}`)
      .then(res => setItem(res.data))
      .catch(() => navigate('/news'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Назад
      </button>

      <article className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="aspect-video w-full bg-slate-100">
          <img 
            src={item.images[0]} 
            className="w-full h-full object-cover" 
            alt={item.title} 
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
              <Tag size={14} /> {item.tag}
            </span>
            <span className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <Calendar size={14} /> {new Date(item.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
            {item.title}
          </h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-xl text-slate-500 font-medium mb-8 italic leading-relaxed border-l-4 border-indigo-200 pl-6">
              {item.description}
            </p>
            
            <div className="text-slate-700 leading-loose text-lg whitespace-pre-line">
              {item.text}
            </div>
          </div>

          {/* Галерея додаткових фото, якщо є */}
          {item.images.length > 1 && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
              {item.images.slice(1).map((img: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100">
                  <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery" />
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
};