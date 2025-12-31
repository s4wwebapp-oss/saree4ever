'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WishlistContextType {
  items: string[]; // Array of product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading wishlist from localStorage:', error);
        }
      }
    }
  }, []);

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (productId: string) => {
    setItems((prev) => {
      if (prev.includes(productId)) {
        return prev; // Already in wishlist
      }
      return [...prev, productId];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((id) => id !== productId));
  };

  const isFavorite = (productId: string) => {
    return items.includes(productId);
  };

  const toggleFavorite = (productId: string) => {
    setItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const itemCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isFavorite,
        toggleFavorite,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}





