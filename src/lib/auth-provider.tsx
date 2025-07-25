'use client';

import { type AuthContextType, AuthContext, type User } from '@/hooks/use-auth';
import React, { useState, type ReactNode } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    // In a real app, you'd also set a token in localStorage/cookies
  };

  const logout = () => {
    setUser(null);
    // In a real app, you'd also clear the token
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
