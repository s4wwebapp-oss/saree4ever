'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';

export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  price: number;
  image: string;
  title: string;
  variantName?: string;
  color?: string;
  hasBlouse?: boolean;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  subtotal: number;
  discountTotal: number;
  finalTotal: number;
  appliedCoupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  message?: string;
  coupon?: any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const skipRevalidateRef = useRef(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
      const savedCoupon = localStorage.getItem('cart_coupon');
      if (savedCoupon) {
        try {
          const parsed = JSON.parse(savedCoupon);
          if (parsed?.code) {
            setAppliedCoupon(parsed);
          }
        } catch (error) {
          console.error('Error loading coupon from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (appliedCoupon) {
      localStorage.setItem('cart_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('cart_coupon');
    }
  }, [appliedCoupon]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountTotal = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal - discountTotal);
  const total = subtotal;

  const applyCoupon = async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setCouponError('Enter a coupon code to continue');
      return;
    }
    if (subtotal <= 0) {
      setCouponError('Add items to your cart before applying a coupon');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const response: any = await api.coupons.validate({ code: normalized, cartTotal: subtotal });
      skipRevalidateRef.current = true;
      setAppliedCoupon({
        code: normalized,
        discountAmount: response.discountAmount,
        message: response.message,
        coupon: response.coupon,
      });
    } catch (error: any) {
      setAppliedCoupon(null);
      setCouponError(error?.message || 'Coupon could not be applied');
      throw error;
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  useEffect(() => {
    if (!appliedCoupon) return;
    if (subtotal <= 0) {
      setAppliedCoupon(null);
      return;
    }

    if (skipRevalidateRef.current) {
      skipRevalidateRef.current = false;
      return;
    }

    let cancelled = false;
    const revalidate = async () => {
      setCouponLoading(true);
      try {
        const response: any = await api.coupons.validate({ code: appliedCoupon.code, cartTotal: subtotal });
        if (cancelled) return;
        setAppliedCoupon((prev) =>
          prev
            ? {
                ...prev,
                discountAmount: response.discountAmount,
                message: response.message,
                coupon: response.coupon,
              }
            : prev
        );
        setCouponError(null);
      } catch (error: any) {
        if (cancelled) return;
        setAppliedCoupon(null);
        setCouponError(error?.message || 'Coupon no longer applies to this cart');
      } finally {
        if (!cancelled) {
          setCouponLoading(false);
        }
      }
    };

    revalidate();
    return () => {
      cancelled = true;
    };
  }, [subtotal, appliedCoupon?.code]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        subtotal,
        discountTotal,
        finalTotal,
        appliedCoupon,
        couponLoading,
        couponError,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

