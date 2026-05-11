import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../api';

export const Login = () => {
  const [form, setForm] = useState({ login: '', password: '' });
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      alert("Помилка входу");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold mb-6">Вхід</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          className="w-full p-3 border rounded-xl" 
          placeholder="Логін" 
          onChange={e => setForm({...form, login: e.target.value})} 
        />
        <input 
          type="password" 
          className="w-full p-3 border rounded-xl" 
          placeholder="Пароль" 
          onChange={e => setForm({...form, password: e.target.value})} 
        />
        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Увійти</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Немає аккаунту? <Link to="/register" className="text-indigo-600">Реєстрація</Link>
      </p>
    </div>
  );
};