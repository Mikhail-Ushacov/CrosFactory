export interface TableConfig {
  id: string;
  name: string;
}

export interface Lookups {
  users: any[];
  categories: any[];
  products: any[];
  orders: any[];
}

export const TABLES: TableConfig[] = [
  { id: 'user', name: 'Користувачі' },
  { id: 'category', name: 'Категорії' },
  { id: 'product', name: 'Товари' },
  { id: 'image', name: 'Зображення' },
  { id: 'order', name: 'Замовлення' },
  { id: 'item', name: 'Позиції замовлень' },
  { id: 'news', name: 'Новини' },
  { id: 'banner', name: 'Банери' },
];

export const ROLES = ['USER', 'ADMIN', 'MANAGER'];
export const PAGE_SIZES = [10, 20, 50, 100];