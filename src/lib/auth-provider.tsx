
'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, type User as FirebaseUser, type UserCredential, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
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

  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && (window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) {
        throw new Error('ReCAPTCHA container not found.');
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
        'size': 'invisible',
        'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
        }
    });
    return recaptchaVerifier;
  };
  
  const signInWithPhone = async (phone: string): Promise<ConfirmationResult> => {
     const appVerifier = setupRecaptcha();
     return signInWithPhoneNumber(auth, phone, appVerifier);
  }

  const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<UserCredential> => {
      setLoading(true);
      const userCredential = await confirmationResult.confirm(otp);
      // Don't redirect here, the caller (login/register page) will handle it
      return userCredential;
  }

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
        }
        router.push(redirectPath);
    } else {
        // This case is unlikely if registration is working, but good to handle
        await signOut(auth);
        throw new Error("User data not found in database.");
    }
    return userCredential;
  };

  const register = async (email: string, pass: string, name: string, role: 'buyer' | 'seller' | 'delivery', phone?: string, isPhoneVerified: boolean = false): Promise<UserCredential | void> => {
    setLoading(true);
    
    // If the user is a buyer, their auth user is created via phone OTP. 
    // We just need to create their firestore record.
    if (role === 'buyer' && isPhoneVerified) {
        if (auth.currentUser) {
            await addUserToFirestore(auth.currentUser.uid, name, email, role, phone);
        } else {
             throw new Error("No authenticated user found for buyer registration.");
        }
        return; // No UserCredential to return here
    }

    // For other roles, create user with email/password
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await addUserToFirestore(userCredential.user.uid, name, email, role, phone);
    const firestoreUser = await getUserFromFirestore(userCredential.user.uid);
     if (firestoreUser) {
        let redirectPath = '/buyer';
        if (firestoreUser.role === 'seller') {
            redirectPath = '/seller';
        } else if (firestoreUser.role === 'delivery') {
            redirectPath = '/delivery';
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
    signInWithPhone,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
