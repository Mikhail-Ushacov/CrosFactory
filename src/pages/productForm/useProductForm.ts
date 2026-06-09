import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Шляхи тепер мають два рівні вгору (../../), оскільки файл у папці /pages/AdminProductForm/
import api from '../../api'; 
import type { Category, Product } from '../../types';

export interface ImageItem {
  id: string;
  type: 'url' | 'file';
  value: string | File;
  preview: string;
}

export interface Characteristic {
  name: string;
  value: number;
  unit: string;
}

export const useProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  const [form, setForm] = useState({
    name: '',
    price: 0,
    description: '',
    category_id: 0,
    isOnSale: false,
    salePrice: 0,
  });

  const [discountPercent, setDiscountPercent] = useState(0);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);

  useEffect(() => {
    // Завантаження категорій з типізацією відповіді
    api.get<Category[]>('/categories').then((res) => {
      setCategories(res.data);
      if (res.data.length > 0 && !id) {
        setForm((prev) => ({ ...prev, category_id: res.data[0].id }));
      }
    });

    // Завантаження товару з типізацією відповіді
    if (id) {
      api.get<Product>(`/products/${id}`)
        .then((res) => {
          const p = res.data;
          setForm({
            name: p.name,
            price: p.price,
            description: p.description || '',
            category_id: p.category_id,
            isOnSale: p.isOnSale || false,
            salePrice: p.salePrice || 0,
          });

          if (p.isOnSale && p.price > 0 && p.salePrice) {
            setDiscountPercent(Math.round(((p.price - p.salePrice) / p.price) * 100));
          }

          if (p.images) {
            // Припускаємо, що p.images приходить як масив рядків (URL)
            setImages(p.images.map((url: string) => ({
              id: Math.random().toString(),
              type: 'url' as const,
              value: url,
              preview: url,
            })));
          }

          if (p.characteristics) setCharacteristics(p.characteristics);
        })
        .catch(() => alert('Помилка завантаження'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  // --- Решта методів залишається такою ж, як у попередній відповіді ---
  
  const handlePriceChange = (val: number) => {
    setForm((prev) => {
      const updated = { ...prev, price: val };
      if (updated.isOnSale) {
        updated.salePrice = Math.round(val * (1 - discountPercent / 100));
      }
      return updated;
    });
  };

  const handleDiscountPercentChange = (percent: number) => {
    const safePercent = Math.min(100, Math.max(0, percent));
    setDiscountPercent(safePercent);
    setForm((prev) => ({
      ...prev,
      salePrice: Math.round(prev.price * (1 - safePercent / 100)),
    }));
  };

  const handleSalePriceChange = (sPrice: number) => {
    setForm((prev) => ({ ...prev, salePrice: sPrice }));
    if (form.price > 0) {
      setDiscountPercent(Math.round(((form.price - sPrice) / form.price) * 100));
    }
  };

  const toggleSale = (checked: boolean) => {
    setForm((prev) => ({ 
        ...prev, 
        isOnSale: checked,
        salePrice: checked ? Math.round(prev.price * 0.9) : 0 
    }));
    if (checked) setDiscountPercent(10);
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

  const addCharacteristic = () => setCharacteristics([...characteristics, { name: '', value: 0, unit: '' }]);
  const updateChar = (index: number, field: keyof Characteristic, val: any) => {
    const updated = [...characteristics];
    updated[index] = { ...updated[index], [field]: val };
    setCharacteristics(updated);
  };
  const removeChar = (index: number) => setCharacteristics(characteristics.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', String(form.price));
    formData.append('description', form.description);
    formData.append('category_id', String(form.category_id));
    formData.append('isOnSale', String(form.isOnSale));
    formData.append('salePrice', String(form.isOnSale ? form.salePrice : 0));
    formData.append('characteristics', JSON.stringify(characteristics));

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