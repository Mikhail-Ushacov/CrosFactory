import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, FolderPlus, Loader2 } from 'lucide-react';
import api from '../api';
import slugify from '../Slugify';
import { ProductSelector, type ProductPreview, LoadingState } from './forms/func/ContentShared';

export const AdminCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [allProducts, setAllProducts] = useState<ProductPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [form, setForm] = useState({ name: '', slug: '' });
  const [selectedProducts, setSelectedProducts] = useState<ProductPreview[]>([]);

  useEffect(() => {
    // Завантажуємо всі товари для селектора
    api.get('/products').then(res => setAllProducts(res.data));

    if (id) {
      api.get(`/categories/${id}`).then(res => {
        setForm({ name: res.data.name, slug: res.data.slug });
        setSelectedProducts(res.data.products || []);
        setIsLoading(false);
      });
    }
  }, [id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm({ ...form, name, slug: slugify(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...form,
      productIds: selectedProducts.map(p => p.id)
    };

    try {
      if (id) {
        await api.put(`/categories/${id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      navigate('/admin');
    } catch (err) {
      alert("Помилка при збереженні категорії");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors cursor-pointer">
        <ArrowLeft size={20} /> Назад
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FolderPlus className="text-indigo-600" />
            {id ? 'Редагувати категорію' : 'Створити категорію'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Назва категорії</label>
              <input 
                required 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-300 transition-all"
                value={form.name} 
                onChange={handleNameChange}
                placeholder="Напр: Кріплення"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Slug (URL)</label>
              <input 
                required 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                value={form.slug} 
                onChange={e => setForm({...form, slug: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-700">Товари в цій категорії</h3>
            <p className="text-xs text-slate-400 mb-4">Виберіть товари, які ви хочете перемістити в цю категорію</p>
          </div>

          <ProductSelector 
            selectedProducts={selectedProducts} 
            onAdd={(p) => {
              if(!selectedProducts.find(x => x.id === p.id)) {
                setSelectedProducts([...selectedProducts, p]);
              }
            }} 
            onRemove={(pid) => setSelectedProducts(selectedProducts.filter(p => p.id !== pid))}
            isActive={isSearchActive}
            setIsActive={setIsSearchActive}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredProducts={allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          />
        </div>

        <button 
          disabled={isSaving} 
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-200 cursor-pointer"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
          Зберегти категорію
        </button>
      </form>
    </div>
  );
};