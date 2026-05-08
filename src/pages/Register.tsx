import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Shield, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [form, setForm] = useState({ 
    login: '', 
    password: '', 
    confirmPassword: '',
    role: 'user' as 'user' | 'admin' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Паролі не збігаються');
      return;
    }

    if (form.password.length < 4) {
      setError('Пароль має бути не менше 4 символів');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/register', {
        login: form.login,
        password: form.password,
        role: form.role
      });
      
      // Після успішної реєстрації перенаправляємо на логін
      alert('Реєстрація успішна! Тепер увійдіть у свій акаунт.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка при реєстрації. Можливо, логін вже зайнятий.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold">Створити акаунт</h1>
          <p className="text-indigo-100 mt-1 text-sm">Приєднуйтесь до CrosFactory сьогодні</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 animate-shake">
              {error}
            </div>
          )}

          {/* Логін */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Логін</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" 
                placeholder="Введіть ваш логін"
                value={form.login}
                onChange={e => setForm({...form, login: e.target.value})}
              />
            </div>
          </div>

          {/* Пароль */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" 
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          {/* Підтвердження пароля */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Підтвердіть пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" 
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Обробка..." : (
              <>Зареєструватися <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Вже маєте акаунт? {' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};