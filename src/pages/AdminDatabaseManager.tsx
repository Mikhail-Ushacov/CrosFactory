import React, { useState, useEffect } from 'react';
import { 
  Database, Table, Plus, Edit2, Trash2, 
  X, Save, RefreshCw, ChevronRight, Upload
} from 'lucide-react';
import api from '../api';

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
  
  // Розширені допоміжні дані
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

      // Логіка завантаження залежностей залежно від обраної таблиці
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
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setEditingId(null);
  }, [selectedTable]);

  // Відображення імен замість ID у таблиці
  const getDisplayValue = (key: string, value: any) => {
    if (key === 'userId' || key === 'userId') {
      const user = lookups.users.find(u => String(u.id) === String(value));
      return user ? `${user.firstName || ''} ${user.lastName || ''} (${user.email})` : `ID: ${value}`;
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
    return String(value);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
  try {
    const payload = { ...editForm };
    
    // Конвертуємо числові поля, якщо вони є
    Object.keys(payload).forEach(key => {
      if (key.toLowerCase().includes('id') || key === 'price' || key === 'order') {
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
    if (!confirm("Видалити?")) return;
    await api.delete(`/admin/db/${selectedTable}/${id}`);
    fetchData();
  };

  const handleAddNew = () => {
  if (data.length > 0) {
    // Беремо всі ключі з першого елемента таблиці, крім системних
    const schema = Object.keys(data[0]).reduce((acc, key) => {
      if (!['id', 'createdAt', 'updatedAt'].includes(key)) {
        acc[key] = ""; // Ініціалізуємо порожнім рядком
      }
      return acc;
    }, {} as any);
    setEditForm(schema);
  } else {
    // Якщо таблиця порожня, можна задати дефолтні поля або вивести помилку
    setEditForm({ name: "" }); 
  }
  setEditingId('new');
};

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-slate-50 min-h-screen">
      <aside className="w-full lg:w-64 space-y-2">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
          <Database size={14} /> База даних
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

      <main className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-900">{TABLES.find(t => t.id === selectedTable)?.name}</h1>
            <button 
              onClick={handleAddNew} 
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Plus size={18} /> Додати
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  {data.length > 0 && Object.keys(data[0]).map(key => (
                    <th key={key} className="p-4 border-b border-slate-100">{key}</th>
                  ))}
                  <th className="p-4 border-b border-slate-100 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                    {Object.keys(item).map(key => (
                      <td key={key} className="p-4 max-w-[200px] truncate text-slate-600">
                        {isImageField(key, item[key]) ? (
                          <img src={item[key]} className="w-10 h-10 rounded object-cover border" alt="" />
                        ) : getDisplayValue(key, item[key])}
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 hover:text-indigo-600"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Модальне вікно редагування */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Редагування</h3>
              <button onClick={() => setEditingId(null)}><X size={24} /></button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {Object.keys(editForm).map(key => {
                if (['id', 'createdAt', 'updatedAt'].includes(key)) return null;

                // 1. Вибір РОЛІ для користувача
                if (selectedTable === 'user' && key === 'role') {
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Роль користувача</label>
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

                // 2. Вибір КАТЕГОРІЇ для товару
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

                // 3. Вибір КОРИСТУВАЧА для замовлення
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

                // 4. Поля для Позицій замовлення (Item)
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
                            {lookups[lookupKey].map((x: any) => (
                              <option key={x.id} value={x.id}>{x.name || `Замовлення #${x.id}`}</option>
                            ))}
                          </select>
                        </div>
                    )
                }

                // Стандартний інпут (якщо не випали умови вище)
                return (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                    <input 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      value={editForm[key] || ""}
                      onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                    />
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setEditingId(null)} className="flex-1 py-3 font-bold text-slate-600">Скасувати</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <Save size={18} /> Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};