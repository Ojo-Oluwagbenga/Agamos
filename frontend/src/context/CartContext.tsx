import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'agamos_luxury_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (quantity <= 0) return;

    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      const effectivePrice = Number(product.effective_price || product.price);

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (product.stock_quantity < newQuantity) {
          error('Inventory Limit', `Only ${product.stock_quantity} units available in stock.`);
          return prevItems;
        }
        success('Added to Bag', `${quantity}x ${product.name} added.`);
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * effectivePrice }
            : item
        );
      } else {
        if (product.stock_quantity < quantity) {
          error('Inventory Limit', `Only ${product.stock_quantity} units available.`);
          return prevItems;
        }
        success('Added to Bag', `${quantity}x ${product.name} added.`);
        return [
          ...prevItems,
          {
            product,
            product_id: product.id,
            quantity,
            subtotal: quantity * effectivePrice,
          },
        ];
      }
    });
  }, [success, error]);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) => {
      const item = prevItems.find((i) => i.product.id === productId);
      if (!item) return prevItems;

      if (item.product.stock_quantity < quantity) {
        error('Inventory Limit', `Only ${item.product.stock_quantity} units available.`);
        return prevItems;
      }

      const effectivePrice = Number(item.product.effective_price || item.product.price);
      return prevItems.map((i) =>
        i.product.id === productId
          ? { ...i, quantity, subtotal: quantity * effectivePrice }
          : i
      );
    });
  }, [removeFromCart, error]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
