// --- Користувачі ---
export interface User {
  id: number;
  login: string;
  role: 'admin' | 'moderator' | 'user';
}

// --- Категорії ---
export interface Category {
  id: number;
  name: string;
  slug: string;
  isHidden: boolean;
  _count?: {
    products: number;
  };
}

// --- Товари ---
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  
  // Поля категорій
  categoryId: number;      // Згідно з Prisma
  category_id: number;     // Для сумісності з сервісом
  category_name: string;
  category_slug: string;
  
  // Медіа
  main_image: string;
  images: string[];
  
  // --- НОВІ ПОЛЯ ДЛЯ ЗНИЖОК ---
  isOnSale: boolean;
  salePrice: number | null;
  // ---------------------------

  characteristics?: {
    name: string;
    value: number;
    unit: string;
  }[];
}

// --- Кошик ---
export interface CartItem extends Product {
  quantity: number;
}

// --- Замовлення ---
export interface Order {
  id: number;
  userId: number;
  sum: number;
  date: string; 
  
  customerType: 'individual' | 'business';
  customerName: string;
  email: string;
  phone: string;
  address: string;

  edrpou?: string | null;
  iban?: string | null;
  bank?: string | null;
  taxStatus?: string | null;

  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  product?: Product;
}

// --- Контент (Банери та Новини) ---
export interface Banner {
  id: number;
  title: string;
  description: string;
  text: string;
  order: number;
  images: string[];
  categories?: Category[];
  products?: (Product & { main_image: string })[];
}

export interface News {
  id: number;
  title: string;
  description: string;
  tag: string;
  date: string;
  images: string[];
  contentBlocks?: NewsBlock[];
}

export interface NewsBlock {
  id: number;
  title?: string;
  text?: string;
  order: number;
  images: string[];
  products: (Product & { main_image: string })[];
}

// --- Аутентифікація ---
export interface AuthResponse {
  token: string;
  user: {
    login: string;
    role: 'admin' | 'moderator' | 'user'; // Додано 'moderator' для відповідності
  };
}