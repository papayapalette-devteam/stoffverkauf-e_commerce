import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Product } from "./cart-context";
import { useAuth } from "@/lib/auth-context";
import api from "../../api"; // Axios instance pointing to your backend

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  toggleItem: (product: Product) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoggedIn } = useAuth();
  const [items, setItems] = useState<Product[]>([]);

  // Fetch wishlist from backend
  const refreshWishlist = useCallback(async () => {
    if (!isLoggedIn || !token) return;
    try {
      const res = await api.get("api/wishlist/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setItems(res.data.wishlist); // Backend should populate product details
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (isLoggedIn) refreshWishlist();
    else setItems([]);
  }, [isLoggedIn, refreshWishlist]);

  const addItem = useCallback(async (product: Product) => {
    if (!isLoggedIn || !user || !token) return;

    try {
      const res = await api.post(
        "api/wishlist/add",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setItems((prev) => [...prev, product]);
      }
    } catch (err) {
      console.error("Failed to add wishlist item:", err);
    }
  }, [isLoggedIn, user, token]);

  const removeItem = useCallback(async (id: string) => {
    if (!isLoggedIn || !user || !token) return;

    try {
      const res = await api.post(
        "api/wishlist/remove",
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
    }
  }, [isLoggedIn, user, token]);

  const isInWishlist = useCallback((id: string) => items.some((i) => i._id === id), [items]);

  const toggleItem = useCallback(async (product: Product) => {
    if (isInWishlist(product._id)) {
      await removeItem(product._id);
    } else {
      await addItem(product);
    }
  }, [addItem, removeItem, isInWishlist]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};