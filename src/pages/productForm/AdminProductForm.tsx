import { 
  Save, ArrowLeft, Package, Upload, X, Link as LinkIcon, 
  Loader2, Plus, Trash2, Settings2, Tag 
} from 'lucide-react';
import { useProductForm } from './useProductForm';

export const AdminProductForm = () => {
  const {
    id, form, setForm, categories, images, characteristics, 
    discountPercent, isSaving, isLoading, urlInput, setUrlInput,
    handlePriceChange, handleDiscountPercentChange, handleSalePriceChange,
    toggleSale, handleFileChange, addImageUrl, removeImage,
    addCharacteristic, updateChar, removeChar, handleSubmit, navigate
  } = useProductForm();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p>Завантаження даних...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      <button 
        onClick={() => navigate('/admin')} 
        className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} /> До списку
      </button>

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package size={24} />
          </div>
          {id ? "Редагування товару" : "Новий товар"}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ЛІВА КОЛОНКА */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-5">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Основна інформація</h2>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Назва</label>
                <input 
                  required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-300 transition-all"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              {/* СЕКЦІЯ ЦІНИ ТА ЗНИЖКИ */}
              <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Ціна (₴)</label>
                    <input 
                      type="number" required placeholder="0" className="w-full p-3.5 bg-white border border-slate-100 rounded-xl outline-none focus:border-indigo-300"
                      value={form.price} onChange={e => handlePriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Категорія</label>
                    <select 
                      className="w-full p-3.5 bg-white border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer"
                      value={form.category_id} onChange={e => setForm({...form, category_id: Number(e.target.value)})}
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-10 h-5 rounded-full transition-all relative ${form.isOnSale ? 'bg-rose-500' : 'bg-slate-300'}`}>
                        <input 
                            type="checkbox" className="hidden"
                            checked={form.isOnSale} onChange={e => toggleSale(e.target.checked)}
                        />
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${form.isOnSale ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <Tag size={16} className={form.isOnSale ? 'text-rose-500' : 'text-slate-400'}/>
                        Акційна пропозиція
                    </span>
                  </label>

                  {form.isOnSale && (
                    <div className="grid grid-cols-2 gap-4 mt-5 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-[10px] font-bold text-rose-400 uppercase mb-1.5 ml-1">Знижка %</label>
                        <input 
                          type="number" placeholder="0" className="w-full p-3.5 bg-rose-50/30 border border-rose-100 rounded-xl outline-none focus:border-rose-300 text-rose-600 font-bold"
                          value={discountPercent} onChange={e => handleDiscountPercentChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-rose-400 uppercase mb-1.5 ml-1">Ціна зі знижкою</label>
                        <input 
                          type="number" placeholder="0" className="w-full p-3.5 bg-rose-50/30 border border-rose-100 rounded-xl outline-none focus:border-rose-300 text-rose-600 font-black"
                          value={form.salePrice} onChange={e => handleSalePriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Опис</label>
                <textarea 
                  rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-300 transition-all resize-none"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
            </div>

            {/* ХАРАКТЕРИСТИКИ */}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={16} /> Технічні параметри
                </h2>
                <button type="button" onClick={addCharacteristic} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                  <Plus size={14} /> Додати параметр
                </button>
              </div>
              <div className="space-y-3">
                {characteristics.map((char, index) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <input placeholder="Назва" className="flex-1 p-2 bg-transparent outline-none text-sm" value={char.name} onChange={e => updateChar(index, 'name', e.target.value)} />
                    <input type="number" placeholder="0" className="w-20 p-2 bg-white rounded-lg outline-none text-sm text-center" value={char.value} onChange={e => updateChar(index, 'value', e.target.value)} />
                    <input placeholder="Од." className="w-16 p-2 bg-transparent outline-none text-sm text-center" value={char.unit} onChange={e => updateChar(index, 'unit', e.target.value)} />
                    <button type="button" onClick={() => removeChar(index)} className="p-2 text-slate-300 hover:text-rose-500 cursor-pointer"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ПРАВА КОЛОНКА (ЗОБРАЖЕННЯ) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Медіафайли</h2>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  placeholder="Вставте URL..." value={urlInput} onChange={e => setUrlInput(e.target.value)}
                />
              </div>
              <button type="button" onClick={addImageUrl} className="bg-slate-900 text-white px-5 rounded-xl hover:bg-black transition-colors cursor-pointer">ОК</button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative group">
              <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange(e.target.files)} />
              <Upload className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-500">Завантажити файли</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border group shadow-sm">
                  <img src={img.preview} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-1.5 bg-white/90 backdrop-blur rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-10">
              <button 
                type="submit" disabled={isSaving}
                className={`w-full py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer
                  ${isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:-translate-y-1'}`}
              >
                {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                {id ? "Зберегти зміни" : "Опублікувати товар"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
