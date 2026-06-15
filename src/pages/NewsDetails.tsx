import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Tag, Loader2, ArrowLeft, Package, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import type { News, NewsBlock, Product } from '../types';

export const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [item, setItem] = useState<News | null>(null);
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
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-medium cursor-pointer"
      >
        <ArrowLeft size={20} /> Назад до новин
      </button>

      <article className="space-y-12">
        {/* Головна частина новини */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="aspect-video w-full bg-slate-100">
            {item.images && item.images[0] && (
              <img 
                src={item.images[0]} 
                className="w-full h-full object-cover" 
                alt={item.title} 
              />
            )}
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

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              {item.title}
            </h1>

            <p className="text-xl text-slate-500 font-medium mb-0 italic leading-relaxed border-l-4 border-indigo-200 pl-6">
              {item.description}
            </p>
          </div>
        </div>

        {/* ДИНАМІЧНІ БЛОКИ КОНТЕНТУ */}
        <div className="space-y-16">
          {item.contentBlocks?.map((block: NewsBlock, idx: number) => (
            <section key={block.id || idx} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Текст та заголовок блоку */}
              <div className="max-w-3xl mx-auto space-y-4">
                {block.title && (
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {block.title}
                  </h2>
                )}
                {block.text && (
                  <div className="text-slate-700 leading-loose text-lg whitespace-pre-line">
                    {block.text}
                  </div>
                )}
              </div>

              {/* Зображення блоку */}
              {block.images && block.images.length > 0 && (
                <div className={`grid gap-4 ${block.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {block.images.map((img: string, i: number) => (
                    <div key={i} className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={img} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" alt="" />
                    </div>
                  ))}
                </div>
              )}

              {/* Товари блоку */}
              {block.products && block.products.length > 0 && (
              <div className="bg-slate-50 rounded-[2.5rem] p-6 md:p-10 border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <Package size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Рекомендовані товари</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {block.products.map((product: Product) => (
                    <div key={product.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-slate-50 hover:shadow-xl hover:border-indigo-100 transition-all group">
                      
                      {/* Посилання через зображення */}
                      <Link to={`/product/${product.id}`} className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 block">
                        <img 
                          src={product.main_image} 
                          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                          alt={product.name} 
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* Посилання через назву */}
                        <Link to={`/product/${product.id}`} className="block">
                          <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        
                        <p className="text-indigo-600 font-black">{product.price} ₴</p>
                        
                        <div className="flex gap-2 mt-2">
                          <Link 
                            to={`/product/${product.id}`}
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 transition-colors"
                          >
                            Дивитися характеристики <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>

                      {/* Кнопка купити (залишається окремою дією) */}
                      <button 
                        onClick={() => addToCart(product)}
                        className="p-3 bg-slate-50 text-slate-900 rounded-xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-indigo-200"
                        title="Додати в кошик"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </section>
          ))}
        </div>
      </article>

      {/* Футер статті */}
      <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
        <Link 
          to="/news" 
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
        >
          <ArrowLeft size={20} /> Повернутися до всіх новин
        </Link>
      </footer>
    </div>
  );
};