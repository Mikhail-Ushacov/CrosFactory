import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import slugify from '../../Slugify';

export const useAdminCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [form, setForm] = useState({ name: '', slug: '', isHidden: false });

  // Товари
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Стан таблиці
  const [searchTerm, setSearchTerm] = useState('');
  const [onlySale, setOnlySale] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await api.get('/products');
        setAllProducts(prodRes.data);

        if (id) {
          const catRes = await api.get(`/categories/${id}`);
          setForm({ 
            name: catRes.data.name, 
            slug: catRes.data.slug,
            isHidden: !!catRes.data.isHidden 
          });
          setSelectedIds(catRes.data.products?.map((p: any) => p.id) || []);
        }
      } catch (err) {
        console.error("Помилка завантаження даних", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Обчислення відфільтрованих товарів
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (onlySale) {
      result = result.filter(p => p.isOnSale);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'price') {
            aValue = a.isOnSale ? a.salePrice : a.price;
            bValue = b.isOnSale ? b.salePrice : b.price;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allProducts, searchTerm, onlySale, sortConfig]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleProduct = (productId: number) => {
    setSelectedIds(prev => 
      prev.includes(productId) ? prev.filter(pId => pId !== productId) : [...prev, productId]
    );
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm({ ...form, name, slug: slugify(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form, productIds: selectedIds };
      if (id) {
        await api.put(`/categories/${id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      navigate('/admin');
    } catch (err) {
      alert("Помилка при збереженні категорії");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    id, form, setForm,
    isLoading, isSaving,
    selectedIds,
    searchTerm, setSearchTerm,
    onlySale, setOnlySale,
    sortConfig,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    filteredProducts, totalPages, currentItems,
    toggleProduct, requestSort, handleNameChange, handleSubmit,
    navigate
  };
};