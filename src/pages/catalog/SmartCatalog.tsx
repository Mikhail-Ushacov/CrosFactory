import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, ChevronRight, Filter, 
  Package, ShoppingBag, ArrowLeft,
  X, ArrowUpDown, LayoutGrid 
} from 'lucide-react';
import { useSmartCatalog } from './useSmartCatalog';

/**
 * Допоміжний компонент для подвійного повзунка.
 * Забезпечує плавність ходу (локальний стейт) та 
 * оновлення результатів тільки після завершення вибору.
 */
const RangeFilterItem = ({ 
  filterKey, 
  data, 
  initialValues, 
  onCommit 
}: any) => {
  const [tempValues, setTempValues] = useState(initialValues);

  // Оновлюємо локальні значення, якщо параметри скинуті ззовні
   useEffect(() => {
    setTempValues(initialValues);
  }, [initialValues]);

  const minP = ((tempValues[0] - data.min) / (data.max - data.min)) * 100;
  const maxP = ((tempValues[1] - data.min) / (data.max - data.min)) * 100;

  const handleCommit = () => {
    onCommit(filterKey, tempValues[0], tempValues[1]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
          {data.displayName}
        </h4>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {data.unit}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={tempValues[0]}
          onChange={(e) => setTempValues([Math.min(Number(e.target.value), tempValues[1]), tempValues[1]])}
          onBlur={handleCommit}
          className="w-full bg-white border border-slate-200 rounded-2xl p-2 text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <span className="text-slate-300">—</span>
        <input
          type="number"
          value={tempValues[1]}
          onChange={(e) => setTempValues([tempValues[0], Math.max(Number(e.target.value), tempValues[0])])}
          onBlur={handleCommit}
          className="w-full bg-white border border-slate-200 rounded-2xl p-2 text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="relative h-10 flex items-center range-slider-container">
        {/* Підкладка */}
        <div className="absolute w-full h-1 bg-slate-100 rounded-full" />
        
        {/* Активна лінія (зелена) */}
        <div 
          className="absolute h-1 bg-indigo-500 rounded-full"
          style={{ 
            left: `${Math.max(0, minP)}%`, 
            right: `${Math.max(0, 100 - maxP)}%` 
          }}
        />

        <input
          type="range"
          min={data.min}
          max={data.max}
          value={tempValues[0]}
          step={1}
          onChange={(e) => setTempValues([Math.min(Number(e.target.value), tempValues[1] - 1), tempValues[1]])}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="range-input absolute w-full appearance-none bg-transparent pointer-events-none"
        />

        <input
          type="range"
          min={data.min}
          max={data.max}
          value={tempValues[1]}
          step={1}
          onChange={(e) => setTempValues([tempValues[0], Math.max(Number(e.target.value), tempValues[0] + 1)])}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="range-input absolute w-full appearance-none bg-transparent pointer-events-none"
        />
      </div>
    </div>
  );
};

export const SmartCatalog = () => {
  const {
    categorySlug,
    categories,
    selectedCategory,
    loading,
    currentItems,
    filteredProducts,
    totalPages,
    currentPage,
    meta,
    dynamicFilters,
    addToCart,
    navigate,
    updateRangeFilter,
    clearFilters,
    sortOrder,
    handleSortChange,
    itemsPerPage,
    handleLimitChange,
    isSidebarOpen,
    setIsSidebarOpen,
    searchParams
  } = useSmartCatalog();

  // Вигляд "Всі розділи"
  if (!categorySlug) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Layers size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Розумний каталог</h1>
          <p className="text-slate-500 mt-2">Оберіть розділ товарів</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/smart-catalog/${cat.slug}`)}
              className="group bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-indigo-500 hover:shadow-xl transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{cat._count?.products || 0} товарів</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const FiltersContent = () => (
    <div className="space-y-8">
      {Object.entries(dynamicFilters).map(([key, data]) => {
        const currentVal = searchParams.get(`range_${key}`)?.split('-').map(Number) || [data.min, data.max];
        return (
          <RangeFilterItem 
            key={key}
            filterKey={key}
            data={data}
            initialValues={currentVal}
            onCommit={updateRangeFilter}
          />
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Шапка каталогу */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate('/smart-catalog')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-2"
          >
            <ArrowLeft size={18} /> Всі розділи
          </button>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            {selectedCategory?.name} 
            <span className="bg-slate-100 text-slate-500 text-sm py-1 px-3 rounded-full">
              {meta.total}
            </span>
          </h2>
        </div>

        {/* Кнопка фільтрів для мобілки */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          <Filter size={20} /> Фільтри та сортування
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Панель керування на десктопі */}
          <div className="hidden lg:flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className="text-slate-400" />
                <select 
                  value={sortOrder} 
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-sm font-bold border-none focus:ring-0 cursor-pointer bg-transparent text-slate-700"
                >
                  <option value="default">Сортування за замовчуванням</option>
                  <option value="cheap">Від дешевих до дорогих</option>
                  <option value="expensive">Від дорогих до дешевих</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-slate-400" />
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="text-sm font-bold border-none focus:ring-0 cursor-pointer bg-transparent text-slate-700"
                >
                  <option value="6">По 6 товарів</option>
                  <option value="12">По 12 товарів</option>
                  <option value="24">По 24 товари</option>
                </select>
              </div>
            </div>
            {searchParams.size > 1 && (
              <button 
                onClick={clearFilters}
                className="text-xs font-bold text-red-500 uppercase hover:underline"
              >
                Скинути все
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentItems.map(p => (
                  <div key={p.id} className="bg-white rounded-4xl border border-slate-100 p-5 flex gap-6 hover:shadow-xl transition-all group relative overflow-hidden">
                    {p.isOnSale && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                        Sale
                      </div>
                    )}
                    
                    <Link to={`/product/${p.id}`} className="w-28 h-28 md:w-32 md:h-32 bg-slate-50 rounded-2xl overflow-hidden shrink-0 block">
                      <img 
                        src={p.main_image || '/placeholder.png'} 
                        alt={p.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                      />
                    </Link>

                    <div className="flex-1 flex flex-col">
                      <Link to={`/product/${p.id}`} className="hover:text-indigo-600 transition-colors">
                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">{p.name}</h4>
                      </Link>
                      
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                        {p.characteristics?.slice(0, 3).map((c: any, i: number) => (
                          <span key={i} className="text-[10px] font-bold text-slate-400 uppercase">
                            {c.name}: {c.value}{c.unit}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                          {p.isOnSale && p.salePrice ? (
                            <>
                              <span className="text-xs text-slate-400 line-through leading-none">{p.price} ₴</span>
                              <span className="text-xl font-black text-red-500">{p.salePrice} ₴</span>
                            </>
                          ) : (
                            <span className="text-xl font-black text-slate-900">{p.price} ₴</span>
                          )}
                        </div>
                        <button 
                          onClick={() => addToCart(p)}
                          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                          <ShoppingBag size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                  <Package size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">Нічого не знайдено</p>
                  <button onClick={clearFilters} className="mt-4 text-indigo-600 font-bold hover:underline">Скинути фільтри</button>
                </div>
              )}

              {/* Пагінація */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('page', page.toString());
                        navigate(`?${newParams.toString()}`);
                      }}
                      className={`w-12 h-12 rounded-2xl font-bold transition-all ${
                        currentPage === page 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                        : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Сайдбар Desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-4xl border border-slate-100 p-8 sticky top-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-50">
              <Filter size={20} className="text-indigo-600" />
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Фільтри</h3>
            </div>
            <FiltersContent />
          </div>
        </aside>

        {/* Мобільний Drawer (Сайдбар справа) */}
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          
          <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Параметри</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                {/* Сортування в мобільному меню */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Сортувати:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { val: 'default', label: 'За замовчуванням' },
                      { val: 'cheap', label: 'Від дешевих' },
                      { val: 'expensive', label: 'Від дорогих' }
                    ].map(s => (
                      <button 
                        key={s.val}
                        onClick={() => handleSortChange(s.val)}
                        className={`p-4 rounded-2xl text-left text-sm font-bold transition-all ${
                          sortOrder === s.val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Фільтри */}
                <div className="pt-4 border-t border-slate-50">
                  <FiltersContent />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t grid grid-cols-2 gap-3">
                <button 
                  onClick={clearFilters}
                  className="p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 text-sm hover:bg-slate-100"
                >
                  Скинути
                </button>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-4 bg-indigo-600 rounded-2xl font-bold text-white text-sm shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};