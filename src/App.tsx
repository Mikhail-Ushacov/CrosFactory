import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CartProvider, useCart } from './context/CartContext';
import { LayoutGrid, ShoppingBag, CreditCard, Store, FileText, FileCheck } from 'lucide-react'; // Додано FileCheck
import { ProductDetails } from './pages/ProductDetails';
import InvoiceTemplate from './pages/Invoice';
import ProformaInvoice from './pages/Outvoice'; // Додано імпорт Outvoice

const Sidebar = () => {
  const { cart } = useCart();
  
  const navItems = [
    { to: "/", icon: <LayoutGrid size={20} />, label: "Каталог" },
    { to: "/cart", icon: <ShoppingBag size={20} />, label: "Корзина", count: cart.length },
    { to: "/checkout", icon: <CreditCard size={20} />, label: "Оплата" },
    { to: "/outvoice", icon: <FileText size={20} />, label: "Рахунок" }, // Новий пункт
    { to: "/invoice", icon: <FileCheck size={20} />, label: "Накладна" }, // Змінено для ясності
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <Store size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">CrosFactory</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? "bg-indigo-50 text-indigo-600 font-medium" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.count !== undefined && item.count > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-slate-50 rounded-2xl">
        <p className="text-xs text-slate-400 mb-1">Нужна помощь?</p>
        <a href="#" className="text-sm font-medium text-slate-900 hover:underline">Поддержка 24/7</a>
      </div>
    </aside>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <main className="ml-64 flex-1 min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/outvoice" element={<ProformaInvoice />} /> {/* Новий маршрут */}
                <Route path="/invoice" element={<InvoiceTemplate />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;