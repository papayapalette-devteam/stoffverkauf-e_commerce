import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "./cart-context";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => (prev.find((i) => i._id === product._id) ? prev : [...prev, product]));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const isInWishlist = useCallback((id: string) => items.some((i) => i._id === id), [items]);

  const toggleItem = useCallback((product: Product) => {
    setItems((prev) =>
      prev.find((i) => i._id === product._id)
        ? prev.filter((i) => i._id !== product._id)
        : [...prev, product]
    );
  }, []);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
