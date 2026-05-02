import { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

export const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', address: '' });
  const [ordered, setOrdered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:3001/api/orders', { ...form, items: cart, total });
    clearCart();
    setOrdered(true);
  };

  if (ordered) return <div className="p-6 text-green-600">Заказ успешно оформлен!</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Оформление заказа</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          placeholder="Имя" 
          className="w-full border p-2 rounded"
          required
          onChange={e => setForm({...form, name: e.target.value})}
        />
        <input 
          placeholder="Адрес доставки" 
          className="w-full border p-2 rounded"
          required
          onChange={e => setForm({...form, address: e.target.value})}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Оплатить {total} ₽
        </button>
      </form>
    </div>
  );
};