import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Package, 
  Upload, 
  X, 
  Link as LinkIcon, 
  Loader2, 
  Plus, 
  Trash2, 
  Settings2 
} from 'lucide-react';
import type { Category } from '../types';
import api from '../api';

interface ImageItem {
  id: string;
  type: 'url' | 'file';
  value: string | File;
  preview: string;
}

interface Characteristic {
  name: string;
  value: number;
  unit: string;
}

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  
  const [form, setForm] = useState({
    name: '',
    price: 0,
    description: '',
    category_id: 0,
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);

  // Load Initial Data
  useEffect(() => {
    // 1. Load Categories
    api.get('/categories').then(res => {
      setCategories(res.data);
      if (res.data.length > 0 && !id) {
        setForm(prev => ({ ...prev, category_id: res.data[0].id }));
      }
    });
    
    // 2. Load Product for editing
    if (id) {
      api.get(`/products/${id}`)
        .then(res => {
          const p = res.data;
          setForm({
            name: p.name,
            price: p.price,
            description: p.description || '',
            category_id: p.category_id,
          });
          
          // Set Images
          if (p.images && Array.isArray(p.images)) {
            setImages(p.images.map((url: string) => ({
              id: Math.random().toString(),
              type: 'url',
              value: url,
              preview: url
            })));
          }

          // Set Characteristics
          if (p.characteristics) {
            setCharacteristics(p.characteristics);
          }
        })
        .catch(() => alert("Помилка завантаження товару"))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  // --- Image Handlers ---
  const addImageUrl = () => {
    if (!urlInput) return;
    const newItem: ImageItem = {
      id: Math.random().toString(),
      type: 'url',
      value: urlInput,
      preview: urlInput
    };
    setImages([...images, newItem]);
    setUrlInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
    let files: FileList | null = null;
    if (e instanceof DragEvent) {
      files = e.dataTransfer?.files || null;
    } else {
      files = e.target.files;
    }

    if (files) {
      const validImageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      const newFiles = validImageFiles.map(file => ({
        id: Math.random().toString(),
        type: 'file' as const,
        value: file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (imgId: string) => {
    setImages(images.filter(img => img.id !== imgId));
  };

  // --- Characteristics Handlers ---
  const addCharacteristic = () => {
    setCharacteristics([...characteristics, { name: '', value: 0, unit: '' }]);
  };

  const updateCharacteristic = (index: number, field: keyof Characteristic, val: string | number) => {
    const updated = [...characteristics];
    updated[index] = { ...updated[index], [field]: val };
    setCharacteristics(updated);
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', String(form.price));
    formData.append('description', form.description);
    formData.append('category_id', String(form.category_id));
    
    // Add characteristics as JSON
    formData.append('characteristics', JSON.stringify(characteristics));

    // Handle images
    const existingUrls: string[] = [];
    images.forEach(img => {
      if (img.type === 'file') {
        formData.append('files', img.value as File);
      } else {
        existingUrls.push(img.value as string);
      }
    });
    formData.append('existing_urls', JSON.stringify(existingUrls));

    try {
      if (id) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert("Помилка збереження товару");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p>Завантаження даних...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <button 
        onClick={() => navigate('/admin')} 
        disabled={isSaving}
        className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-50"
      >
        <ArrowLeft size={20} /> Назад до списку
      </button>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2 text-slate-900">
          <Package className="text-indigo-600" /> {id ? "Редагування товару" : "Створення нового товару"}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Main Info & Characteristics */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Основна інформація</h2>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Назва товару</label>
                <input 
                  required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-300 transition-all"
                  placeholder="Наприклад: Професійний дриль"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Ціна (₴)</label>
                  <input 
                    type="number" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-300 transition-all"
                    value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Категорія</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-300 transition-all appearance-none"
                    value={form.category_id} onChange={e => setForm({...form, category_id: Number(e.target.value)})}
                    disabled={isSaving}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Опис</label>
                <textarea 
                  rows={5} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-300 transition-all resize-none"
                  placeholder="Детальний опис товару..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* CHARACTERISTICS SECTION */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Settings2 size={16} /> Технічні характеристики
                </h2>
                <button 
                  type="button"
                  onClick={addCharacteristic}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} /> Додати поле
                </button>
              </div>

              <div className="space-y-3">
                {characteristics.map((char, index) => (
                  <div key={index} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                    <div className="flex-1">
                      <input 
                        placeholder="Назва (напр. Вага)"
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white"
                        value={char.name}
                        onChange={e => updateCharacteristic(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <input 
                        type="number"
                        placeholder="Знач."
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white text-center"
                        value={char.value}
                        onChange={e => updateCharacteristic(index, 'value', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-20">
                      <input 
                        placeholder="Од. (кг)"
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white text-center"
                        value={char.unit}
                        onChange={e => updateCharacteristic(index, 'unit', e.target.value)}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeCharacteristic(index)}
                      className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {characteristics.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-400 italic">Характеристики не вказані. Додайте їх для кращої інформативності.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Images & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Зображення</h2>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white"
                  placeholder="URL посилання..."
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <button 
                type="button"
                onClick={addImageUrl}
                disabled={isSaving || !urlInput}
                className="bg-slate-900 text-white px-4 rounded-xl hover:bg-black transition-colors disabled:bg-slate-300"
              >
                ОК
              </button>
            </div>

            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={e => { if(!isSaving) { e.preventDefault(); handleFileChange(e as any); } }}
              className={`border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center transition-all group relative ${isSaving ? 'opacity-50' : 'hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer'}`}
            >
              <input 
                type="file" 
                multiple 
                accept="image/*"
                className={`absolute inset-0 opacity-0 ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onChange={handleFileChange}
                disabled={isSaving}
              />
              <Upload className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2" size={32} />
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">Завантажити</span> або Drag & Drop
              </p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">JPG, PNG, WEBP до 10MB</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-sm">
                  <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 p-1.5 bg-white/90 backdrop-blur rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={isSaving}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg 
                  ${isSaving 
                    ? 'bg-indigo-400 text-white shadow-none cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Зберігаємо...
                  </>
                ) : (
                  <>
                    <Save size={20} /> 
                    {id ? "Оновити товар" : "Опублікувати товар"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};