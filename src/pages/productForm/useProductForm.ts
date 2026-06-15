import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api'; 
import type { Category, Product, PaginatedResponse } from '../../types';

export interface ImageItem {
  id: string;
  type: 'url' | 'file';
  value: string | File;
  preview: string;
}

export interface Characteristic {
  name: string;
  value: number | '';
  unit: string;
}

export const useProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  const [form, setForm] = useState<{
    name: string;
    price: number | '';
    description: string;
    category_id: number;
    isOnSale: boolean;
    salePrice: number | '';
  }>({
    name: '',
    price: '',
    description: '',
    category_id: 0,
    isOnSale: false,
    salePrice: '',
  });

  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);

  useEffect(() => {
    api.get<PaginatedResponse<Category>>('/categories').then((res) => {
      const cats = res.data.data;
      setCategories(cats);
      if (cats.length > 0 && !id) {
        setForm((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    });

    if (id) {
      api.get<Product>(`/products/${id}`)
        .then((res) => {
          const p = res.data;
          setForm({
            name: p.name,
            price: p.price ?? '',
            description: p.description || '',
            category_id: p.category_id,
            isOnSale: p.isOnSale || false,
            salePrice: p.isOnSale && p.salePrice ? p.salePrice : '',
          });

          if (p.isOnSale && p.price > 0 && p.salePrice) {
            setDiscountPercent(Math.round(((p.price - p.salePrice) / p.price) * 100));
          } else {
            setDiscountPercent('');
          }

          if (p.images) {
            setImages(p.images.map((url: string) => ({
              id: Math.random().toString(),
              type: 'url' as const,
              value: url,
              preview: url,
            })));
          }

          if (p.characteristics) {
            setCharacteristics(p.characteristics);
          }
        })
        .catch(() => alert('Помилка завантаження'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);
  
  const handlePriceChange = (val: number | '') => {
    setForm((prev) => {
      const updated = { ...prev, price: val };
      if (updated.isOnSale) {
        if (val === '') {
          updated.salePrice = '';
        } else {
          updated.salePrice = Math.round(val * (1 - (Number(discountPercent) || 0) / 100));
        }
      }
      return updated;
    });
  };

  const handleDiscountPercentChange = (percent: number | '') => {
    if (percent === '') {
      setDiscountPercent('');
      setForm((prev) => ({ ...prev, salePrice: '' }));
      return;
    }
    const safePercent = Math.min(100, Math.max(0, percent));
    setDiscountPercent(safePercent);
    setForm((prev) => {
      const basePrice = Number(prev.price) || 0;
      return {
        ...prev,
        salePrice: Math.round(basePrice * (1 - safePercent / 100)),
      };
    });
  };

  const handleSalePriceChange = (sPrice: number | '') => {
    if (sPrice === '' || sPrice === 0) {
      setDiscountPercent('');
      setForm((prev) => ({ ...prev, salePrice: sPrice }));
      return;
    }
    setForm((prev) => {
      const basePrice = Number(prev.price) || 0;
      if (basePrice > 0) {
        setDiscountPercent(Math.round(((basePrice - sPrice) / basePrice) * 100));
      }
      return { ...prev, salePrice: sPrice };
    });
  };

  const toggleSale = (checked: boolean) => {
    setForm((prev) => ({ 
        ...prev, 
        isOnSale: checked,
        salePrice: checked ? (prev.price === '' ? '' : Math.round(Number(prev.price) * 0.9)) : '' 
    }));
    if (checked) setDiscountPercent(10);
    else setDiscountPercent('');
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(),
      type: 'file' as const,
      value: file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newFiles]);
  };

  const addImageUrl = () => {
    if (!urlInput) return;
    setImages([...images, { id: Math.random().toString(), type: 'url', value: urlInput, preview: urlInput }]);
    setUrlInput('');
  };

  const removeImage = (imgId: string) => setImages(images.filter((img) => img.id !== imgId));

  const addCharacteristic = () => setCharacteristics([...characteristics, { name: '', value: '', unit: '' }]);
  
  const updateChar = (index: number, field: keyof Characteristic, val: any) => {
    const updated = [...characteristics];
    let finalVal = val;
    if (field === 'value') {
      finalVal = val === '' ? '' : Number(val);
    }
    updated[index] = { ...updated[index], [field]: finalVal };
    setCharacteristics(updated);
  };
  
  const removeChar = (index: number) => setCharacteristics(characteristics.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', String(form.price === '' ? 0 : form.price));
    formData.append('description', form.description);
    formData.append('category_id', String(form.category_id));
    formData.append('isOnSale', String(form.isOnSale));
    formData.append('salePrice', String(form.isOnSale ? (form.salePrice === '' ? 0 : form.salePrice) : 0));
    
    const cleanCharacteristics = characteristics.map(c => ({
      ...c,
      value: c.value === '' ? 0 : Number(c.value)
    }));
    formData.append('characteristics', JSON.stringify(cleanCharacteristics));

    const existingUrls: string[] = [];
    images.forEach((img) => {
      if (img.type === 'file') formData.append('files', img.value);
      else existingUrls.push(img.value as string);
    });
    formData.append('existing_urls', JSON.stringify(existingUrls));

    try {
      if (id) await api.put(`/products/${id}`, formData);
      else await api.post('/products', formData);
      navigate('/admin');
    } catch (err) {
      alert('Помилка збереження');
      setIsSaving(false);
    }
  };

  return {
    id, form, setForm, categories, images, characteristics, 
    discountPercent, isSaving, isLoading, urlInput, setUrlInput,
    handlePriceChange, handleDiscountPercentChange, handleSalePriceChange,
    toggleSale, handleFileChange, addImageUrl, removeImage,
    addCharacteristic, updateChar, removeChar, handleSubmit, navigate
  };
};
