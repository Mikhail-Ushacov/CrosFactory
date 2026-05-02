import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CartProvider, useCart } from './context/CartContext';
import { ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { cart } = useCart();
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <Link to="/" className="text-xl font-bold">My Shop</Link>
      <Link to="/cart" className="flex items-center">
        <ShoppingCart className="mr-2" />
        <span>{cart.length}</span>
      </Link>
    </nav>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;