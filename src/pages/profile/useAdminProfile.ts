import { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import type { Product, Order, PaginatedResponse } from '../../types'; 
import { useDebounce } from '../../hooks/useDebounce';

export type TabType = 'products' | 'categories';

export const useAdminProfile = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newsCount, setNewsCount] = useState(0);
  const [bannersCount, setBannersCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 400);
  
  const [categorySearch, setCategorySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadStatsAndCategories = async () => {
    try {
      const [catRes, statsRes] = await Promise.all([
        api.get<PaginatedResponse<any>>('/categories'),
        api.get('/admin/stats'),
      ]);
      setCategories(catRes.data.data);
      setTotalCategories(catRes.data.meta.total);
      setOrders(statsRes.data.orders);
      setNewsCount(statsRes.data.newsCount || 0);
      setBannersCount(statsRes.data.bannersCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get<PaginatedResponse<Product>>('/products', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedProductSearch || undefined
        }
      });
      setProducts(res.data.data);
      setTotalProducts(res.data.meta.total);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadStatsAndCategories().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    }
  }, [currentPage, itemsPerPage, debouncedProductSearch, activeTab]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyIncome = orders
      .filter(order => new Date(order.date) >= startOfMonth)
      .reduce((sum, order) => sum + order.sum, 0);
    const activeClientsCount = new Set(orders.map(o => o.userId)).size;

    return {
      ordersCount: orders.length,
      clientsCount: activeClientsCount,
      income: monthlyIncome,
      productsCount: totalProducts, 
      categoriesCount: totalCategories
    };
  }, [orders, products, categories]);

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Видалити цей товар?")) {
      try {
        await api.delete(`/products/${id}`);
        loadProducts();
      } catch (err) { alert("Помилка при видаленні"); }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Видалити категорію?")) {
      try {
        await api.delete(`/categories/${id}`);
        loadStatsAndCategories();
      } catch (err) { alert("Помилка при видаленні"); }
    }
  };

  const handleToggleCategoryVisibility = async (id: number, currentStatus: boolean) => {
  try {
    await api.put(`/categories/${id}`, { isHidden: !currentStatus });
    loadStatsAndCategories();
  } catch (err) {
    alert("Помилка при зміні статусу");
  }
};

  return {
    loading,
    activeTab, setActiveTab,
    productSearch, setProductSearch,
    categorySearch, setCategorySearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    handleToggleCategoryVisibility,
    stats,
    newsCount,
    bannersCount,
    totalContentCount: newsCount + bannersCount,
    paginatedProducts: products,
    filteredCategories,
    totalPages,
    handleDeleteProduct,
    handleDeleteCategory
  };
};
