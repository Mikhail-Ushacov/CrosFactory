import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, ImagePlus, X, Loader2, Link as LinkIcon } from 'lucide-react';
import api from '../../api';
import { 
  type ProductPreview, 
  type CategoryPreview, 
  ProductSelector, 
  CategorySelector, 
  LoadingState 
} from '../../context/ContentShared';
import type { PaginatedResponse, Product, Category } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

export const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductPreview[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [isCatSearchActive, setIsCatSearchActive] = useState(false);
  const [catSearchResults, setCatSearchResults] = useState<CategoryPreview[]>([]);
  const debouncedCatSearch = useDebounce(catSearchQuery, 400);

  const [form, setForm] = useState({ title: '', description: '', btnText: '' });
  const [selectedProducts, setSelectedProducts] = useState<ProductPreview[]>([]); // Масив для безлічі товарів
  const [selectedCategory, setSelectedCategory] = useState<CategoryPreview | null>(null); // Одиночна категорія
  const [image, setImage] = useState<{file?: File, preview: string, isExisting?: boolean} | null>(null);

  useEffect(() => {
    if (id) {
      api.get(`/banners/${id}`).then(res => {
        const data = res.data;
        setForm({
          title: data.title || '',
          description: data.description || '',
          btnText: data.text || ''
        });
        if (data.images?.length > 0) setImage({ preview: data.images[0], isExisting: true });
        
        // Відновлюємо дані: або товари, або категорію
        if (data.products?.length > 0) {
          setSelectedProducts(data.products);
          setSelectedCategory(null);
        } else if (data.categories?.length > 0) {
          setSelectedCategory(data.categories[0]);
          setSelectedProducts([]);
        }
        
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (isSearchActive) {
      api.get<PaginatedResponse<Product>>('/products', { params: { search: debouncedSearch, limit: 10 } })
         .then(res => setSearchResults(res.data.data));
    }
  }, [debouncedSearch, isSearchActive]);

  useEffect(() => {
    if (isCatSearchActive) {
      api.get<PaginatedResponse<Category>>('/categories', { params: { search: debouncedCatSearch, limit: 10 } })
         .then(res => setCatSearchResults(res.data.data));
    }
  }, [debouncedCatSearch, isCatSearchActive]);

  // --- ЛОГІКА ПЕРЕМИКАННЯ (АБО-АБО) ---

  const handleAddCategory = (c: CategoryPreview) => {
    setSelectedCategory(c);
    setSelectedProducts([]); // Очищаємо всі вибрані товари
    setIsCatSearchActive(false);
  };

  const handleAddProduct = (p: ProductPreview) => {
    setSelectedCategory(null); // Очищаємо вибрану категорію
    if (!selectedProducts.find(item => item.id === p.id)) {
      setSelectedProducts([...selectedProducts, p]);
    }
    setIsSearchActive(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('text', form.btnText);

    formData.append('productIds', JSON.stringify(selectedProducts.map(p => p.id)));
    formData.append('categoryIds', JSON.stringify(selectedCategory ? [selectedCategory.id] : []));
    formData.append('categoryIds', JSON.stringify(selectedCategory ? [selectedCategory.id] : []));
    
    if (image) {
      if (image.isExisting) {
        formData.append('existing_urls', JSON.stringify([image.preview]));
      } else if (image.file) {
        formData.append('files', image.file);
        formData.append('existing_urls', JSON.stringify([]));
      }
    } else {
      formData.append('existing_urls', JSON.stringify([]));
    }

    try {
      id ? await api.put(`/banners/${id}`, formData) : await api.post('/banners', formData);
      navigate('/admin/content');
    } catch (err) {
      setIsSaving(false);
    }
  };

  const getPreviewLink = () => {
    if (selectedProducts.length > 0) return `/product/${selectedProducts[0].id} (+${selectedProducts.length - 1})`;
    if (selectedCategory) return `/catalog?category=${selectedCategory.id}`;
    return null;
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors cursor-pointer">
        <ArrowLeft size={20} /> Назад
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold">{id ? 'Редагувати' : 'Створити'} банер</h1>
          <input required placeholder="Заголовок" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input required placeholder="Короткий опис" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-700">Налаштування та перехід</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Текст на кнопці</label>
              <input placeholder="Детальніше" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={form.btnText} onChange={e => setForm({...form, btnText: e.target.value})} />
            </div>
            <div className="flex flex-col justify-end">
              {getPreviewLink() && (
                <div className="p-3 bg-indigo-50 rounded-xl flex items-center gap-2 text-indigo-600 text-sm">
                  <LinkIcon size={16} />
                  <span className="font-medium truncate">Перехід: {getPreviewLink()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Виберіть або категорію, або товари</p>
            
            <CategorySelector 
              selectedCategories={selectedCategory ? [selectedCategory] : []}
              onAdd={handleAddCategory}
              onRemove={() => setSelectedCategory(null)}
              isActive={isCatSearchActive}
              setIsActive={setIsCatSearchActive}
              searchQuery={catSearchQuery}
              setSearchQuery={setCatSearchQuery}
              filteredCategories={catSearchResults}
            />

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-slate-50 px-3 text-[10px] font-bold text-slate-300 uppercase">АБО</span>
            </div>

            <ProductSelector 
              selectedProducts={selectedProducts} 
              onAdd={handleAddProduct} 
              onRemove={(pid) => setSelectedProducts(selectedProducts.filter(p => p.id !== pid))}
              isActive={isSearchActive}
              setIsActive={setIsSearchActive}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredProducts={searchResults}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Зображення банера (макс. 1)</label>
            <div className="flex gap-4">
              {image ? (
                <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-inner">
                  <img src={image.preview} className="w-full h-full object-cover" alt="Banner" />
                  <button 
                    type="button" 
                    onClick={() => setImage(null)} 
                    className="absolute top-4 right-4 bg-white/90 text-red-500 p-2 rounded-xl shadow-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    <X size={20}/>
                  </button>
                </div>
              ) : (
                <label className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-indigo-300 cursor-pointer transition-all gap-2">
                  <ImagePlus size={40} className="text-slate-300" />
                  <span className="font-medium">Натисніть, щоб завантажити фото</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setImage({ file, preview: URL.createObjectURL(file), isExisting: false });
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <button disabled={isSaving} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] cursor-pointer">
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Зберегти банер
        </button>
      </form>
    </div>
  );
};
