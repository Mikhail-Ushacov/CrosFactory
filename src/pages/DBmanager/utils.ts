import type { Lookups } from './types'; // Додано type

export const isImageField = (key: string, value: any): boolean => {
  const imageKeys = ['image', 'url', 'path', 'thumbnail', 'src', 'photo'];
  if (imageKeys.some(k => key.toLowerCase().includes(k))) return true;
  if (typeof value === 'string' && value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) return true;
  return false;
};

export const getDisplayValue = (key: string, value: any, selectedTable: string, lookups: Lookups) => {
  if (key === 'userId') {
    const user = lookups.users.find(u => String(u.id) === String(value));
    return user ? `${user.firstName || ''} ${user.lastName || ''}` : `ID: ${value}`;
  }
  if (key === 'categoryId') {
    const cat = lookups.categories.find(c => String(c.id) === String(value));
    return cat ? cat.name : `ID: ${value}`;
  }
  if (selectedTable === 'item') {
    if (key === 'productId') {
      const prod = lookups.products.find(p => String(p.id) === String(value));
      return prod ? prod.name : `ID: ${value}`;
    }
    if (key === 'orderId') return `Замовлення #${value}`;
  }
  if (typeof value === 'boolean') return value ? '✅' : '❌';
  if (value === null || value === undefined) return '-';
  return String(value);
};