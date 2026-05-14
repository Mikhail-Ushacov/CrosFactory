import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  LayoutGrid, 
  ShoppingBag, 
  Store, 
  FileText, 
  FileCheck, 
  ShieldCheck, 
  LogIn, 
  LogOut,
  UserCircle,
  Menu,
  X,
  Home as HomeIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProductDetails } from './pages/ProductDetails';
import InvoiceTemplate from './pages/Invoice';
import ProformaInvoice from './pages/Outvoice';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserProfile } from './pages/UserProfile';
import { AdminProfile } from './pages/AdminProfile';
import { AdminProductForm } from './pages/AdminProductForm';
import { AdminContentForm } from './pages/AdminContentForm';
import { AdminContentManager } from './pages/AdminContentManager';
import { Home } from './pages/Home';

// Оновлений PrivateRoute
const PrivateRoute = ({ children, role }: { children: React.ReactNode, role?: 'user' | 'admin' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Компонент бічного меню (Sidebar)
const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => {
  const { totalItems } = useCart(); 
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);
  
  return (
    <>
      {/* Overlay для мобілки */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 p-6 flex flex-col shadow-xl lg:shadow-sm z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Store size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Запоріжжя<br/>Метиз</span>
          </NavLink>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">Меню</p>
          
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
            <HomeIcon size={20} />
            <span>Головна</span>
          </NavLink>

          <NavLink to="/catalog" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
            <LayoutGrid size={20} />
            <span>Каталог</span>
          </NavLink>

          <NavLink to="/cart" className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
            <div className="flex items-center gap-3"><ShoppingBag size={20} /><span>Кошик</span></div>
            {/* ВИПРАВЛЕНО: використовуємо totalItems */}
            {totalItems > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalItems}</span>}
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Адмін</p></div>
              <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-orange-50 text-orange-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
                <ShieldCheck size={20} /><span>Управління</span>
              </NavLink>
              <NavLink to="/outvoice" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
                <FileText size={20} /><span>Рахунки</span>
              </NavLink>
              <NavLink to="/invoice" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
                <FileCheck size={20} /><span>Накладні</span>
              </NavLink>
            </>
          )}

          <div className="pt-4 pb-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Акаунт</p></div>
          {user ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
                <UserCircle size={20} /><span>Профіль</span>
              </NavLink>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all mt-2 cursor-pointer">
                <LogOut size={20} /><span>Вийти</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-indigo-600 text-white font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
              <LogIn size={20} /><span>Увійти</span>
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
};

// Новий компонент мобільного хедера
const MobileHeader = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const { totalItems } = useCart();
  
  return (
    <header className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <button onClick={onMenuOpen} className="p-2 text-slate-600 outline-none">
        <Menu size={24} />
      </button>
      <NavLink to="/" className="font-bold text-slate-900">Запоріжжя Метиз</NavLink>
      <NavLink to="/cart" className="p-2 text-slate-600 relative">
        <ShoppingBag size={24} />
        {/* Бейдж з кількістю товарів */}
        {totalItems > 0 && (
          <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white flex items-center justify-center min-w-[18px] h-[18px]">
            {totalItems}
          </span>
        )}
      </NavLink>
    </header>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="flex bg-slate-50 min-h-screen">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 lg:ml-64 w-full">
              {/* Мобільний хедер тепер має доступ до контексту кошика */}
              <MobileHeader onMenuOpen={() => setIsSidebarOpen(true)} />

              <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                  <Route path="/admin" element={<PrivateRoute role="admin"><AdminProfile /></PrivateRoute>} />
                  <Route path="/admin/product/new" element={<PrivateRoute role="admin"><AdminProductForm /></PrivateRoute>} />
                  <Route path="/admin/product/edit/:id" element={<PrivateRoute role="admin"><AdminProductForm /></PrivateRoute>} />
                  <Route path="/outvoice" element={<PrivateRoute role="admin"><ProformaInvoice /></PrivateRoute>} />
                  <Route path="/invoice" element={<PrivateRoute role="admin"><InvoiceTemplate /></PrivateRoute>} />
                  <Route path="/outvoice/:id" element={<PrivateRoute><ProformaInvoice /></PrivateRoute>} />
                  <Route path="/invoice/:id" element={<PrivateRoute><InvoiceTemplate /></PrivateRoute>} />
                  <Route path="/admin/content" element={<PrivateRoute role="admin"><AdminContentManager /></PrivateRoute>} />
                  <Route path="/admin/content/new" element={<PrivateRoute role="admin"><AdminContentForm /></PrivateRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;