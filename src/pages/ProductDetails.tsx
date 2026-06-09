import { useEffect, useState } from 'react';
// 1. Додаємо useNavigate до імпорту
import { useParams, useNavigate } from 'react-router-dom'; 
import { ChevronLeft, ShoppingBag, Check, Settings2 } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import api from '../api';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // 2. Ініціалізуємо хук
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get<Product>(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setActiveImage(res.data.main_image);
      });
  }, [id]);

  useEffect(() => {
    if (product) {
      const savedIds = localStorage.getItem('recentlyViewed');
      let viewedIds: number[] = savedIds ? JSON.parse(savedIds) : [];

      viewedIds = viewedIds.filter(id => id !== product.id);
      viewedIds.unshift(product.id);
      viewedIds = viewedIds.slice(0, 10);

      localStorage.setItem('recentlyViewed', JSON.stringify(viewedIds));
    }
  }, [product]);

  if (!product) return <div className="p-10 text-center text-slate-400">Завантаження...</div>;

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* 3. Замінюємо Link на button з navigate(-1) */}
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium bg-transparent border-none p-0 cursor-pointer"
      >
        <ChevronLeft size={18} />
        <span>Назад до каталогу</span>
      </button>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Решта коду без змін... */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
            {activeImage ? (
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain p-4 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                <ShoppingBag size={48} />
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img ? "border-indigo-600 scale-95" : "border-slate-100 opacity-70"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="Preview" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-4">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {product.category_name}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mt-3 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="mb-6">
            {product.isOnSale && product.salePrice ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl md:text-4xl font-black text-red-600">
                    {product.salePrice.toLocaleString()} ₴
                  </span>
                  <span className="text-lg text-slate-400 line-through">
                    {product.price.toLocaleString()} ₴
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                  Економія: {(product.price - product.salePrice).toLocaleString()} ₴ 
                  ({Math.round(((product.price - product.salePrice) / product.price) * 100)}%)
                </div>
              </div>
            ) : (
              <p className="text-2xl md:text-3xl font-black text-indigo-600">
                {product.price.toLocaleString()} ₴
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 mb-6">
            <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider">Опис товару</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {product.description || "Технічний опис товару наразі оновлюється."}
            </p>
          </div>

          {product.characteristics && product.characteristics.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-100 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Характеристики</h3>
              </div>
              <div className="space-y-3">
                {product.characteristics.map((char, index) => (
                  <div key={index} className="flex justify-between items-end gap-4 text-sm border-b border-slate-200 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-slate-500">{char.name}</span>
                    <div className="flex-1 border-b border-dotted border-slate-300 mb-1"></div>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      {char.value} {char.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 ${
              isAdded 
              ? "bg-green-500 text-white" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={24} /> Додано у кошик
              </>
            ) : (
              <>
                <ShoppingBag size={24} /> Додати у кошик
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};