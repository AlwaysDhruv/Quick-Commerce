'use client';

import React, { createContext, useState } from 'react';
import type { Product, CartItem, Order } from './types';
import { initialProducts } from './data';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  userType: 'buyer' | 'seller' | null;
  setUserType: React.Dispatch<React.SetStateAction<'buyer' | 'seller' | null>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  placeOrder: (customerName: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useLocalStorage<'buyer' | 'seller' | null>('userType', null);
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const { toast } = useToast();

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: new Date().getTime().toString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const placeOrder = (customerName: string) => {
    const newOrder: Order = {
      id: new Date().getTime().toString(),
      customerName,
      items: cart,
      total: cartTotal,
      status: 'Pending',
      date: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
     toast({
        title: "Order Updated",
        description: `Order #${orderId.slice(-4)} status changed to ${status}.`,
    });
  };

  const value = {
    userType,
    setUserType,
    products,
    setProducts,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartCount,
    orders,
    placeOrder,
    updateOrderStatus,
    addProduct,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
