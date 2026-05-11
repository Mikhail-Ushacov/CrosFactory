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
      })
      .catch(err => console.error("Ошибка загрузки товара:", err));
  }, [id]);

  useEffect(() => {
    if (product) {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Видаляємо дублікат, якщо він є, і додаємо в початок
      const updatedViewed = [product.id, ...viewed.filter((id: number) => id !== product.id)].slice(0, 5);
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
    }
  }, [product]);


  if (!product) return <div className="p-10 text-center">Загрузка...</div>;

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl">
      <Link to="/catalog" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ChevronLeft size={20} />
        <span>Назад к каталогу</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Галерея изображений */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img ? "border-indigo-600 scale-95" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Инфо о товаре */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {product.category_name}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 mt-4 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="mb-8">
            <p className="text-3xl font-black text-indigo-600">
              {product.price.toLocaleString()} ₽
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-slate-900 mb-2">Описание</h3>
            <p className="text-slate-600 leading-relaxed">
              {product.description || "У этого товара пока нет подробного описания. Но мы гарантируем высокое качество и быструю доставку!"}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              isAdded 
              ? "bg-green-500 text-white shadow-green-100" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={24} /> Добавлено в корзину
              </>
            ) : (
              <>
                <ShoppingBag size={24} /> Добавить в корзину
              </>
            )}
          </button>

          <div className="mt-8 border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
            <div className="text-sm">
              <p className="text-slate-400">Доставка</p>
              <p className="font-medium text-slate-900">Бесплатно от 5000 ₽</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-400">Возврат</p>
              <p className="font-medium text-slate-900">В течение 14 дней</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};