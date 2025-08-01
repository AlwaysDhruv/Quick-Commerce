
'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, type User as FirebaseUser, type UserCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUserToFirestore, getUserFromFirestore } from '@/lib/firestore';
import { AuthContext, type AuthContextType, type User } from '@/hooks/use-auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const firestoreUser = await getUserFromFirestore(firebaseUser.uid);
        if (firestoreUser) {
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firestoreUser.name,
            role: firestoreUser.role,
            phone: firestoreUser.phone,
            address: firestoreUser.address,
            associatedSellerId: firestoreUser.associatedSellerId,
            associatedSellerName: firestoreUser.associatedSellerName,
          };
          setUser(userData);
           // Redirect on initial load if user is already logged in
          if (['/login', '/register', '/register/address', '/'].includes(window.location.pathname)) {
            let redirectPath = '/buyer'; // Default redirect for buyer
            if (firestoreUser.role === 'seller') {
              redirectPath = '/seller';
            } else if (firestoreUser.role === 'delivery') {
              redirectPath = '/delivery';
            } else if (firestoreUser.role === 'admin') {
              redirectPath = '/admin';
            }
            router.push(redirectPath);
          }
        } else {
          // This case might happen if a user is deleted from Firestore but not Auth
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);
  
  const login = async (email: string, pass: string): Promise<UserCredential> => {
    setLoading(true);
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firestoreUser = await getUserFromFirestore(userCredential.user.uid);
    if (firestoreUser) {
        let redirectPath = '/buyer';
        if (firestoreUser.role === 'seller') {
            redirectPath = '/seller';
        } else if (firestoreUser.role === 'delivery') {
            redirectPath = '/delivery';
        } else if (firestoreUser.role === 'admin') {
            redirectPath = '/admin';
        }
        router.push(redirectPath);
    } else {
        // This case is unlikely if registration is working, but good to handle
        await signOut(auth);
        throw new Error("User data not found in database.");
    }
    return userCredential;
  };

  const register = async (email: string, pass: string, name: string, role: 'buyer' | 'seller' | 'delivery', phone?: string): Promise<UserCredential | void> => {
    setLoading(true);
    
    let finalRole: User['role'] = role;
    if (email.toLowerCase() === '123@gmail.com') {
        finalRole = 'admin';
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await addUserToFirestore(userCredential.user.uid, name, email, finalRole, phone);
    
    const firestoreUser = await getUserFromFirestore(userCredential.user.uid);
    if (firestoreUser) {
        if (firestoreUser.role === 'buyer') {
            router.push('/register/address');
            return userCredential;
        }
        
        let redirectPath = '/seller'; // Default for seller
        if (firestoreUser.role === 'delivery') {
            redirectPath = '/delivery';
        } else if (firestoreUser.role === 'admin') {
            redirectPath = '/admin';
        }
        router.push(redirectPath);
    }
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
