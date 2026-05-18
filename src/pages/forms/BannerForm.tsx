import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, ImagePlus, X, Loader2 } from 'lucide-react';
import api from '../../api';
import { type ProductPreview, ProductSelector, LoadingState } from './func/ContentShared';

export const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [allProducts, setAllProducts] = useState<ProductPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [form, setForm] = useState({ title: '', description: '', btnText: '' });
  const [images, setImages] = useState<{file?: File, preview: string, isExisting?: boolean}[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductPreview[]>([]);

  useEffect(() => {
    api.get('/products').then(res => setAllProducts(res.data)).catch(console.error);

    if (id) {
      api.get(`/banners/${id}`).then(res => {
        const data = res.data;
        setForm({
          title: data.title || '',
          description: data.description || '',
          btnText: data.text || ''
        });
        setImages((data.images || []).map((url: string) => ({ preview: url, isExisting: true })));
        setSelectedProducts(data.products || []);
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [id]);

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('text', form.btnText);
    formData.append('productIds', JSON.stringify(selectedProducts.map(p => p.id)));
    formData.append('existing_urls', JSON.stringify(images.filter(img => img.isExisting).map(img => img.preview)));
    images.forEach(img => { if (img.file) formData.append('files', img.file); });

    try {
      id ? await api.put(`/banners/${id}`, formData) : await api.post('/banners', formData);
      navigate('/admin/content');
    } catch (err) {
      alert("Помилка при збереженні");
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20} /> Назад
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold">{id ? 'Редагувати' : 'Створити'} банер</h1>
          <input required placeholder="Заголовок" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input required placeholder="Короткий опис" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-700">Налаштування</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Текст на кнопці</label>
            <input placeholder="Купити зараз" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={form.btnText} onChange={e => setForm({...form, btnText: e.target.value})} />
          </div>

          <ProductSelector 
            selectedProducts={selectedProducts} 
            onAdd={(p) => !selectedProducts.find(x => x.id === p.id) && setSelectedProducts([...selectedProducts, p])} 
            onRemove={(pid) => setSelectedProducts(selectedProducts.filter(p => p.id !== pid))}
            isActive={isSearchActive}
            setIsActive={setIsSearchActive}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredProducts={filteredProducts}
          />

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Зображення</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border">
                  <img src={img.preview} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-md"><X size={14}/></button>
                </div>
              ))}
              <label className="aspect-video rounded-xl border-2 border-dashed flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
                <ImagePlus size={24}/><input type="file" multiple className="hidden" onChange={e => e.target.files && setImages([...images, ...Array.from(e.target.files).map(f => ({file: f, preview: URL.createObjectURL(f), isExisting: false}))])}/>
              </label>
            </div>
          </div>
        </div>

        <button disabled={isSaving} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-200">
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Зберегти зміни
        </button>
      </form>
    </div>
  );
};