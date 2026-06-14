import { Search, Package, Plus, ExternalLink, X, Loader2 } from 'lucide-react';

// --- Interfaces ---

export interface ProductPreview {
  id: number;
  name: string;
  category?: { name: string };
  price: number;
}

export interface CategoryPreview {
  id: number;
  name: string;
  slug: string;
}

export interface ProductSelectorProps {
  selectedProducts: ProductPreview[];
  onAdd: (product: ProductPreview) => void;
  onRemove: (productId: number) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: ProductPreview[];
}

export interface CategorySelectorProps {
  selectedCategories: CategoryPreview[];
  onAdd: (category: CategoryPreview) => void;
  onRemove: (categoryId: number) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCategories: CategoryPreview[];
}

// --- Components ---

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-20 gap-4">
    <Loader2 className="animate-spin text-indigo-600" size={40} />
    <p className="text-slate-400 font-medium">Завантаження...</p>
  </div>
);

export const ProductSelector = ({ 
  selectedProducts, onAdd, onRemove, isActive, setIsActive, 
  searchQuery, setSearchQuery, filteredProducts 
}: ProductSelectorProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
        <Package size={14}/> Прив'язані товари
      </label>
      <button type="button" onClick={() => setIsActive(!isActive)} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
        <Plus size={14}/> Додати товар
      </button>
    </div>

    {isActive && (
      <div className="relative z-20">
        <div className="absolute top-0 left-0 right-0 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input autoFocus placeholder="Пошук товару..." className="w-full p-2 pl-10 bg-slate-50 rounded-lg text-sm outline-none border border-slate-100" 
                   value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
            {filteredProducts.map((p) => (
              <div key={p.id} onClick={() => onAdd(p)} className="flex items-center justify-between p-2 hover:bg-indigo-50 rounded-lg cursor-pointer group">
                <div>
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{p.category?.name}</p>
                </div>
                <Plus size={16} className="text-slate-300 group-hover:text-indigo-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    <div className="flex flex-wrap gap-2">
      {selectedProducts.map((p) => (
        <div key={p.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 pl-3 pr-1 py-1 rounded-full group">
          <span className="text-[11px] font-bold text-slate-600">{p.name}</span>
          <div className="flex items-center">
            <button type="button" onClick={() => window.open(`/product/${p.id}`, '_blank')} className="p-1 text-slate-300 hover:text-indigo-600">
              <ExternalLink size={12} />
            </button>
            <button type="button" onClick={() => onRemove(p.id)} className="p-1 text-slate-300 hover:text-red-500">
              <X size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CategorySelector = ({ 
  selectedCategories, onAdd, onRemove, isActive, setIsActive, 
  searchQuery, setSearchQuery, filteredCategories 
}: CategorySelectorProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
        <Package size={14}/> Прив'язані категорії
      </label>
      <button type="button" onClick={() => setIsActive(!isActive)} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
        <Plus size={14}/> Додати категорію
      </button>
    </div>

    {isActive && (
      <div className="relative z-20">
        <div className="absolute top-0 left-0 right-0 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input autoFocus placeholder="Пошук категорії..." className="w-full p-2 pl-10 bg-slate-50 rounded-lg text-sm outline-none border border-slate-100" 
                   value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
            {filteredCategories.map((c) => (
              <div key={c.id} onClick={() => onAdd(c)} className="flex items-center justify-between p-2 hover:bg-indigo-50 rounded-lg cursor-pointer group">
                <div>
                  <p className="text-sm font-bold">{c.name}</p>
                </div>
                <Plus size={16} className="text-slate-300 group-hover:text-indigo-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    <div className="flex flex-wrap gap-2">
      {selectedCategories.map((c) => (
        <div key={c.id} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 pl-3 pr-1 py-1 rounded-full group">
          <span className="text-[11px] font-bold text-indigo-700">{c.name}</span>
          <div className="flex items-center">
            <button 
              type="button" 
              onClick={() => window.open(`/catalog?category=${c.id}`, '_blank')} 
              className="p-1 text-indigo-300 hover:text-indigo-600"
            >
              <ExternalLink size={12} />
            </button>
            <button type="button" onClick={() => onRemove(c.id)} className="p-1 text-indigo-300 hover:text-red-500">
              <X size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);