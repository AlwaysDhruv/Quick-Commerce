'use client';

import { type Product } from '@/lib/mock-data';
import { createContext, useContext } from 'react';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type AddToCartResult = {
    success: boolean;
    reason: 'out-of-stock' | 'stock-limit' | null;
    newQuantity?: number;
}

export type UpdateQuantityResult = {
    success: boolean;
    reason: 'stock-limit' | null;
}

export type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => AddToCartResult;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => UpdateQuantityResult;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
