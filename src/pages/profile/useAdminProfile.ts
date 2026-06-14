import { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import type { Product, Order } from '../../types'; 

export type TabType = 'products' | 'categories';

export const useAdminProfile = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newsCount, setNewsCount] = useState(0);
   const [bannersCount, setBannersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, statsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/admin/stats'),
      ]);

      setProducts(prodRes.data);
      setCategories(catRes.data);
      setOrders(statsRes.data.orders);
      setNewsCount(statsRes.data.newsCount || 0);
      setBannersCount(statsRes.data.bannersCount || 0);
    } catch (err) {
      console.error("Помилка при завантаженні даних:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

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
      productsCount: products.length,
      categoriesCount: categories.length
    };
  }, [orders, products, categories]);

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Видалити цей товар?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err) { alert("Помилка при видаленні"); }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Видалити категорію?")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchData();
      } catch (err) { alert("Помилка при видаленні"); }
    }
  };

  const handleToggleCategoryVisibility = async (id: number, currentStatus: boolean) => {
  try {
    await api.put(`/categories/${id}`, { isHidden: !currentStatus });
    fetchData(); // Оновлюємо дані
  } catch (err) {
    alert("Помилка при зміні статусу");
  }
};

  return {
    // States
    loading,
    activeTab,
    setActiveTab,
    productSearch,
    setProductSearch,
    categorySearch,
    setCategorySearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleToggleCategoryVisibility,
    // Data
    stats,
    newsCount,
    bannersCount,
    totalContentCount: newsCount + bannersCount,
    paginatedProducts,
    filteredCategories,
    totalPages,
    // Actions
    handleDeleteProduct,
    handleDeleteCategory,
    refreshData: fetchData
  };
};