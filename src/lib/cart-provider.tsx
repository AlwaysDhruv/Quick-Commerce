'use client';

import { type CartContextType, CartContext, type CartItem } from '@/hooks/use-cart';
import { type Product } from '@/lib/mock-data';
import React, { useState, useMemo, type ReactNode } from 'react';

// Note: All toast notifications have been removed from this provider.
// They should be handled in the UI components that trigger these actions.

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    // Check if product is out of stock first
    if (product.stock <= 0) {
      console.error('Attempted to add out-of-stock item to cart.');
      return { success: false, reason: 'out-of-stock' };
    }

    let addedToCart = false;
    let newQuantityInCart = 0;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
            console.error('Not enough stock to add to cart.');
            // Add only what's left
            if (product.stock > existingItem.quantity) {
                 const quantityAdded = product.stock - existingItem.quantity;
                 newQuantityInCart = product.stock;
                 addedToCart = true;
                 return prevCart.map(item =>
                    item.product.id === product.id
                    ? { ...item, quantity: product.stock }
                    : item
                 );
            }
            return prevCart;
        }
        // Update quantity
        newQuantityInCart = newQuantity;
        addedToCart = true;
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      // Add new item
      if (quantity > product.stock) {
        console.error('Not enough stock for new cart item.');
        newQuantityInCart = product.stock;
        addedToCart = true;
        return [...prevCart, { product, quantity: product.stock }];
      }
      
      newQuantityInCart = quantity;
      addedToCart = true;
      return [...prevCart, { product, quantity }];
    });
    
    if (addedToCart) {
        return { success: true, reason: null, newQuantity: newQuantityInCart };
    }
    return { success: false, reason: 'stock-limit' };
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    let success = false;
    let reason = null;

    setCart(prevCart =>
      prevCart.map(item => {
          if (item.product.id === productId) {
            if (quantity > item.product.stock) {
              success = false;
              reason = 'stock-limit'
              return { ...item, quantity: item.product.stock };
            }
            success = true;
            return { ...item, quantity };
          }
          return item;
        }
      ).filter(item => item.quantity > 0)
    );

    return { success, reason };
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
