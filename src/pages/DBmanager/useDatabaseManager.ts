import { useState, useEffect, useMemo } from 'react';
import api from '../../api'; // Виправлено шлях (../ -> ../../)
import type { Lookups } from './types'; // Додано type

export const useDatabaseManager = (selectedTable: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [lookups, setLookups] = useState<Lookups>({
    users: [],
    categories: [],
    products: [],
    orders: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/db/${selectedTable}`);
      setData(res.data);

      if (selectedTable === 'order') {
        const users = await api.get('/admin/db/user');
        setLookups(prev => ({ ...prev, users: users.data }));
      } else if (selectedTable === 'product') {
        const cats = await api.get('/admin/db/category');
        setLookups(prev => ({ ...prev, categories: cats.data }));
      } else if (selectedTable === 'item') {
        const [p, o] = await Promise.all([
          api.get('/admin/db/product'),
          api.get('/admin/db/order')
        ]);
        setLookups(prev => ({ ...prev, products: p.data, orders: o.data }));
      }
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setEditingId(null);
    setCurrentPage(1);
  }, [selectedTable]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      const payload = { ...editForm };
      Object.keys(payload).forEach(key => {
        if (key.toLowerCase().includes('id') || ['price', 'order', 'quantity'].includes(key)) {
          if (payload[key] !== "" && payload[key] !== null) {
            payload[key] = Number(payload[key]);
          }
        }
      });

      if (editingId === 'new') {
        await api.post(`/admin/db/${selectedTable}`, payload);
      } else {
        await api.put(`/admin/db/${selectedTable}/${editingId}`, payload);
      }
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      alert("Помилка при збереженні: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ви впевнені, що хочете видалити цей запис?")) return;
    try {
      await api.delete(`/admin/db/${selectedTable}/${id}`);
      fetchData();
    } catch (err) {
      alert("Помилка при видаленні");
    }
  };

  const handleAddNew = () => {
    if (data.length > 0) {
      const schema = Object.keys(data[0]).reduce((acc, key) => {
        if (!['id', 'createdAt', 'updatedAt'].includes(key)) acc[key] = "";
        return acc;
      }, {} as any);
      setEditForm(schema);
    } else {
      setEditForm({ name: "" }); 
    }
    setEditingId('new');
  };

  return {
    data, paginatedData, loading, editingId, editForm, 
    currentPage, itemsPerPage, totalPages, lookups,
    setEditingId, setEditForm, setCurrentPage, setItemsPerPage,
    handleEdit, handleSave, handleDelete, handleAddNew
  };
};