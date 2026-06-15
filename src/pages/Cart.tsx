import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Кошик порожній</h2>
        <Link to="/" className="text-indigo-600 font-medium hover:underline">Повернутися в магазин</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-10">Кошик</h1>
      
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-50">
          {cart.map(item => (
            <div key={item.id} className="p-6 flex items-center gap-6">
              <Link to={`/product/${item.id}`} className="flex items-center gap-4 flex-1">
                <img src={item.main_image} className="w-20 h-20 object-cover rounded-2xl bg-slate-50 shrink-0" />
                <h3 className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">{item.name}</h3>
              </Link>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Minus size={14} />
                </button>
                
                <span className="font-bold text-slate-700 min-w-[20px] text-center">
                  {item.quantity}
                </span>
                
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="text-right">
                {item.isOnSale && item.salePrice ? (
                  <>
                    <p className="text-xs text-slate-400 line-through decoration-red-300">
                      {(item.price * item.quantity).toLocaleString()} ₴
                    </p>
                    <p className="font-bold text-red-600">
                      {(item.salePrice * item.quantity).toLocaleString()} ₴
                    </p>
                  </>
                ) : (
                  <p className="font-bold text-slate-900">
                    {(item.price * item.quantity).toLocaleString()} ₴
                  </p>
                )}
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors mt-2"
                  title="Видалити"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Підсумок */}
        <div className="bg-slate-50/50 p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Разом до оплати</p>
            <p className="text-3xl font-black text-slate-900">{total.toLocaleString()} ₴</p>
          </div>
          <Link 
            to="/checkout" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
          >
            До оформлення <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};