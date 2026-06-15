import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { Loader2 } from 'lucide-react';
import type { Banner, Product } from '../types';

interface PromotionBanner extends Banner {
  allLinkedProducts?: Product[];
}

export const PromotionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [banner, setBanner] = useState<PromotionBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/banners/${id}`)
      .then(res => setBanner(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (!banner) return null;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Кнопка назад */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 font-bold transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} /> Назад
      </button>

      {/* 1. Малюнок з банера (Hero Section) */}
      <div className="relative h-64 md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl mb-12">
        <img 
          src={banner.images[0]} 
          className="w-full h-full object-cover" 
          alt={banner.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
            {banner.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl font-medium">
            {banner.description}
          </p>
        </div>
      </div>

      {/* 2. Текст банера (якщо є) */}
      {banner.text && banner.text !== banner.title && (
         <div className="max-w-3xl mb-12">
            <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-lg mb-4">
                Спеціальна пропозиція
            </div>
            <div className="text-xl text-slate-600 leading-relaxed italic border-l-4 border-indigo-200 pl-6">
                {banner.text}
            </div>
         </div>
      )}

      {/* 3. Список товарів */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Товари акції
          </h2>
          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-bold">
            {banner.allLinkedProducts?.length || 0}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {banner.allLinkedProducts?.map((product: Product) => (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-100 p-4 hover:shadow-xl transition-all group flex flex-col relative">
              
              {product.isOnSale && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                  Sale
                </div>
              )}

              <Link to={`/product/${product.id}`} className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 block">
                <img 
                  src={product.main_image || '/placeholder.png'} 
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                  alt={product.name} 
                />
              </Link>

              <div className="flex-1">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  {product.isOnSale && product.salePrice ? (
                    <>
                      <p className="text-[10px] text-slate-400 line-through leading-none">{product.price} ₴</p>
                      <p className="text-lg font-black text-red-600">{product.salePrice} ₴</p>
                    </>
                  ) : (
                    <p className="text-lg font-black text-slate-900">{product.price} ₴</p>
                  )}
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-90"
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!banner.allLinkedProducts || banner.allLinkedProducts.length === 0) && (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Товари тимчасово відсутні</p>
          </div>
        )}
      </section>
    </div>
  );
};