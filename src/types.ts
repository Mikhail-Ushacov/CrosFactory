// --- Користувачі ---
export interface User {
  id: number;
  login: string;
  role: 'admin'| 'moderator' | 'user';
}

// --- Категорії ---
export interface Category {
  id: number;
  name: string;
  slug: string;
}

// --- Товари ---
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryId: number;      // Для Prisma
  category_id: number;     // Додайте це (те, що приходить з сервісу)
  category_name: string;   // Приберіть "?" (сервіс завжди повертає назву або 'Без категорії')
  category_slug: string;   // Приберіть "?"
  main_image: string;
  images: string[];
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
  date: string; // Приходить як ISO string (напр. "2024-05-10T14:17:26Z")
  
  // Дані покупця
  customerType: 'individual' | 'business';
  customerName: string;
  email: string;
  phone: string;
  address: string;

  // Реквізити для бізнесу (опціонально)
  edrpou?: string | null;
  iban?: string | null;
  bank?: string | null;
  taxStatus?: string | null;

  // Склад замовлення (якщо завантажено через include)
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  product?: Product; // Для відображення назви/фото в накладних
}

// --- Контент (Банери та Новини) ---
export interface Banner {
  id: number;
  title: string;
  description: string;
  text: string;
  images: string[]; // Масив URL
}

export interface News {
  id: number;
  title: string;
  description: string;
  text: string;
  date: string;
  tag: string;
  images: string[]; // Масив URL
}

// --- Аутентифікація (Відповідь від сервера) ---
export interface AuthResponse {
  token: string;
  user: {
    login: string;
    role: 'admin' | 'user';
  };
}