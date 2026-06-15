import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api'; 
import { useCart } from '../../context/CartContext';
import type { Product, Category, PaginatedResponse } from '../../types';

export interface FilterGroup {
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
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, FilterGroup>>({});
  
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { addToCart } = useCart();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = parseInt(searchParams.get('limit') || '6', 10);
  const sortOrder = searchParams.get('sort') || 'default';

  useEffect(() => {
    api.get<PaginatedResponse<Category>>('/categories').then((res) => {
      const visible = res.data.data.filter((cat: Category) => !cat.isHidden);
      setCategories(visible);
    });
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const foundCat = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
      if (categorySlug && !foundCat) {
        navigate('/smart-catalog');
      }
      setSelectedCategory(foundCat || null);
    }
  }, [categorySlug, categories, navigate]);

  useEffect(() => {
    if (selectedCategory) {
      api.get<Record<string, FilterGroup>>('/products/filters', {
        params: { category: selectedCategory.id }
      }).then(res => setDynamicFilters(res.data));
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      
      const params: Record<string, string> = {
        category: selectedCategory.id.toString(),
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      };

      if (sortOrder !== 'default') {
        params.sort = sortOrder;
      }

      for (const [key, value] of searchParams.entries()) {
        if (key.startsWith('range_')) {
          params[key] = value;
        }
      }

      api.get<PaginatedResponse<Product>>('/products', { params })
        .then((res) => {
          setProducts(res.data.data);
          setMeta(res.data.meta);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCategory, searchParams, currentPage, itemsPerPage, sortOrder]);

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
    newParams.set('page', '1');
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
    categorySlug, categories, selectedCategory, loading,
    currentItems: products, filteredProducts: products,
    totalPages: meta.totalPages, currentPage: meta.page, meta, dynamicFilters,
    addToCart, navigate, updateRangeFilter, clearFilters,
    sortOrder, handleSortChange, itemsPerPage, handleLimitChange,
    isSidebarOpen, setIsSidebarOpen, searchParams
  };
};
