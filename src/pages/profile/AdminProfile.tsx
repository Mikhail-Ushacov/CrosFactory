import { Link, useNavigate } from 'react-router-dom';
import { 
  Edit2, Trash2, PlusCircle, ShoppingCart, Users, 
  TrendingUp, Shield, Package, Search, 
  ChevronLeft, ChevronRight, Layers, Newspaper, Eye, EyeOff 
} from 'lucide-react';
import { useAdminProfile } from './useAdminProfile';
import type { Product, Category } from '../../types';

export const AdminProfile = () => {
  const navigate = useNavigate();
  const {
    loading, activeTab, setActiveTab,
    productSearch, setProductSearch,
    categorySearch, setCategorySearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    stats, newsCount, bannersCount, totalContentCount,
    paginatedProducts, filteredCategories,
    totalPages, handleDeleteProduct, handleDeleteCategory, handleToggleCategoryVisibility
  } = useAdminProfile();

  if (loading) return <div className="p-10 text-center text-slate-500">Завантаження...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      
      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Замовлень', val: stats.ordersCount, icon: <ShoppingCart size={18}/>, color: 'bg-blue-500' },
          { label: 'Клієнтів', val: stats.clientsCount, icon: <Users size={18}/>, color: 'bg-indigo-500' },
          { label: 'Дохід (міс.)', val: `${stats.income.toLocaleString()} ₴`, icon: <TrendingUp size={18}/>, color: 'bg-emerald-500' },
          { label: 'Статус', val: 'Admin', icon: <Shield size={18}/>, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
            <p className="text-xl font-black text-slate-900">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Картки вибору розділу */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <TabCard 
          title="Товари" 
          count={stats.productsCount} 
          subtitle="Управління асортиментом"
          icon={<Package />} 
          isActive={activeTab === 'products'} 
          onClick={() => setActiveTab('products')}
          colorClass="indigo"
        />
        <TabCard 
          title="Категорії" 
          count={stats.categoriesCount} 
          subtitle="Структура магазину"
          icon={<Layers />} 
          isActive={activeTab === 'categories'} 
          onClick={() => setActiveTab('categories')}
          colorClass="emerald"
        />
        <button 
          onClick={() => navigate('/admin/content')}
          className="p-6 rounded-3xl bg-white border-2 border-transparent shadow-sm hover:border-slate-200 transition-all text-left group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Newspaper size={20} />
            </div>
            {/* Відображаємо загальну кількість */}
            <span className="text-2xl font-black text-slate-900">{totalContentCount}</span>
          </div>
          <p className="font-bold text-slate-900">Управління контентом</p>
          <p className="text-xs text-slate-500 mt-1">
            {newsCount} новин + {bannersCount} банерів
          </p>
        </button>
      </div>

      {/* Панель керування */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'products' ? "Пошук товарів..." : "Пошук категорій..."}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={activeTab === 'products' ? productSearch : categorySearch}
              onChange={(e) => {
                if(activeTab === 'products') { setProductSearch(e.target.value); setCurrentPage(1); }
                else setCategorySearch(e.target.value);
              }}
            />
          </div>
          
          <div className="flex gap-2">
            {activeTab === 'products' && (
              <select 
                className="bg-slate-50 border-none rounded-xl px-3 py-2.5 text-sm font-bold outline-none cursor-pointer"
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={10}>10 на стор.</option>
                <option value={20}>20 на стор.</option>
                <option value={50}>50 на стор.</option>
                <option value={100}>100 на стор.</option>
              </select>
            )}
            <Link 
              to={activeTab === 'products' ? "/admin/product/new" : "/admin/category/new"}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              <PlusCircle size={18} /> Додати
            </Link>
          </div>
        </div>
      </div>

      {/* Основний вміст */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === 'products' ? (
          <ProductsTable 
            products={paginatedProducts} 
            onDelete={handleDeleteProduct}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        ) : (
          <CategoriesGrid 
            categories={filteredCategories} 
            onDelete={handleDeleteCategory}
            onToggleVisibility={handleToggleCategoryVisibility} 
          />
        )}
      </div>
    </div>
  );
};

// --- Допоміжні компоненти (можна винести в окремі файли за потреби) ---

interface TabCardProps {
  title: string;
  count: number;
  subtitle: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
}

