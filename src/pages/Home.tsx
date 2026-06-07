import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Star, Clock, 
  Phone, Mail, ShoppingBag, 
  Newspaper, Search, X, ArrowRight, Layers, Loader2 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product, Category } from '../types';
import api from '../api';

// Інтерфейси даних
interface Banner {
  id: number;
  title: string;
  description: string;
  text: string;
  images: string[];
  products?: { id: number }[];
  categories?: { id: number }[];
}

interface NewsItem {
  id: number;
  title: string;
  description: string;
  text: string;
  date: string;
  tag: string;
  images: string[];
}

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- ЛОГІКА СЛАЙДЕРА ---

  const nextSlide = useCallback(() => {
    setCurrentSlide((s) => (banners.length > 0 ? (s === banners.length - 1 ? 0 : s + 1) : 0));
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((s) => (banners.length > 0 ? (s === 0 ? banners.length - 1 : s - 1) : 0));
  }, [banners.length]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(nextSlide, 6000);
    }
  }, [banners.length, nextSlide]);

  // Завантаження даних
  useEffect(() => {
    const loadAllData = async () => {
  try {
    const [resProducts, resCategories, resBanners, resNews] = await Promise.all([
      api.get('/products'),
      api.get('/categories'),
      api.get('/banners'),
      api.get('/news')
    ]);

    setProducts(resProducts.data);
    setCategories(resCategories.data);
    setBanners(resBanners.data);
    setNews(resNews.data);

    // Отримуємо ID переглянутих товарів
    const savedIds = localStorage.getItem('recentlyViewed');
    if (savedIds) {
      const viewedIds: number[] = JSON.parse(savedIds);
      
      // Створюємо масив об'єктів товарів у тому ж порядку, що й ID
      const viewedProducts = viewedIds
        .map(id => resProducts.data.find((p: Product) => p.id === id))
        .filter(Boolean); // Видаляємо undefined, якщо товар було видалено з бази
        
      setRecentlyViewed(viewedProducts);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

    loadAllData();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Запуск таймера при зміні банерів
  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners, startTimer]);

  // --- ЛОГІКА СВАЙПІВ ---
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStart.current - touchEnd.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      startTimer();
    }
  };

  // --- ПОШУК ---
  const suggestedProducts = searchQuery.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const suggestedCategories = searchQuery.trim().length > 1
    ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBannerLink = (banner: Banner) => {
    if (banner.products && banner.products.length > 0) {
      return `/product/${banner.products[0].id}`;
    }
    if (banner.categories && banner.categories.length > 0) {
      return `/catalog?category=${banner.categories[0].id}`;
    }
    return "/catalog"; // Посилання за замовчуванням
  };

  const productOfTheDay = products[0];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="font-medium">Завантаження головної сторінки...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-10">
      
      {/* 1. Пошукова секція */}
      <section className="max-w-2xl mx-auto px-4 w-full relative z-50" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Швидкий пошук товарів або категорій..."
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-base shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          )}
        </form>

        {isSearchOpen && searchQuery.trim().length > 1 && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            {(suggestedProducts.length > 0 || suggestedCategories.length > 0) ? (
              <div className="py-2">
                {suggestedCategories.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Категорії</div>
                    {suggestedCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { navigate(`/catalog?category=${cat.id}`); setIsSearchOpen(false); }}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-indigo-50 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Layers size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 flex-1">
                          Перейти до <span className="text-indigo-600 group-hover:text-indigo-700">"{cat.name}"</span>
                        </h4>
                        <ArrowRight size={16} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}

                {suggestedProducts.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-50">Товари</div>
                    {suggestedProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { navigate(`/product/${p.id}`); setIsSearchOpen(false); }}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                          <img src={p.main_image} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{p.name}</h4>
                          <p className="text-xs text-indigo-600 font-bold">{p.price} ₴</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                Нічого не знайдено за запитом "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Карусель Банерів */}
      {banners.length > 0 && (
        <section 
          className="relative h-64 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {banners.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center ${
                index === currentSlide 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 invisible" // Спрощено для стабільності
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
              <img src={slide.images[0]} className="absolute inset-0 w-full h-full object-cover" alt={slide.title} />
              
              <div className="relative px-8 md:px-16 text-white max-w-2xl z-20">
                <h1 className="text-2xl md:text-5xl font-black mb-3 leading-tight animate-in slide-in-from-left duration-700">
                  {slide.title}
                </h1>
                <p className="text-sm md:text-xl text-slate-200 mb-6 md:mb-10 line-clamp-2">
                  {slide.description}
                </p>
                
                {/* ВИПРАВЛЕНО: Динамічне посилання */}
                <Link 
                  to={getBannerLink(slide)} 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 hover:scale-105 transition-all inline-block shadow-lg shadow-indigo-500/30"
                >
                  {slide.text || "Перейти до каталогу"}
                </Link>
              </div>
            </div>
          ))}

          
          {banners.length > 1 && (
            <>
              <button onClick={() => { prevSlide(); startTimer(); }} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 p-3 rounded-full text-white backdrop-blur-md z-30 transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft size={24} />
              </button>
              <button onClick={() => { nextSlide(); startTimer(); }} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 p-3 rounded-full text-white backdrop-blur-md z-30 transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => { setCurrentSlide(i); startTimer(); }} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-8 bg-indigo-500" : "w-2 bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* 3. Товар дня */}
      {productOfTheDay && (
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col md:grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
              <div className="flex items-center gap-2 text-orange-500 mb-4 font-bold text-xs uppercase tracking-[0.2em]">
                <Star size={16} fill="currentColor" /> Товар дня
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-slate-900">{productOfTheDay.name}</h2>
              <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed">{productOfTheDay.description}</p>
              
              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-3xl md:text-4xl font-black text-indigo-600">{productOfTheDay.price} ₴</span>
                <span className="text-slate-300 line-through text-lg">{(productOfTheDay.price * 1.15).toFixed(0)} ₴</span>
              </div>
              
              <button 
                onClick={() => addToCart(productOfTheDay)}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 w-fit cursor-pointer"
              >
                <ShoppingBag size={20} /> Додати в кошик
              </button>
            </div>
            
            <div className="bg-slate-50 relative aspect-square md:aspect-auto order-1 md:order-2 flex items-center justify-center p-12">
                <img src={productOfTheDay.main_image} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt="Hot deal" />
                <div className="absolute top-8 right-8 bg-red-500 text-white px-4 py-2 rounded-2xl font-black text-lg shadow-lg rotate-12">
                    -15%
                </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Нещодавно переглянуті */}
      {recentlyViewed.length > 0 && (
        <section className="px-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" /> Ви нещодавно дивились
            </h3>
            <button onClick={() => {localStorage.removeItem('recentlyViewed'); setRecentlyViewed([])}} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors cursor-pointer">Очистити</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed.slice(0, 6).map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-slate-50">
                  <img src={p.main_image} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" alt={p.name} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate mb-1">{p.name}</h4>
                <p className="text-indigo-600 font-black text-sm">{p.price} ₴</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Контакти та Новини */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-indigo-100 px-5 py-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
                <Newspaper size={24} className="text-white" />
              </div>

              <div>
                <span className="text-xl font-bold text-gray-800">
                  Новини компанії
                </span>
              </div>
            </div>

            <Link
              to="/news"
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
            >
              Переглянути
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </h3>
          <div className="space-y-4">
            {news.length > 0 ? [...news]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Сортування за датою (нові зверху)
              .slice(0, 2) // Відображаємо лише 2 новини
              .map(item => (
              <Link 
                key={item.id} 
                to={`/news/${item.id}`} 
                className="block bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                  Читати далі <ArrowRight size={12} />
                </div>
              </Link>
            )) : (
              <p className="text-slate-400 text-sm px-2">Новин поки немає</p>
            )}
          </div>
          
          <div className="flex gap-4 px-2">
            <a href="#" className="w-12 h-12 bg-white text-slate-900 border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><FacebookIcon /></a>
            <a href="#" className="w-12 h-12 bg-white text-slate-900 border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><InstagramIcon /></a>
          </div>
        </div>
        
        {/* Контакти */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -z-0" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-6">Виникли питання?</h3>
                    <p className="text-slate-400 mb-8 text-sm md:text-base">Наші спеціалісти допоможуть підібрати правильний метиз для ваших потреб та розрахують вартість доставки.</p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Гаряча лінія</p>
                                <p className="font-bold text-lg">+38 067 000 00 00</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Відділ продажу</p>
                                <p className="font-bold text-lg">info@metiz.zp.ua</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/10">
                    <h4 className="font-bold mb-6 flex items-center gap-2">Швидка консультація</h4>
                    <div className="space-y-4">
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all" placeholder="Ваше ім'я" />
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all" placeholder="Телефон або Email" />
                      <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm h-28 resize-none outline-none focus:border-indigo-500 focus:bg-white/10 transition-all" placeholder="Чим ми можемо допомогти?"></textarea>
                      <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer">
                        Надіслати запит
                      </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};