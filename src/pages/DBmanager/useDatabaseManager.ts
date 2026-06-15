import { useState, useEffect } from 'react';
import api from '../../api';
import type { PaginatedResponse } from '../../types';

export const useDatabaseManager = (selectedTable: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<any>>(`/admin/db/${selectedTable}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage
        }
      });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotalRecords(res.data.meta.total);
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setEditingId(null);
    setCurrentPage(1);
  }, [selectedTable]);

  useEffect(() => {
    fetchData();
  }, [selectedTable, currentPage, itemsPerPage]);

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
    data, paginatedData: data, loading, editingId, editForm,
    currentPage, itemsPerPage, totalPages, totalRecords,
    setEditingId, setEditForm, setCurrentPage, setItemsPerPage,
    handleEdit, handleSave, handleDelete, handleAddNew
  };
};
