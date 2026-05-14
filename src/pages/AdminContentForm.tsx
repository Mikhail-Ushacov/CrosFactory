import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, ImagePlus, X, Upload, Loader2 } from 'lucide-react';
import api from '../api';

export const AdminContentForm = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'banner'; // 'banner' або 'news'
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    text: '', // Для банера це текст кнопки, для новин - основний контент
    tag: 'Новини'
  });

  const [images, setImages] = useState<{file: File, preview: string}[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('text', form.text);
    if (type === 'news') formData.append('tag', form.tag);
    
    images.forEach(img => formData.append('files', img.file));
    formData.append('existing_urls', JSON.stringify([]));

    try {
      const endpoint = type === 'banner' ? '/banners' : '/news';
      await api.post(endpoint, formData);
      navigate('/admin/content');
    } catch (err) {
      alert("Помилка при збереженні");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6">
        <ArrowLeft size={20} /> Назад
      </button>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h1 className="text-2xl font-bold capitalize">Додати {type === 'banner' ? 'банер' : 'новину'}</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Заголовок</label>
            <input required className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Короткий опис</label>
            <input required className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          {type === 'news' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Тег (Акція, Новини тощо)</label>
              <input className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              {type === 'banner' ? 'Текст на кнопці' : 'Повний текст новини'}
            </label>
            <textarea rows={5} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              value={form.text} onChange={e => setForm({...form, text: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-4">Зображення (можна декілька)</label>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border">
                  <img src={img.preview} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-all">
                <ImagePlus size={24} />
                <span className="text-[10px] font-bold mt-1">Додати</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>

        <button disabled={isSaving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all">
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Зберегти
        </button>
      </form>
    </div>
  );
};