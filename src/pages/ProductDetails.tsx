import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import api from '../api';

export const ProductDetails = () => {
  const { id } = useParams();
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

  if (!product) return <div className="p-10 text-center text-slate-400">Завантаження...</div>;

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/catalog" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium">
        <ChevronLeft size={18} />
        <span>Назад до каталогу</span>
      </Link>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Галерея: зверху на мобільних */}
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
          {/* Мініатюри: горизонтальний скрол якщо їх багато */}
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

        {/* Інформація */}
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
            <p className="text-2xl md:text-3xl font-black text-indigo-600">
              {product.price.toLocaleString()} ₴
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 mb-8">
            <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider">Опис товару</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {product.description || "Ми гарантуємо високу якість продукції та повну відповідність ГОСТ/ДСТУ. Всі товари проходять технічний контроль перед відправкою."}
            </p>
          </div>

          {/* Фіксована кнопка на мобільних (опціонально) або просто велика кнопка */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 ${
              isAdded 
              ? "bg-green-500 text-white" 
              : "bg-indigo-600 text-white hover:bg-indigo-700"
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

          <div className="mt-8 border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Доставка</p>
              <p className="text-xs font-semibold text-slate-900">По всій Україні</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Оплата</p>
              <p className="text-xs font-semibold text-slate-900">ПДВ / Готівка</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};