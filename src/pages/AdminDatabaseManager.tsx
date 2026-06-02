import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Table, Plus, Edit2, Trash2, 
  X, Save, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import api from '../api';

// Конфігурація таблиць
const TABLES = [
  { id: 'user', name: 'Користувачі' },
  { id: 'category', name: 'Категорії' },
  { id: 'product', name: 'Товари' },
  { id: 'image', name: 'Зображення' },
  { id: 'order', name: 'Замовлення' },
  { id: 'item', name: 'Позиції замовлень' },
  { id: 'news', name: 'Новини' },
  { id: 'banner', name: 'Банери' },
];

const ROLES = ['USER', 'ADMIN', 'MANAGER'];
const PAGE_SIZES = [10, 20, 50, 100];

// Перевірка, чи є поле зображенням
const isImageField = (key: string, value: any) => {
  const imageKeys = ['image', 'url', 'path', 'thumbnail', 'src', 'photo'];
  if (imageKeys.some(k => key.toLowerCase().includes(k))) return true;
  if (typeof value === 'string' && value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) return true;
  return false;
};

export const AdminDatabaseManager = () => {
  const [selectedTable, setSelectedTable] = useState(TABLES[0].id);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // Стан пагінації
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Допоміжні дані для випадаючих списків (Foreign Keys)
  const [lookups, setLookups] = useState<{
    users: any[],
    categories: any[],
    products: any[],
    orders: any[]
  }>({
    users: [],
    categories: [],
    products: [],
    orders: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/db/${selectedTable}`);
      setData(res.data);

      // Завантаження залежностей для відображення імен замість ID
      if (selectedTable === 'order') {
        const users = await api.get('/admin/db/user');
        setLookups(prev => ({ ...prev, users: users.data }));
      } else if (selectedTable === 'product') {
        const cats = await api.get('/admin/db/category');
        setLookups(prev => ({ ...prev, categories: cats.data }));
      } else if (selectedTable === 'item') {
        const [p, o] = await Promise.all([
          api.get('/admin/db/product'),
          api.get('/admin/db/order')
        ]);
        setLookups(prev => ({ ...prev, products: p.data, orders: o.data }));
      }
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setEditingId(null);
    setCurrentPage(1); // Скидаємо на першу сторінку при зміні таблиці
  }, [selectedTable]);

  // Розрахунок даних для поточної сторінки (client-side pagination)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Форматування значень для таблиці
  const getDisplayValue = (key: string, value: any) => {
    if (key === 'userId') {
      const user = lookups.users.find(u => String(u.id) === String(value));
      return user ? `${user.firstName || ''} ${user.lastName || ''}` : `ID: ${value}`;
    }
    if (key === 'categoryId') {
      const cat = lookups.categories.find(c => String(c.id) === String(value));
      return cat ? cat.name : `ID: ${value}`;
    }
    if (selectedTable === 'item') {
      if (key === 'productId') {
        const prod = lookups.products.find(p => String(p.id) === String(value));
        return prod ? prod.name : `ID: ${value}`;
      }
      if (key === 'orderId') return `Замовлення #${value}`;
    }
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      const payload = { ...editForm };
      // Перетворення числових полів
      Object.keys(payload).forEach(key => {
        if (key.toLowerCase().includes('id') || key === 'price' || key === 'order' || key === 'quantity') {
          if (payload[key] !== "" && payload[key] !== null) {
            payload[key] = Number(payload[key]);
          }
        }
      });

      if (editingId === 'new') {
        await api.post(`/admin/db/${selectedTable}`, payload);
      } else {
        await api.put(`/admin/db/${selectedTable}/${editingId}`, payload);
      }
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      alert("Помилка при збереженні: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ви впевнені, що хочете видалити цей запис?")) return;
    try {
      await api.delete(`/admin/db/${selectedTable}/${id}`);
      fetchData();
    } catch (err: any) {
      alert("Помилка при видаленні");
    }
  };

  const handleAddNew = () => {
    if (data.length > 0) {
      const schema = Object.keys(data[0]).reduce((acc, key) => {
        if (!['id', 'createdAt', 'updatedAt'].includes(key)) {
          acc[key] = "";
        }
        return acc;
      }, {} as any);
      setEditForm(schema);
    } else {
      setEditForm({ name: "" }); 
    }
    setEditingId('new');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-slate-50 min-h-screen">
      {/* Sidebar - Список таблиць */}
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

      {/* Main Content - Таблиця з даними */}
      <main className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          
          {/* Header Таблиці */}
          <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{TABLES.find(t => t.id === selectedTable)?.name}</h1>
              <p className="text-xs text-slate-400 mt-1">Всього записів: {data.length}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Показувати:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>

              <button 
                onClick={handleAddNew} 
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <Plus size={18} /> Додати
              </button>
            </div>
          </div>

          {/* Сама таблиця */}
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
                        ) : getDisplayValue(key, item[key])}
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
            
            {data.length === 0 && !loading && (
              <div className="p-20 text-center text-slate-400 font-medium">
                Записи не знайдені
              </div>
            )}
          </div>

          {/* Пагінація у футері */}
          {data.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Сторінка {currentPage} з {totalPages || 1}
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center px-2 gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Показуємо тільки сусідні сторінки та крайні
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === pageNum 
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                            : "bg-white text-slate-600 hover:border-slate-300 border border-slate-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-slate-400 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Модальне вікно редагування */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingId === 'new' ? 'Створення запису' : 'Редагування запису'}
              </h3>
              <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {Object.keys(editForm).map(key => {
                if (['id', 'createdAt', 'updatedAt'].includes(key)) return null;

                // 1. Роль для користувача
                if (selectedTable === 'user' && key === 'role') {
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Роль</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm[key] || 'USER'}
                        onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                      >
                        {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                  );
                }

                // 2. Категорія для товару
                if (selectedTable === 'product' && key === 'categoryId') {
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Категорія</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={editForm[key] || ""}
                        onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                      >
                        <option value="">Оберіть категорію</option>
                        {lookups.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  );
                }

                // 3. Користувач для замовлення
                if (selectedTable === 'order' && key === 'userId') {
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Клієнт</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={editForm[key] || ""}
                        onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                      >
                        <option value="">Оберіть користувача</option>
                        {lookups.users.map(u => (
                          <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // 4. Поля для Позицій (Item)
                if (selectedTable === 'item' && (key === 'productId' || key === 'orderId')) {
                    const lookupKey = key === 'productId' ? 'products' : 'orders';
                    return (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                          <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={editForm[key] || ""}
                            onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                          >
                            <option value="">Оберіть {key}</option>
                            {lookups[lookupKey as keyof typeof lookups].map((x: any) => (
                              <option key={x.id} value={x.id}>{x.name || `Замовлення #${x.id}`}</option>
                            ))}
                          </select>
                        </div>
                    )
                }

                return (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                    <input 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editForm[key] || ""}
                      onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                    />
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setEditingId(null)} 
                className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Скасувати
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-200"
              >
                <Save size={18} /> Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};