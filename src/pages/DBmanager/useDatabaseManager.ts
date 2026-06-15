import { useState, useEffect } from 'react';
import api from '../../api';
import type { PaginatedResponse } from '../../types';
import axios from 'axios';

export const useDatabaseManager = (selectedTable: string) => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Record<string, unknown>>>(`/admin/db/${selectedTable}`, {
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

  const handleEdit = (item: Record<string, unknown>) => {
    setEditingId(item.id as number);
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
    } catch (err: unknown) {
      alert("Помилка при збереженні: " + (axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : 'Невідома помилка'));
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
      }, {} as Record<string, unknown>);
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
