import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import type { Product, Category, PaginatedResponse } from '../../types';
import api from '../../api';
import { useDebounce } from '../../hooks/useDebounce';

export interface Banner {
  id: number;
  title: string;
  description: string;
  text: string;
  images: string[];
  products?: { id: number }[];
  categories?: { id: number }[];
}

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  text: string;
  date: string;
  tag: string;
  images: string[];
}

export const useHomeData = () => {
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<Category[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const productTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const nextSlide = useCallback(() => {
    setCurrentSlide((s) => (banners.length > 0 ? (s === banners.length - 1 ? 0 : s + 1) : 0));
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((s) => (banners.length > 0 ? (s === 0 ? banners.length - 1 : s - 1) : 0));
  }, [banners.length]);

  const nextProduct = useCallback(() => {
    setCurrentProductSlide((s) => (discountedProducts.length > 0 ? (s === discountedProducts.length - 1 ? 0 : s + 1) : 0));
  }, [discountedProducts.length]);

  const prevProduct = useCallback(() => {
    setCurrentProductSlide((s) => (discountedProducts.length > 0 ? (s === 0 ? discountedProducts.length - 1 : s - 1) : 0));
  }, [discountedProducts.length]);

  const startTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (productTimerRef.current) clearInterval(productTimerRef.current);
    
    if (banners.length > 1) {
      timerRef.current = setInterval(nextSlide, 6000);
    }
    if (discountedProducts.length > 1) {
      productTimerRef.current = setInterval(nextProduct, 8000);
    }
  }, [banners.length, discountedProducts.length, nextSlide, nextProduct]);

  useEffect(() => {
    const loadCoreData = async () => {
      try {
        const [resDiscounted, resBanners, resNews] = await Promise.all([
          api.get<PaginatedResponse<Product>>('/products', { params: { isOnSale: 'true', limit: 8 } }),
          api.get('/banners'),
          api.get<PaginatedResponse<NewsItem>>('/news', { params: { limit: 9 } })
        ]);

        setDiscountedProducts(resDiscounted.data.data);
        setBanners(resBanners.data);
        setNews(resNews.data.data);

        const savedIds = localStorage.getItem('recentlyViewed');
        if (savedIds) {
          const viewedIds = JSON.parse(savedIds);
          if (viewedIds.length > 0) {
            const resViewed = await api.post<Product[]>('/products/batch', { ids: viewedIds });
            setRecentlyViewed(resViewed.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCoreData();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 1) {
      Promise.all([
        api.get<PaginatedResponse<Product>>('/products', { params: { search: debouncedSearchQuery, limit: 5 } }),
        api.get<PaginatedResponse<Category>>('/categories', { params: { search: debouncedSearchQuery, limit: 3 } })
      ]).then(([pRes, cRes]) => {
        setSuggestedProducts(pRes.data.data);
        setSuggestedCategories(cRes.data.data);
      });
    } else {
      setSuggestedProducts([]);
      setSuggestedCategories([]);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    startTimers();
    return () => { 
        if (timerRef.current) clearInterval(timerRef.current); 
        if (productTimerRef.current) clearInterval(productTimerRef.current);
    };
  }, [banners, discountedProducts, startTimers]);

  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (type: 'banner' | 'product') => {
    const distance = touchStart.current - touchEnd.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        type === 'banner' ? nextSlide() : nextProduct();
      } else {
        type === 'banner' ? prevSlide() : prevProduct();
      }
      startTimers();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBannerLink = (banner: Banner) => {
    // if (banner.products && banner.products.length > 0) return `/product/${banner.products[0].id}`;
    // if (banner.categories && banner.categories.length > 0) return `/catalog?category=${banner.categories[0].id}`;
    return `/promotion/${banner.id}`;
  };

  return {
    banners, discountedProducts, news, recentlyViewed,
    currentSlide, currentProductSlide, searchQuery, isSearchOpen, isLoading,
    suggestedProducts, suggestedCategories, searchRef,
    setSearchQuery, setIsSearchOpen, setCurrentSlide, setCurrentProductSlide,
    nextSlide, prevSlide, nextProduct, prevProduct, startTimers,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    handleSearchSubmit, getBannerLink, addToCart, setRecentlyViewed, navigate
  };
};
