import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, Table, Plus, Edit2, Trash2, 
  X, Save, RefreshCw, AlertCircle, ChevronRight, Upload, ImageIcon
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

// Допоміжна функція для перевірки, чи є поле зображенням
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
  const [dragActive, setDragActive] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/db/${selectedTable}`);
      setData(res.data);
    } catch (err) {
      alert("Помилка завантаження даних");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setEditingId(null);
  }, [selectedTable]);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleAddNew = () => {
    if (data.length > 0) {
      const empty = Object.keys(data[0]).reduce((acc: any, key) => {
        if (key === 'id') return acc;
        acc[key] = typeof data[0][key] === 'number' ? 0 : "";
        return acc;
      }, {});
      setEditForm(empty);
    } else {
      setEditForm({});
    }
    setEditingId('new');
  };

  const handleSave = async () => {
    try {
      const { id, ...payload } = editForm;
      if (editingId === 'new') {
        await api.post(`/admin/db/${selectedTable}`, payload);
      } else {
        await api.put(`/admin/db/${selectedTable}/${editingId}`, payload);
      }
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      alert("Помилка при збереженні: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити цей запис?")) return;
    try {
      await api.delete(`/admin/db/${selectedTable}/${id}`);
      fetchData();
    } catch (err) {
      alert("Помилка при видаленні.");
    }
  };

  // --- ЛОГІКА ЗАВАНТАЖЕННЯ ФАЙЛІВ ---
  const handleFileUpload = async (file: File, key: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Припускаємо, що у вас є ендпоінт для завантаження файлів
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Оновлюємо поле в формі отриманим шляхом до файлу
      setEditForm({ ...editForm, [key]: res.data.url });
    } catch (err) {
      alert("Помилка при завантаженні файлу");
    }
  };

  const onDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragActive(key);
  };

  const onDragLeave = () => {
    setDragActive(null);
  };

  const onDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], key);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-64 space-y-2">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Database size={16} /> Таблиці БД
        </h2>
        {TABLES.map(table => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${
              selectedTable === table.id 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
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
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{TABLES.find(t => t.id === selectedTable)?.name}</h1>
              <p className="text-xs text-slate-500 mt-1">Всього записів: {data.length}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
              <button onClick={handleAddNew} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black">
                <Plus size={18} /> Додати
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
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
                          <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                             <img 
                               src={item[key]} 
                               alt="preview" 
                               className="w-full h-full object-cover"
                               onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Error')}
                             />
                          </div>
                        ) : typeof item[key] === 'boolean' ? (
                          item[key] ? '✅' : '❌'
                        ) : (
                          String(item[key])
                        )}
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-100">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal/Editor Overlay */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingId === 'new' ? 'Створення запису' : `Редагування ID: ${editingId}`}</h3>
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {Object.keys(editForm).map(key => {
                if (key === 'id' || key === 'date' || key === 'createdAt' || key === 'updatedAt') return null;

                const isImage = isImageField(key, editForm[key]);

                return (
                  <div key={key} className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1">{key}</label>
                    
                    {isImage ? (
                      <div 
                        onDragOver={(e) => onDragOver(e, key)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, key)}
                        className={`relative group border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-4 min-h-[120px] 
                          ${dragActive === key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                      >
                        {editForm[key] ? (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
                            <img src={editForm[key]} className="w-full h-full object-contain" alt="Current" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <p className="text-white text-[10px] font-bold">Перетягніть новий файл сюди</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center">
                            <Upload size={24} className="mb-1" />
                            <span className="text-[10px]">Перетягніть малюнок</span>
                          </div>
                        )}
                        
                        <input 
                          className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editForm[key] || ""}
                          placeholder="URL малюнка"
                          onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                        />
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], key)}
                          accept="image/*"
                        />
                      </div>
                    ) : (
                      <input 
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={editForm[key] || ""}
                        onChange={(e) => setEditForm({...editForm, [key]: e.target.value})}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setEditingId(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-white">Скасувати</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                <Save size={18} /> Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};