export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  main_image: string; // Основное фото для превью
  images?: string[];   // Массив всех 5 фотографий (для карточки товара)
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}