const TabCard = ({ title, count, subtitle, icon, isActive, onClick, colorClass }: TabCardProps) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-3xl border-2 transition-all text-left ${isActive ? `border-${colorClass}-600 bg-${colorClass}-50` : 'border-transparent bg-white shadow-sm hover:border-slate-200'}`}
  >
    <div className="flex justify-between items-start mb-2">
      <div className={isActive ? `text-${colorClass}-600` : 'text-slate-400'}>{icon}</div>
      <span className="text-2xl font-black text-slate-900">{count}</span>
    </div>
    <p className="font-bold text-slate-900">{title}</p>
    <p className="text-sm text-slate-500">{subtitle}</p>
  </button>
);

interface ProductsTableProps {
  products: Product[];
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ProductsTable = ({ products, onDelete, currentPage, totalPages, onPageChange }: ProductsTableProps) => (
  <>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="p-4 text-xs font-bold text-slate-400 uppercase">Товар</th>
            <th className="p-4 text-xs font-bold text-slate-400 uppercase">Категорія</th>
            <th className="p-4 text-xs font-bold text-slate-400 uppercase">Ціна</th>
            <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Дії</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {products.map((product: Product) => {
            // Розрахунок відсотка для відображення
            const discountPercent = product.isOnSale && product.price > 0 && product.salePrice
              ? Math.round(((product.price - product.salePrice) / product.price) * 100)
              : 0;

            return (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {product.main_image ? (
                        <img src={product.main_image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                          <Package size={16} />
                        </div>
                      )}
                      {/* Маленький індикатор акції на фото */}
                      {product.isOnSale && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <span className="font-semibold text-slate-900">{product.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded-md text-[11px] font-bold uppercase">
                    {product.category_name || 'Без категорії'}
                  </span>
                </td>
                <td className="p-4 min-w-[140px]">
                  {product.isOnSale ? (
                    <div className="flex flex-col gap-0">
                      {/* Контейнер для основної ціни та знижки */}
                      <div className="flex items-center gap-2 leading-none">
                        <span className="font-black text-rose-600 whitespace-nowrap text-[15px]">
                          {(product.salePrice ?? 0).toLocaleString()} ₴
                        </span>
                        <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md border border-rose-100 flex-shrink-0">
                          -{discountPercent}%
                        </span>
                      </div>
                      
                      {/* Стара ціна знизу */}
                      <span className="text-[11px] text-slate-400 line-through decoration-slate-300 mt-0.5">
                        {product.price.toLocaleString()} ₴
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-700 whitespace-nowrap">
                      {product.price.toLocaleString()} ₴
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Link 
                      to={`/admin/product/edit/${product.id}`} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button 
                      onClick={() => onDelete(product.id)} 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {totalPages > 1 && (
      <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
        <p className="text-sm text-slate-500 font-medium">Сторінка {currentPage} з {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50">
            <ChevronLeft size={18} />
          </button>
          <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )}
  </>
);

interface CategoriesGridProps {
  categories: Category[];
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number, currentStatus: boolean) => void;
}

const CategoriesGrid = ({ categories, onDelete, onToggleVisibility }: CategoriesGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
    {categories.map((cat: Category) => (
      <div key={cat.id} className={`bg-slate-50 p-4 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border ${cat.isHidden ? 'border-dashed border-amber-200 opacity-75' : 'border-transparent hover:border-slate-100'}`}>
        <div className="flex items-center gap-4">
          {/* Чекбокс/Кнопка видимості */}
          <button 
            onClick={() => onToggleVisibility(cat.id, cat.isHidden)}
            className={`p-2 rounded-xl transition-all ${cat.isHidden ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}
            title={cat.isHidden ? "Приховано від користувачів" : "Видно всім"}
          >
            {cat.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <div>
            <p className={`font-bold transition-colors ${cat.isHidden ? 'text-slate-400' : 'text-slate-900 group-hover:text-emerald-600'}`}>
              {cat.name} 
              {cat.isHidden && <span className="ml-2 text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-tighter">Приховано</span>}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{cat._count?.products || 0} товарів</p>
          </div>
        </div>

        <div className="flex gap-1">
          <Link to={`/admin/category/edit/${cat.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl">
            <Edit2 size={16} />
          </Link>
          <button onClick={() => onDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ))}
  </div>
);