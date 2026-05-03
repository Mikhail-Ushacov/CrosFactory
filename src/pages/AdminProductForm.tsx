import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Package } from 'lucide-react';
import type { Category } from '../types';

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    description: '',
    category_id: 1,
    main_image: 'https://picsum.photos/400/400'
  });

  useEffect(() => {
    axios.get('http://localhost:3001/api/categories').then(res => setCategories(res.data));
    if (id) {
      axios.get(`http://localhost:3001/api/products/${id}`).then(res => {
        setForm({
          name: res.data.name,
          price: res.data.price,
          description: res.data.description,
          category_id: res.data.category_id,
          main_image: res.data.main_image
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:3001/api/products/${id}`, form);
      } else {
        await axios.post('http://localhost:3001/api/products', form);
      }
      navigate('/admin');
    } catch (err) {
      alert("Помилка збереження");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors cursor-pointer">
        <ArrowLeft size={20} /> Назад до списку
      </button>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900">
          <Package className="text-indigo-600" /> {id ? "Редагувати товар" : "Новий товар"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-1">Назва</label>
            <input 
              required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase mb-1">Ціна (₴)</label>
              <input 
                type="number" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase mb-1">Категорія</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none cursor-pointer"
                value={form.category_id} onChange={e => setForm({...form, category_id: Number(e.target.value)})}
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-1">Опис</label>
            <textarea 
              rows={4} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none resize-none"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>

          {!id && (
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase mb-1">URL фотографії</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none"
                value={form.main_image} onChange={e => setForm({...form, main_image: e.target.value})}
              />
            </div>
          )}

          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer">
            <Save size={20} /> Зберегти товар
          </button>
        </form>
      </div>
    </div>
  );
};