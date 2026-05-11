import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Star, Clock, 
  Phone, Mail, MapPin, ArrowRight, ShoppingBag, 
  Newspaper, Send, Globe, Camera, Share2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

// Створюємо маленькі компоненти для брендів, якщо Lucide їх не експортує
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();

  const slides = [
    {
      title: "Нова колекція кросівок",
      desc: "Отримайте знижку 20% на перше замовлення",
      bg: "bg-indigo-600",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000"
    },
    {
      title: "Професійне спорядження",
      desc: "Для тих, хто не знає компромісів",
      bg: "bg-slate-900",
      img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  const news = [
    { id: 1, date: "10.05", title: "Відкриття нового магазину у Львові", tag: "Подія" },
    { id: 2, date: "08.05", title: "Як правильно доглядати за взуттям", tag: "Поради" },
    { id: 3, date: "05.05", title: "CrosFactory партнер марафону", tag: "Новини" }
  ];

  useEffect(() => {
    axios.get('http://localhost:3001/api/products').then(res => {
      setProducts(res.data);
      const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = res.data.filter((p: Product) => viewedIds.includes(p.id));
      setRecentlyViewed(filtered);
    });

    const timer = setInterval(() => {
      setCurrentSlide(s => (s === slides.length - 1 ? 0 : s + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const productOfTheDay = products[0];

  return (
    <div className="space-y-16 pb-10">
      
      {/* 1. Карусель - Виправлено h-[400px] на h-100 */}
      <section className="relative h-100 rounded-3xl overflow-hidden shadow-2xl">
        {slides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
            <div className={`absolute inset-0 ${slide.bg} opacity-90`}></div>
            <img src={slide.img} className="absolute inset-0 w-full h-full object-cover -z-10" alt="Slide" />
            <div className="relative px-12 text-white max-w-xl">
              <h1 className="text-5xl font-black mb-4 leading-tight">{slide.title}</h1>
              <p className="text-xl text-indigo-100 mb-8">{slide.desc}</p>
              <Link to="/catalog" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform inline-block">
                До каталогу
              </Link>
            </div>
          </div>
        ))}
        <button onClick={() => setCurrentSlide(s => s === 0 ? slides.length - 1 : s - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 backdrop-blur-md transition-all">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => setCurrentSlide(s => s === slides.length - 1 ? 0 : s + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 backdrop-blur-md transition-all">
          <ChevronRight size={24} />
        </button>
      </section>

      {/* 2. Товар дня */}
      {productOfTheDay && (
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-orange-500 mb-4 font-bold text-sm uppercase tracking-widest">
                <Star size={18} fill="currentColor" /> Товар дня
              </div>
              <h2 className="text-3xl font-bold mb-4">{productOfTheDay.name}</h2>
              <p className="text-slate-500 mb-6 line-clamp-3">{productOfTheDay.description}</p>
              <div className="flex items-center gap-6 mb-8">
                <span className="text-3xl font-black text-indigo-600">{productOfTheDay.price} ₴</span>
                <span className="text-slate-300 line-through text-lg">{(productOfTheDay.price * 1.2).toFixed(0)} ₴</span>
              </div>
              <button 
                onClick={() => addToCart(productOfTheDay)}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 w-fit"
              >
                <ShoppingBag size={20} /> Встигнути купити
              </button>
            </div>
            <div className="bg-slate-50 relative aspect-square md:aspect-auto">
                <img src={productOfTheDay.main_image} className="w-full h-full object-contain p-10 hover:scale-105 transition-transform duration-700" alt="Product of the day" />
                <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-xl font-black shadow-lg">
                    -20%
                </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Новини та Контакти */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Newspaper size={20} className="text-indigo-600" /> Новини</h3>
          <div className="space-y-4">
            {news.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-wider">{item.tag}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={12}/> {item.date}</span>
                </div>
                <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-2xl font-bold mb-6">Зв'яжіться з нами</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Гаряча лінія</p>
                                <p className="font-bold">0 800 333 44 55</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Email</p>
                                <p className="font-bold">support@crosfactory.ua</p>
                            </div>
                        </div>
                    </div>
                    {/* Виправлені іконки соцмереж */}
                    <div className="flex gap-4 mt-8">
                        <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all"><InstagramIcon /></button>
                        <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all"><FacebookIcon /></button>
                        <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all"><Send size={20}/></button>
                    </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <h4 className="font-bold mb-4">Напишіть нам</h4>
                    <input className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 mb-3 outline-none focus:border-indigo-500 text-sm" placeholder="Ваше ім'я" />
                    <textarea className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 mb-4 outline-none focus:border-indigo-500 text-sm h-24 resize-none" placeholder="Повідомлення"></textarea>
                    <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">Відправити</button>
                </div>
            </div>
        </div>
      </div>

      {/* 4. Переглянуті товари */}
      {recentlyViewed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Ви нещодавно переглядали</h3>
            <div className="h-px bg-slate-100 flex-1 mx-8"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recentlyViewed.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="group">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 hover:shadow-xl transition-all">
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50">
                    <img src={product.main_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm truncate">{product.name}</h4>
                  <p className="text-indigo-600 font-black mt-1">{product.price} ₴</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};