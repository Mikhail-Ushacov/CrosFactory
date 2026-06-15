import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import api from '../../api';
import { useDebounce } from '../../hooks/useDebounce';

interface LookupSearchInputProps {
  model: string;
  value: string | number;
  onChange: (value: string | number) => void;
  label: string;
}

const displayFields: Record<string, string> = {
  user: 'login',
  category: 'name',
  product: 'name',
  order: 'customerName',
};

export const LookupSearchInput = ({ model, value, onChange, label }: LookupSearchInputProps) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (value && !isSearchActive) {
      setSelectedLabel(`ID: ${value}`);
    }
  }, [value, model, isSearchActive]);

  useEffect(() => {
    if (debouncedSearch.trim().length > 0) {
      setIsSearching(true);
      api.get(`/admin/db/${model}`, {
        params: { search: debouncedSearch, limit: 10 }
      })
        .then(res => setSearchResults(res.data.data || []))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, model]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: Record<string, unknown>) => {
    onChange(item.id as number);
    const field = displayFields[model] || 'id';
    setSelectedLabel((item[field] as string) || `ID: ${item.id as number}`);
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClear = () => {
    onChange('');
    setSelectedLabel('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleActivate = () => {
    setIsSearchActive(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const baseInputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">{label}</label>
      
      {!isSearchActive ? (
        <div className="relative">
          <input
            readOnly
            value={selectedLabel || `ID: ${value || ''}`}
            onClick={handleActivate}
            placeholder="Натисніть для пошуку..."
            className={`${baseInputClass} cursor-pointer pr-10`}
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      ) : (
        <div className="relative">
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук..."
            className={`${baseInputClass} pr-10`}
          />
          {isSearching ? (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
          ) : searchQuery ? (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          ) : null}

          {(searchResults.length > 0 || isSearching) && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {searchResults.map((item: Record<string, unknown>) => {
                const field = displayFields[model] || 'id';
                const display = (item[field] as string) || `ID: ${item.id as number}`;
                return (
                  <button
                    key={item.id as number}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer border-b border-slate-50 last:border-b-0"
                  >
                    {display}
                    <span className="text-xs text-slate-400 ml-2">ID: {item.id as number}</span>
                  </button>
                );
              })}
            </div>
          )}

          {!isSearching && debouncedSearch.trim().length > 0 && searchResults.length === 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-sm text-slate-500 text-center">
              Нічого не знайдено
            </div>
          )}
        </div>
      )}

      {value && !isSearchActive && (
        <button
          onClick={handleClear}
          className="absolute right-1 top-7 p-1 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};
