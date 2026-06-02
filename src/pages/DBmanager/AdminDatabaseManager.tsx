import React, { useState } from 'react';
import { 
  Database, Table, Plus, Edit2, Trash2, 
  X, Save, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { TABLES, ROLES, PAGE_SIZES } from './types';
import { isImageField, getDisplayValue } from './utils';
import { useDatabaseManager } from './useDatabaseManager';

export const AdminDatabaseManager = () => {
  const [selectedTable, setSelectedTable] = useState(TABLES[0].id);
  
  const {
    data, paginatedData, loading, editingId, editForm, 
    currentPage, itemsPerPage, totalPages, lookups,
    setEditingId, setEditForm, setCurrentPage, setItemsPerPage,
    handleEdit, handleSave, handleDelete, handleAddNew
  } = useDatabaseManager(selectedTable);

  const currentTableName = TABLES.find(t => t.id === selectedTable)?.name;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-slate-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 space-y-2">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
          <Database size={14} /> Керування БД
        </h2>
        {TABLES.map(table => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${
              selectedTable === table.id 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Table size={16} /> {table.name}
            </div>
            <ChevronRight size={14} className={selectedTable === table.id ? "opacity-100" : "opacity-0"} />
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{currentTableName}</h1>
              <p className="text-xs text-slate-400 mt-1">Всього записів: {data.length}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Показувати:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-2 py-1 outline-none"
                >
                  {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <button onClick={handleAddNew} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                <Plus size={18} /> Додати
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] sticky top-0 z-10">
                <tr>
                  {data.length > 0 && Object.keys(data[0]).map(key => (
                    <th key={key} className="p-4 border-b border-slate-100">{key}</th>
                  ))}
                  <th className="p-4 border-b border-slate-100 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                    {Object.keys(item).map(key => (
                      <td key={key} className="p-4 max-w-[200px] truncate text-slate-600">
                        {isImageField(key, item[key]) ? (
                          <img src={item[key]} className="w-10 h-10 rounded object-cover border bg-white" alt="" />
                        ) : getDisplayValue(key, item[key], selectedTable, lookups)}
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 hover:text-indigo-600 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагінація та Модалка (логіка рендерингу залишається такою ж, як в оригіналі) */}
          {/* ... Тут JSX пагінації та модального вікна з використанням функцій з хука ... */}
        </div>
      </main>
      
      {/* Modal - Спрощено для прикладу, структура та сама */}
      {editingId !== null && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                {/* Вміст модалки з інпутами для editForm */}
                {/* ... */}
                <button onClick={handleSave}>Зберегти</button>
            </div>
         </div>
      )}
    </div>
  );
};