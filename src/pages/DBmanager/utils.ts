export const isImageField = (key: string, value: unknown): boolean => {
  const imageKeys = ['image', 'url', 'path', 'thumbnail', 'src', 'photo'];
  if (imageKeys.some(k => key.toLowerCase().includes(k))) return true;
  if (typeof value === 'string' && value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) return true;
  return false;
};

export const getDisplayValue = (key: string, value: unknown, _selectedTable: string) => {
  if (key === 'orderId') return `Замовлення #${value}`;
  if (typeof value === 'boolean') return value ? '✅' : '❌';
  if (value === null || value === undefined) return '-';
  return String(value);
};
