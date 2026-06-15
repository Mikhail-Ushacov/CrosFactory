import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product, Category, PaginatedResponse } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, ChevronDown, ChevronLeft, ChevronRight, Search, X, Package } from 'lucide-react';
import api from '../api';
import { useDebounce } from '../hooks/useDebounce';

export const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const activeCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = parseInt(searchParams.get('limit') || '12', 10);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { addToCart } = useCart();

  useEffect(() => {
    api.get<PaginatedResponse<Category>>('/categories').then(res => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery !== (searchParams.get('search') || '')) {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearchQuery) {
        newParams.set('search', debouncedSearchQuery);
      } else {
        newParams.delete('search');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
  }, [debouncedSearchQuery, searchParams, setSearchParams]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {
      page: currentPage.toString(),
      limit: itemsPerPage.toString()
    };

    if (activeCategory !== 'all') params.category = activeCategory;
    if (searchParams.get('search')) params.search = searchParams.get('search')!;

    api.get<PaginatedResponse<Product>>('/products', { params })
      .then(res => {
        setProducts(res.data.data);
        setMeta(res.data.meta);
      })
      .finally(() => setLoading(false));
  }, [searchParams, activeCategory, currentPage, itemsPerPage]);

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowMore = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', (itemsPerPage + 12).toString());
    setSearchParams(newParams);
  };

  const handleItemsPerPageChange = (limit: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', limit.toString());
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const PaginationNav = () => {
    if (meta.totalPages <= 1) return null;
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={meta.page === 1}
          className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              meta.page === page ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={meta.page === meta.totalPages}
          className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <header className="mb-6 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Каталог товарів</h1>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Пошук товарів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap mb-6">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 cursor-pointer ${
              activeCategory === 'all' ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            Всі товари
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(String(cat.id))}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 cursor-pointer ${
                activeCategory === String(cat.id) ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
          <div className="text-sm text-slate-500">
            {meta.total > 0 ? (
              <>
                Сторінка <span className="font-bold text-slate-900">{meta.page}</span> з {meta.totalPages}
                <span className="mx-3 text-slate-300">|</span>
                Товари <span className="font-bold text-slate-900">{(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)}</span> із {meta.total}
              </>
            ) : (
              "Товарів не знайдено"
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500">Показувати по:</label>
            <div className="relative">
              <select
                value={meta.limit}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block p-2 pr-8 cursor-pointer outline-none"
              >
                {[12, 24, 48, 96].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {loading ? (
         <div className="flex justify-center py-20">
           <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
         </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Search size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Нічого не знайдено</h3>
          <p className="text-slate-500">Спробуйте змінити запит або категорію</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              handleCategoryChange('all');
            }}
            className="mt-4 text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Скинути всі фільтри
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-2 md:p-3 hover:shadow-xl transition-all group flex flex-col relative">
              {product.isOnSale && product.salePrice && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                  -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                </div>
              )}

              <Link to={`/product/${product.id}`} className="flex-1">
                <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 bg-slate-50">
                  {product.main_image ? (
                  <img 
                    src={product.main_image} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={product.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <Package size={48} />
                  </div>
                )}
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
                <div className="flex flex-col">
                  {product.isOnSale && product.salePrice ? (
                    <>
                      <span className="text-[10px] md:text-xs text-slate-400 line-through decoration-red-400">
                        {product.price.toLocaleString()} ₴
                      </span>
                      <span className="font-bold text-red-600 text-sm md:text-base">
                        {product.salePrice.toLocaleString()} ₴
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-indigo-600 text-sm md:text-base">
                      {product.price.toLocaleString()} ₴
                    </span>
                  )}
                </div>
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
      )}

      {products.length > 0 && !loading && (
        <div className="mt-12 flex flex-col items-center gap-8">
          {meta.page < meta.totalPages && (
            <button
              onClick={handleShowMore}
              className="group flex items-center gap-2 px-10 py-4 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              Показати ще {Math.min(meta.limit, meta.total - (meta.page * meta.limit))} товарів
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          <div className="w-full border-t border-slate-100 pt-8 flex flex-col items-center gap-4">
            <PaginationNav />
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              Сторінка {meta.page} з {meta.totalPages}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
