import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const Cart = () => {
  const { cart, removeFromCart, total } = useCart();

  if (cart.length === 0) return <div className="p-6 text-center">Корзина пуста</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ваша корзина</h1>
      {cart.map(item => (
        <div key={item.id} className="flex justify-between items-center border-b py-4">
          <div>
            <h3 className="font-medium">{item.name} x {item.quantity}</h3>
            <p>{item.price * item.quantity} ₽</p>
          </div>
          <button onClick={() => removeFromCart(item.id)} className="text-red-500">Удалить</button>
        </div>
      ))}
      <div className="mt-6">
        <p className="text-xl font-bold">Итого: {total} ₽</p>
        <Link to="/checkout" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded">
          Оформить заказ
        </Link>
      </div>
    </div>
  );
};