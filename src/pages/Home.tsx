import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Star, Clock, 
  Phone, Mail, ShoppingBag, 
  Newspaper, Send,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import api from '../api';

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
      title: "Якісний Метиз",
      desc: "Надійне кріплення для вашого будівництва",
      bg: "bg-indigo-600",
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000"
    },
    {
      title: "Швидка Доставка",
      desc: "Власна логістика по всій області",
      bg: "bg-slate-900",
      img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  const news = [
    { id: 1, date: "10.05", title: "Нове надходження сталевого дроту", tag: "Новини" },
    { id: 2, date: "08.05", title: "Знижки для постійних клієнтів", tag: "Акція" },
  ];

  useEffect(() => {
    api.get('/products').then(res => {
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
    <div className="space-y-8 md:space-y-16 pb-10">
      
      {/* 1. Карусель - Адаптивна висота */}
      <section className="relative h-64 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg">
        {slides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
            <div className={`absolute inset-0 ${slide.bg} opacity-70 z-0`}></div>
            <img src={slide.img} className="absolute inset-0 w-full h-full object-cover -z-10" alt="Slide" />
            <div className="relative px-6 md:px-12 text-white max-w-xl z-10">
              <h1 className="text-2xl md:text-5xl font-black mb-2 md:mb-4 leading-tight">{slide.title}</h1>
              <p className="text-sm md:text-xl text-indigo-50 mb-4 md:mb-8">{slide.desc}</p>
              <Link to="/catalog" className="bg-white text-indigo-600 px-6 py-2 md:px-8 md:py-3 rounded-xl font-bold hover:scale-105 transition-transform inline-block text-sm md:text-base">
                До каталогу
              </Link>
            </div>
          </div>
        ))}
        <button onClick={() => setCurrentSlide(s => s === 0 ? slides.length - 1 : s - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white backdrop-blur-sm z-20">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setCurrentSlide(s => s === slides.length - 1 ? 0 : s + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white backdrop-blur-sm z-20">
          <ChevronRight size={20} />
        </button>
      </section>

      {/* 2. Товар дня - Стек на мобільних */}
      {productOfTheDay && (
        <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="flex flex-col md:grid md:grid-cols-2">
            <div className="p-6 md:p-10 flex flex-col justify-center order-2 md:order-1">
              <div className="flex items-center gap-2 text-orange-500 mb-3 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                <Star size={16} fill="currentColor" /> Товар дня
              </div>
              <h2 className="text-xl md:text-3xl font-bold mb-3">{productOfTheDay.name}</h2>
              <p className="text-slate-500 mb-4 md:mb-6 line-clamp-2 text-sm">{productOfTheDay.description}</p>
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                <span className="text-2xl md:text-3xl font-black text-indigo-600">{productOfTheDay.price} ₴</span>
                <span className="text-slate-300 line-through text-sm md:text-lg">{(productOfTheDay.price * 1.2).toFixed(0)} ₴</span>
              </div>
              <button 
                onClick={() => addToCart(productOfTheDay)}
                className="bg-indigo-600 text-white px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg w-full md:w-fit"
              >
                <ShoppingBag size={20} /> Купити
              </button>
            </div>
            <div className="bg-slate-50 relative aspect-square md:aspect-auto order-1 md:order-2">
                <img src={productOfTheDay.main_image} className="w-full h-full object-contain p-6 md:p-10" alt="Product of the day" />
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg font-black text-sm shadow-lg">
                    -20%
                </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Контакти - Стек на мобільних */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 px-2"><Newspaper size={20} className="text-indigo-600" /> Останні новини</h3>
          <div className="space-y-3">
            {news.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{item.tag}</span>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {item.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4">Зв'яжіться з нами</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase">Телефон</p>
                                <p className="font-bold text-sm md:text-base">+38 067 000 00 00</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase">Email</p>
                                <p className="font-bold text-sm md:text-base">info@metiz.zp.ua</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                    <h4 className="font-bold mb-3 text-sm">Зворотний зв'язок</h4>
                    <input className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 mb-2 text-sm outline-none focus:border-indigo-500" placeholder="Ваше ім'я" />
                    <textarea className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 mb-3 text-sm h-20 resize-none outline-none focus:border-indigo-500" placeholder="Повідомлення"></textarea>
                    <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm">Надіслати</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};