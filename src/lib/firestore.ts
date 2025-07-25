import { doc, getDoc, setDoc, addDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/hooks/use-auth';
import type { Product } from './mock-data';
import { CartItem } from '@/hooks/use-cart';

export const addUserToFirestore = async (userId: string, name: string, email: string, role: 'buyer' | 'seller') => {
  try {
    await setDoc(doc(db, 'users', userId), {
      name,
      email,
      role,
    });
  } catch (error) {
    console.error('Error adding user to Firestore: ', error);
    throw error;
  }
};

export const getUserFromFirestore = async (userId: string): Promise<Pick<User, 'name' | 'role'> | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        name: data.name,
        role: data.role,
      } as Pick<User, 'name' | 'role'>;
    } else {
      console.log('No such user document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user from Firestore: ', error);
    throw error;
  }
};

export const getUsersCountFromFirestore = async (): Promise<number> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting users count from Firestore: ', error);
    throw error;
  }
}

// Product Functions
export const addProductToFirestore = async (productData: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product to Firestore: ', error);
    throw error;
  }
};

export const getProductsFromFirestore = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error getting products from Firestore: ', error);
    throw error;
  }
};

export const getProductsBySeller = async (sellerId: string): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), where('sellerId', '==', sellerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error getting products by seller from Firestore: ', error);
    throw error;
  }
}

// Order type definition
export type Order = {
  id: string;
  buyerId: string;
  buyerName: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  createdAt: Timestamp;
  sellerId: string; // Assuming one seller per order for simplicity
};


// Order Functions
export const addOrderToFirestore = async (orderData: Omit<Order, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order to Firestore: ', error);
    throw error;
  }
};

export const getOrdersBySeller = async (sellerId: string): Promise<Order[]> => {
  try {
    const q = query(collection(db, 'orders'), where('sellerId', '==', sellerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error('Error getting orders by seller from Firestore: ', error);
    throw error;
  }
};
