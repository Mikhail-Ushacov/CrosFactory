import { 
  Save, ArrowLeft, FolderPlus, Loader2, Search, 
  ChevronUp, ChevronDown, Tag, Package, 
  ChevronLeft, ChevronRight, CheckCircle2, Circle
} from 'lucide-react';
import { useAdminCategoryForm } from './useAdminCategoryForm';
import { LoadingState } from '../../context/ContentShared';

export const AdminCategoryForm = () => {
  const {
    id, form, setForm,
    isLoading, isSaving,
    selectedIds,
    searchTerm, setSearchTerm,
    onlySale, setOnlySale,
    sortConfig,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    totalPages, currentItems, filteredProducts,
    toggleProduct, requestSort, handleNameChange, handleSubmit,
    navigate
  } = useAdminCategoryForm();

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors font-bold">
        <ArrowLeft size={20} /> Панель керування
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Секція: Назва та Slug */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FolderPlus className="text-indigo-600" size={28} />
            {id ? 'Налаштування категорії' : 'Нова категорія'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Назва</label>
              <input 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-300 transition-all font-bold"
                value={form.name} onChange={handleNameChange} placeholder="Напр: Кріплення"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Slug (URL)</label>
              <input 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-500"
                value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Секція: Таблиця вибору товарів */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Виберіть товари</h3>
                <p className="text-sm text-slate-400 font-medium">Вибрано: <span className="text-indigo-600 font-black">{selectedIds.length}</span></p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" placeholder="Пошук..."
                    className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48 md:w-64"
                    value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  />
                </div>
                <button 
                  type="button" onClick={() => {setOnlySale(!onlySale); setCurrentPage(1);}}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${onlySale ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  <Tag size={16} /> % Sale
                </button>
                <select 
                  className="bg-slate-50 border-none rounded-xl px-3 py-2.5 text-sm font-bold outline-none cursor-pointer"
                  value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                >
                  <option value={5}>5 на стор.</option>
                  <option value={10}>10 на стор.</option>
                  <option value={20}>20 на стор.</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">Вибір</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Товар</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                    Назва {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('price')}>
                    Ціна {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((product) => (
                  <tr 
                    key={product.id} onClick={() => toggleProduct(product.id)}
                    className={`cursor-pointer transition-colors ${selectedIds.includes(product.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-5">
                      {selectedIds.includes(product.id) ? <CheckCircle2 className="text-indigo-600" /> : <Circle className="text-slate-200" />}
                    </td>
                    <td className="p-5">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border">
                        {product.main_image ? <img src={product.main_image} className="w-full h-full object-cover" /> : <Package size={16} className="text-slate-300" />}
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-slate-900">{product.name}</p>
                    </td>
                    <td className="p-5">
                      {product.isOnSale ? <span className="text-rose-500 font-black">{product.salePrice} ₴</span> : <span className="font-bold">{product.price} ₴</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && <div className="p-10 text-center text-slate-400">Нічого не знайдено</div>}
          </div>

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Сторінка {currentPage} з {totalPages}</span>
              <div className="flex items-center gap-1">
                <button 
                   type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                   className="p-2 bg-white border rounded-xl disabled:opacity-30"
                ><ChevronLeft size={18} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i} type="button" onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-400'}`}
                  >{i + 1}</button>
                ))}
                <button 
                  type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 bg-white border rounded-xl disabled:opacity-30"
                ><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>

        <button 
          disabled={isSaving} 
          className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={24} />} 
          Зберегти категорію
        </button>
      </form>
    </div>
  );
};