import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart } = useCart();

  useEffect(() => {
    // Загрузка товаров
    axios.get<Product[]>('http://localhost:3001/api/products')
      .then(res => setProducts(res.data));
    
    // Загрузка категорий
    axios.get<Category[]>('http://localhost:3001/api/categories')
      .then(res => setCategories(res.data));
  }, []);

  const filtered = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category_slug === activeCategory);

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Каталог</h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              activeCategory === 'all' ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-100"
            }`}
          >
            Всі товари
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                activeCategory === cat.slug ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-3xl border border-slate-100 p-3 hover:shadow-xl transition-all group relative">
              <Link to={`/product/${product.id}`}>
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50">
                <img 
                  src={product.main_image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
              </div>
              <div className="px-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">{product.category_name}</span>
                <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
              </div>
            </Link>
            
            <div className="px-2 flex items-center justify-between mt-3">
              <span className="font-bold text-indigo-600">{product.price.toLocaleString()} ₽</span>
              <button 
                onClick={() => addToCart(product)}
                className="bg-slate-100 text-slate-900 p-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};