
'use client';

import { createContext, useContext } from 'react';
import type { UserCredential } from 'firebase/auth';
import type { Address } from '@/lib/firestore';

export type User = {
  uid: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'delivery';
  address?: Address | null;
  associatedSellerId?: string | null;
  associatedSellerName?: string | null;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential>;
  register: (email: string, pass: string, name: string, role: 'buyer' | 'seller' | 'delivery') => Promise<UserCredential>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
