import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api'; 
import { useCart } from '../../context/CartContext';
import type { Product, Category } from '../../types';

interface Characteristic {
  name: string;
  value: number;
  unit: string;
}

interface FilterGroup {
  displayName: string;
  unit: string;
  min: number;
  max: number;
}

export const useSmartCatalog = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { addToCart } = useCart();

  // Параметри відображення
  const currentPage = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = parseInt(searchParams.get('limit') || '6');
  const sortOrder = searchParams.get('sort') || 'default';

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => setCategories(res.data));
  }, []);

   useEffect(() => {
    if (categories.length > 0) {
      // Шукаємо категорію
      const foundCat = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
      
      if (categorySlug && !foundCat) {
        navigate('/smart-catalog');
      }
      
      // ВИПРАВЛЕННЯ 1: Додаємо || null, щоб уникнути undefined
      setSelectedCategory(foundCat || null);
    }
  }, [categorySlug, categories, navigate]);

  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      api.get<Product[]>(`/products?category=${selectedCategory.id}`)
        .then((res) => setProducts(res.data.filter(p => p.category_id === selectedCategory.id)))
        .finally(() => setLoading(false));
    }
  }, [selectedCategory]);

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => {
      // ВИПРАВЛЕНО: Фільтруємо приховані категорії тут
      const visibleCategories = res.data.filter(cat => !cat.isHidden);
      setCategories(visibleCategories);
    });
  }, []);

  // Розрахунок динамічних фільтрів (Min/Max для ціни та характеристик)
  const dynamicFilters = useMemo(() => {
    const filters: { [key: string]: FilterGroup } = {};
    
    if (products.length === 0) return filters;

    // Додаємо ціну як базовий фільтр
    const prices = products.map(p => p.isOnSale && p.salePrice ? p.salePrice : p.price);
    filters['price'] = {
      displayName: 'Ціна',
      unit: '₴',
      min: Math.min(...prices),
      max: Math.max(...prices)
    };

    products.forEach((p) => {
      (p.characteristics as Characteristic[] | undefined)?.forEach((char) => {
        const key = char.name.toLowerCase();
        if (!filters[key]) {
          filters[key] = { displayName: char.name, unit: char.unit, min: char.value, max: char.value };
        } else {
          filters[key].min = Math.min(filters[key].min, char.value);
          filters[key].max = Math.max(filters[key].max, char.value);
        }
      });
    });
    return filters;
  }, [products]);

  // Фільтрація та Сортування
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // ВИПРАВЛЕННЯ 2: Замінюємо 'bounds' на '_', бо змінна не використовується
      return Object.entries(dynamicFilters).every(([key, _]) => {
        const param = searchParams.get(`range_${key}`);
        if (!param) return true;
        
        const [min, max] = param.split('-').map(Number);
        
        if (key === 'price') {
          const currentPrice = p.isOnSale && p.salePrice ? p.salePrice : p.price;
          return currentPrice >= min && currentPrice <= max;
        }

        const char = (p.characteristics as Characteristic[] | undefined)?.find(
          c => c.name.toLowerCase() === key
        );
        
        return char ? (char.value >= min && char.value <= max) : false;
      });
    });

    if (sortOrder === 'cheap') result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    if (sortOrder === 'expensive') result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));

    return result;
  }, [products, searchParams, dynamicFilters, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Обробники
  const updateRangeFilter = (key: string, min: number, max: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`range_${key}`, `${min}-${max}`);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sort === 'default') newParams.delete('sort');
    else newParams.set('sort', sort);
    setSearchParams(newParams);
  };

  const handleLimitChange = (limit: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', limit);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({ limit: itemsPerPage.toString() });

  return {
    categorySlug, categories, selectedCategory, loading, currentItems,
    filteredProducts, totalPages, currentPage, dynamicFilters,
    addToCart, navigate, updateRangeFilter, clearFilters,
    sortOrder, handleSortChange, itemsPerPage, handleLimitChange,
    isSidebarOpen, setIsSidebarOpen, searchParams
  };
};