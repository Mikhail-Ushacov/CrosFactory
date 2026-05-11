import { useEffect, useState, useMemo } from 'react';
import type { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Пагінація
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  // Фільтрація за категорією
  const filteredAll = useMemo(() => {
    return activeCategory === 'all' 
      ? products 
      : products.filter(p => p.category_slug === activeCategory);
  }, [products, activeCategory]);

  // Розрахунок сторінок
  const totalPages = Math.ceil(filteredAll.length / itemsPerPage);
  
  // Отримуємо товари саме для поточної сторінки
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAll.slice(start, start + itemsPerPage);
  }, [filteredAll, currentPage, itemsPerPage]);

  // Скидання на 1 сторінку при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Плавний скрол вгору при зміні сторінки
  };

  const handleShowMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Компонент кнопок пагінації
  const PaginationNav = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
              currentPage === page
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Каталог товарів</h1>
        
        {/* Фільтр категорій */}
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeCategory === 'all' ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            Всі товари
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                activeCategory === cat.slug ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Верхня панель інфо */}
        <div className="flex flex-col sm:row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
          <div className="text-sm text-slate-500">
            Сторінка <span className="font-bold text-slate-900">{currentPage}</span> з {totalPages}
            <span className="mx-3 text-slate-300">|</span>
            Товари <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAll.length)}</span> із {filteredAll.length}
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500">Показувати по:</label>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block p-2 pr-8 cursor-pointer outline-none"
              >
                {[4, 8, 12, 16, 24, 48].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Сітка товарів */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12">
        {currentItems.map(product => (
          <div key={product.id} className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-2 md:p-3 hover:shadow-xl transition-all group flex flex-col">
            <Link to={`/product/${product.id}`} className="flex-1">
              <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 bg-slate-50">
                <img 
                  src={product.main_image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={product.name}
                />
              </div>
              <div className="px-1 md:px-2">
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {product.category_name}
                </span>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
              </div>
            </Link>
            
            <div className="px-1 md:px-2 flex items-center justify-between mt-3">
              <span className="font-bold text-indigo-600 text-sm md:text-base">
                {product.price.toLocaleString()} ₴
              </span>
              <button 
                onClick={() => addToCart(product)}
                className="bg-slate-100 text-slate-900 p-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Нижня навігація */}
      <div className="mt-12 flex flex-col items-center gap-8">
        {currentPage < totalPages && (
          <button
            onClick={handleShowMore}
            className="group flex items-center gap-2 px-10 py-4 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            Показати ще {Math.min(itemsPerPage, filteredAll.length - (currentPage * itemsPerPage))} товарів
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
        
        <div className="w-full border-t border-slate-100 pt-8 flex flex-col items-center gap-4">
          <PaginationNav />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            Сторінка {currentPage} з {totalPages}
          </p>
        </div>
      </div>
    </div>
  );
};