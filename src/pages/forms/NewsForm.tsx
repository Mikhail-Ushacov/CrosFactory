import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, ImagePlus, X, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../api';
import { type ProductPreview, ProductSelector, LoadingState } from './func/ContentShared';

interface ContentBlock {
  id: string;
  title: string;
  text: string;
  images: { file?: File; preview: string; isExisting?: boolean }[];
  products: ProductPreview[];
}

export const NewsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [allProducts, setAllProducts] = useState<ProductPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchBlock, setActiveSearchBlock] = useState<string | null>(null);

  const [form, setForm] = useState({ title: '', description: '', tag: 'Новини' });
  const [mainImages, setMainImages] = useState<{file?: File, preview: string, isExisting?: boolean}[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: Math.random().toString(), title: '', text: '', images: [], products: [] }
  ]);

  useEffect(() => {
    api.get('/products').then(res => setAllProducts(res.data)).catch(console.error);

    if (id) {
      api.get(`/news/${id}`).then(res => {
        const data = res.data;
        setForm({ title: data.title || '', description: data.description || '', tag: data.tag || 'Новини' });
        setMainImages((data.images || []).map((url: string) => ({ preview: url, isExisting: true })));
        if (data.contentBlocks) {
          setBlocks(data.contentBlocks.map((b: any) => ({
            ...b,
            id: b.id || Math.random().toString(),
            images: (b.images || []).map((url: string) => ({ preview: url, isExisting: true })),
            products: b.products || []
          })));
        }
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
    formData.append('tag', form.tag);

    const blocksMeta = blocks.map(b => ({
      title: b.title,
      text: b.text,
      productIds: b.products.map(p => p.id),
      existingImages: b.images.filter(img => img.isExisting).map(img => img.preview)
    }));
    formData.append('contentBlocks', JSON.stringify(blocksMeta));
    
    blocks.forEach((block, bIdx) => {
      block.images.forEach(img => { if (img.file) formData.append(`block_images_${bIdx}`, img.file); });
    });

    mainImages.forEach(img => { if (img.file) formData.append('files', img.file); });
    formData.append('existing_urls', JSON.stringify(mainImages.filter(img => img.isExisting).map(img => img.preview)));

    try {
      id ? await api.put(`/news/${id}`, formData) : await api.post('/news', formData);
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
          <h1 className="text-2xl font-bold">{id ? 'Редагувати' : 'Створити'} новину</h1>
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Заголовок" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <input placeholder="Тег" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} />
          </div>
          <input required placeholder="Опис" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700">Головне фото новини</h3>
          <div className="grid grid-cols-4 gap-4">
            {mainImages.map((img, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border">
                <img src={img.preview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setMainImages(mainImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white p-1 rounded-md text-red-500"><X size={14}/></button>
              </div>
            ))}
            <label className="aspect-video rounded-xl border-2 border-dashed flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
              <ImagePlus size={24} /><input type="file" multiple className="hidden" onChange={e => e.target.files && setMainImages([...mainImages, ...Array.from(e.target.files).map(f => ({file: f, preview: URL.createObjectURL(f), isExisting: false}))])} />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          {blocks.map((block, index) => (
            <div key={block.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
                {blocks.length > 1 && <button type="button" onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>}
              </div>

              <input placeholder="Підзаголовок фрагмента" className="w-full p-3 bg-slate-50 rounded-xl font-bold" value={block.title} onChange={e => setBlocks(blocks.map(b => b.id === block.id ? {...b, title: e.target.value} : b))} />
              <textarea placeholder="Текст..." rows={4} className="w-full p-3 bg-slate-50 rounded-xl resize-none" value={block.text} onChange={e => setBlocks(blocks.map(b => b.id === block.id ? {...b, text: e.target.value} : b))} />

              <ProductSelector 
                selectedProducts={block.products} 
                onAdd={(p) => !block.products.find(x => x.id === p.id) && setBlocks(blocks.map(b => b.id === block.id ? {...b, products: [...b.products, p]} : b))}
                onRemove={(pid) => setBlocks(blocks.map(b => b.id === block.id ? {...b, products: b.products.filter(x => x.id !== pid)} : b))}
                isActive={activeSearchBlock === block.id}
                setIsActive={(val) => setActiveSearchBlock(val ? block.id : null)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredProducts={filteredProducts}
              />

              <div className="grid grid-cols-6 gap-3">
                {block.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative aspect-square rounded-xl overflow-hidden border">
                    <img src={img.preview} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setBlocks(blocks.map(b => b.id === block.id ? {...b, images: b.images.filter((_, i) => i !== imgIdx)} : b))} className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-md"><X size={12}/></button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
                  <ImagePlus size={20}/><input type="file" multiple className="hidden" onChange={e => e.target.files && setBlocks(blocks.map(b => b.id === block.id ? {...b, images: [...b.images, ...Array.from(e.target.files!).map(f => ({file: f, preview: URL.createObjectURL(f), isExisting: false}))]} : b))} />
                </label>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setBlocks([...blocks, { id: Math.random().toString(), title: '', text: '', images: [], products: [] }])} className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 font-bold flex items-center justify-center gap-2 hover:bg-indigo-50"><Plus size={20} /> Додати фрагмент</button>
        </div>

        <button disabled={isSaving} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-200">
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Зберегти новину
        </button>
      </form>
    </div>
  );
};