import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Product } from '../types'; // Добавлено слово type
import { useCart } from '../context/CartContext';

export const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('all');
  const { addToCart } = useCart();

  useEffect(() => {
    // Добавлена типизация <Product[]> для axios
    axios.get<Product[]>('http://localhost:3001/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Ошибка загрузки:", err));
  }, []);

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Каталог</h1>
      
      <div className="mb-6 flex gap-4 justify-center">
        <button onClick={() => setFilter('all')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Все</button>
        <button onClick={() => setFilter('electronics')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Электроника</button>
        <button onClick={() => setFilter('clothing')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Одежда</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(product => (
          <div key={product.id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-purple-600 font-bold mb-4">{product.price} ₽</p>
            <button 
              onClick={() => addToCart(product)}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors"
            >
              В корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};