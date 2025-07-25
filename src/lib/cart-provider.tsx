'use client';

import { type CartContextType, CartContext, type CartItem } from '@/hooks/use-cart';
import { type Product } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useMemo, type ReactNode } from 'react';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
        toast({
          title: "Not enough stock",
          description: `Only ${product.stock} of ${product.name} available.`,
          variant: "destructive",
        });
        return;
      }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
            toast({
                title: "Not enough stock",
                description: `You can't add more ${product.name} to your cart.`,
                variant: "destructive",
            });
            return prevCart;
        }
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });

    if(!cart.find(item => item.product.id === product.id && item.quantity + quantity > product.stock)) {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
          if (item.product.id === productId) {
            if (quantity > item.product.stock) {
              toast({
                title: 'Not enough stock',
                description: `Only ${item.product.stock} of ${item.product.name} available.`,
                variant: 'destructive',
              });
              return { ...item, quantity: item.product.stock };
            }
            return { ...item, quantity };
          }
          return item;
        }
      ).filter(item => item.quantity > 0)
    );
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
