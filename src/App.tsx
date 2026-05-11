import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
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
  UserCircle
} from 'lucide-react';
import { ProductDetails } from './pages/ProductDetails';
import InvoiceTemplate from './pages/Invoice';
import ProformaInvoice from './pages/Outvoice';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserProfile } from './pages/UserProfile';
import { AdminProfile } from './pages/AdminProfile';
import { AdminProductForm } from './pages/AdminProductForm';
import { Home } from './pages/Home';

const PrivateRoute = ({ children, role }: { children: React.ReactNode, role?: 'user' | 'admin' }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const Sidebar = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 p-6 flex flex-col shadow-sm z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Store size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">Запоріжжя Метиз</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">Меню</p>
        
        <NavLink to="/catalog" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
          <LayoutGrid size={20} />
          <span>Каталог</span>
        </NavLink>

        <NavLink to="/cart" className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
          <div className="flex items-center gap-3"><ShoppingBag size={20} /><span>Кошик</span></div>
          {cart.length > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cart.length}</span>}
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
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
              <div className="max-w-6xl mx-auto">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />

                  {/* Секція адміна */}
                  <Route path="/admin" element={<PrivateRoute role="admin"><AdminProfile /></PrivateRoute>} />
                  <Route path="/admin/product/new" element={<PrivateRoute role="admin"><AdminProductForm /></PrivateRoute>} />
                  <Route path="/admin/product/edit/:id" element={<PrivateRoute role="admin"><AdminProductForm /></PrivateRoute>} />
                  
                  <Route path="/outvoice" element={<PrivateRoute role="admin"><ProformaInvoice /></PrivateRoute>} />
                  <Route path="/invoice" element={<PrivateRoute role="admin"><InvoiceTemplate /></PrivateRoute>} />
                  
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