import React, { createContext, useContext, useState, useCallback } from "react";

export interface Product {
  _id:string;
  name: string;
  price: number;
  salePrice: number;
  category: string;
  badge: string;
  width: string;
  inStock: boolean;
  stockQty: string;
  composition: string;
  description: string;
  images:string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  variants: ProductVariant[];
  rating:number;
  reviews:number
}

interface ProductVariant {
  color: string;
  pattern: string;
  size: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const roundedQuantity = Math.round(quantity * 10) / 10;
    if (roundedQuantity <= 0) {
      setItems((prev) => prev.filter((item) => item._id !== id));
    } else {
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, quantity: roundedQuantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = Math.round(items.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0) * 100) / 100;
  const itemCount = Math.round(items.reduce((sum, item) => sum + item.quantity, 0) * 10) / 10;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
