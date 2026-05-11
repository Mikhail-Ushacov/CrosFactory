import { useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Package, Upload, X, Link as LinkIcon, ImagePlus } from 'lucide-react';
import type { Category } from '../types';

interface ImageItem {
  id: string;
  type: 'url' | 'file';
  value: string | File;
  preview: string;
}

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [urlInput, setUrlInput] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    price: 0,
    description: '',
    category_id: 1,
  });

  // Стан для масиву зображень (існуючі URL або нові файли)
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/categories').then(res => setCategories(res.data));
    
    if (id) {
      axios.get(`http://localhost:3001/api/products/${id}`).then(res => {
        setForm({
          name: res.data.name,
          price: res.data.price,
          description: res.data.description,
          category_id: res.data.category_id,
        });
        // Якщо у товара вже є фото (наприклад, main_image та images)
        if (res.data.main_image) {
          setImages([{ 
            id: 'init-main', 
            type: 'url', 
            value: res.data.main_image, 
            preview: res.data.main_image 
          }]);
        }
      });
    }
  }, [id]);

  // Додавання через URL
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

  // Додавання через Файл
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
    let files: FileList | null = null;
    if ('dataTransfer' in e) {
      files = e.dataTransfer?.files || null;
    } else {
      files = (e.target as HTMLInputElement).files;
    }

    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(),
        type: 'file' as const,
        value: file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newFiles]);
    }
  };

  const removeImage = (imgId: string) => {
    setImages(images.filter(img => img.id !== imgId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', String(form.price));
    formData.append('description', form.description);
    formData.append('category_id', String(form.category_id));

    // Розділяємо: файли відправляємо як бінарні дані, URL як текст
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
        await axios.put(`http://localhost:3001/api/products/${id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/products', formData);
      }
      navigate('/admin');
    } catch (err) {
      alert("Помилка збереження");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors cursor-pointer">
        <ArrowLeft size={20} /> Назад
      </button>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900">
          <Package className="text-indigo-600" /> {id ? "Редагувати" : "Новий товар"}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ліва колонка: Текст */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Назва</label>
              <input 
                required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ціна (₴)</label>
                <input 
                  type="number" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                  value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Категорія</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                  value={form.category_id} onChange={e => setForm({...form, category_id: Number(e.target.value)})}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Опис</label>
              <textarea 
                rows={6} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none resize-none"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
          </div>

          {/* Права колонка: Фотографії */}
          <div className="space-y-6">
            <label className="block text-xs font-bold text-slate-400 uppercase">Фотографії товару</label>
            
            {/* Введення URL */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  placeholder="Вставити посилання на фото..."
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                />
              </div>
              <button 
                type="button"
                onClick={addImageUrl}
                className="bg-slate-900 text-white px-4 rounded-xl hover:bg-black transition-colors cursor-pointer"
              >
                Додати
              </button>
            </div>

            {/* Drag & Drop область */}
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileChange(e as any); }}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group cursor-pointer relative"
            >
              <input 
                type="file" 
                multiple 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <Upload className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2" size={32} />
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">Натисніть</span> або перетягніть файли
              </p>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG до 5MB</p>
            </div>

            {/* Попередній перегляд */}
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white p-1 rounded-lg transition-all"
                  >
                    <X size={14} />
                  </button>
                  {img.type === 'file' && (
                    <div className="absolute bottom-1 left-1 bg-indigo-600 text-[8px] text-white px-1.5 py-0.5 rounded uppercase font-bold">
                      Local
                    </div>
                  )}
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-3 py-10 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-100 text-slate-300">
                   <ImagePlus size={40} />
                   <p className="text-xs mt-2">Немає доданих фото</p>
                </div>
              )}
            </div>

            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer mt-4">
              <Save size={20} /> Зберегти товар
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};