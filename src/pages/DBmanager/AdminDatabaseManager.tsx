import React from 'react';
import { 
  Database, Table, Plus, Edit2, Trash2, 
  X, Save, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { TABLES, ROLES, PAGE_SIZES } from './types';
import { isImageField, getDisplayValue } from './utils';
import { useDatabaseManager } from './useDatabaseManager';
import { LookupSearchInput } from './LookupSearchInput';

const fkToModel: Record<string, string> = {
  userId: 'user',
  categoryId: 'category',
  productId: 'product',
  orderId: 'order',
};

export const AdminDatabaseManager = () => {
  const [selectedTable, setSelectedTable] = React.useState(TABLES[0].id);
  
  const {
    data, paginatedData, loading, editingId, editForm, 
    currentPage, itemsPerPage, totalPages, totalRecords,
    setEditingId, setEditForm, setCurrentPage, setItemsPerPage,
    handleEdit, handleSave, handleDelete, handleAddNew
  } = useDatabaseManager(selectedTable);

  const currentTableName = TABLES.find(t => t.id === selectedTable)?.name;

  // Допоміжна функція для рендерингу полів вводу в модалці
  const renderFieldInput = (key: string, value: unknown) => {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') return null;

    const label = key;
    const baseInputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";

    // 1. Поля вибору ролей
    if (key === 'role') {
      return (
        <div key={key}>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">{label}</label>
          <select 
            value={value as string} 
            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
            className={baseInputClass}
          >
            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
      );
    }

    // 2. Foreign Keys
    if (fkToModel[key]) {
      return (
        <LookupSearchInput
          key={key}
          model={fkToModel[key]}
          value={value as string | number}
          onChange={(newVal) => setEditForm({ ...editForm, [key]: newVal })}
          label={label}
        />
      );
    }

    // 3. Booleans
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input 
            type="checkbox" 
            checked={value}
            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.checked })}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">{key}</span>
        </div>
      );
    }

    // 4. Текстові області для описів
    if (key === 'description' || key === 'content') {
      return (
        <div key={key} className="col-span-full">
          {label}
          <textarea 
            value={String(value ?? '')}
            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
            className={`${baseInputClass} min-h-[100px]`}
          />
        </div>
      );
    }

    // 5. Стандартний input
    return (
      <div key={key}>
        {label}
        <input 
          type={['price', 'quantity', 'oldPrice'].includes(key) ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
          className={baseInputClass}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-slate-50 min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 space-y-2">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Database size={16} className="text-indigo-500" /> Керування БД
          </h2>
          <div className="space-y-1.5">
            {TABLES.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  selectedTable === table.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1" 
                  : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Table size={18} className={selectedTable === table.id ? "text-white" : "text-slate-300"} />
                  {table.name}
                </div>
                <ChevronRight size={14} className={selectedTable === table.id ? "opacity-100" : "opacity-0"} />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex flex-wrap gap-6 justify-between items-center bg-white">
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentTableName}</h1>
              </div>
              <p className="text-sm font-medium text-slate-400 ml-5">Всього записів: {totalRecords}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase pl-3">На сторінці:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none shadow-sm cursor-pointer"
                >
                  {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <button 
                onClick={handleAddNew} 
                className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95"
              >
                <Plus size={20} strokeWidth={3} /> Додати запис
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Завантаження...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    {data.length > 0 && Object.keys(data[0]).map(key => (
                      <th key={key} className="p-5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">{key}</th>
                    ))}
                    <th className="p-5 border-b border-slate-100 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedData.map((item) => (
                    <tr key={item.id as number} className="hover:bg-indigo-50/30 transition-colors group">
                      {Object.keys(item).map(key => (
                        <td key={key} className="p-5 max-w-[250px] truncate text-sm font-semibold text-slate-600">
                          {isImageField(key, item[key]) ? (
                            <div className="relative w-12 h-12 group/img">
                                <img src={item[key] as string} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm bg-white" alt="" />
                                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>
                          ) : (
                            getDisplayValue(key, item[key], selectedTable)
                          )}
                        </td>
                      ))}
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)} 
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id as number)} 
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Сторінка {currentPage} з {totalPages || 1}
            </p>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronsLeft size={18} />
              </button>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center px-4 gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = currentPage;
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    if (pageNum <= 0 || pageNum > totalPages) return null;

                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                currentPage === pageNum 
                                ? "bg-white border-2 border-indigo-600 text-indigo-600 shadow-sm" 
                                : "text-slate-400 hover:bg-white hover:text-indigo-600"
                            }`}
                        >
                            {pageNum}
                        </button>
                    )
                })}
              </div>

              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Dynamic Modal Form */}
      {editingId !== null && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            {editingId === 'new' ? 'Створення нового запису' : `Редагування #${editingId}`}
                        </h2>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{currentTableName}</p>
                    </div>
                    <button 
                        onClick={() => setEditingId(null)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.keys(editForm).map(key => renderFieldInput(key, editForm[key]))}
                    </div>
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                    <button 
                        onClick={handleSave}
                        className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98]"
                    >
                        <Save size={20} /> Зберегти зміни
                    </button>
                    <button 
                        onClick={() => setEditingId(null)}
                        className="px-8 bg-white border border-slate-200 text-slate-500 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                        Скасувати
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};