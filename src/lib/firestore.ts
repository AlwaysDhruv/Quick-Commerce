import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/hooks/use-auth';

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
