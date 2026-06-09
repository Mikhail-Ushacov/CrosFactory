import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react'; 


export const Cart = () => {
  const { cart, removeFromCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Корзина пуста</h2>
        <Link to="/" className="text-indigo-600 font-medium hover:underline">Вернуться в магазин</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-10">Корзина</h1>
      
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-50">
          {cart.map(item => (
            <div key={item.id} className="p-6 flex items-center gap-6">
              <img src={item.main_image} className="w-20 h-20 object-cover rounded-2xl bg-slate-50" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <p className="text-sm text-slate-400">Кількість: {item.quantity}</p>
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
                  className="text-red-400 hover:text-red-600 transition-colors mt-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-slate-50/50 p-8 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Итого к оплате</p>
            <p className="text-3xl font-black text-slate-900">{total.toLocaleString()} ₽</p>
          </div>
          <Link 
            to="/checkout" 
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
          >
            К оформлению <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};