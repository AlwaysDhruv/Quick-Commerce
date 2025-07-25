
import { doc, getDoc, setDoc, addDoc, collection, getDocs, query, where, Timestamp, updateDoc, deleteDoc, writeBatch, runTransaction } from 'firebase/firestore';
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

export const getBuyerCountFromFirestore = async (): Promise<number> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'buyer'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting buyers count from Firestore: ', error);
    throw error;
  }
}

// Product Functions
export const addProductToFirestore = async (productData: Omit<Product, 'id' | 'sellerName'>) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product to Firestore: ', error);
    throw error;
  }
};

export const updateProductInFirestore = async (productId: string, productData: Partial<Omit<Product, 'id' | 'sellerId' | 'sellerName'>>) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, productData);
  } catch (error) {
    console.error('Error updating product in Firestore: ', error);
    throw error;
  }
}

export const deleteProductFromFirestore = async (productId: string) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    console.error('Error deleting product from Firestore: ', error);
    throw error;
  }
}

export const deleteMultipleProductsFromFirestore = async (productIds: string[]) => {
  try {
    const batch = writeBatch(db);
    productIds.forEach(id => {
      const docRef = doc(db, 'products', id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    console.error('Error deleting multiple products from Firestore: ', error);
    throw error;
  }
}

export const getProductsFromFirestore = async (): Promise<Product[]> => {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Product, 'sellerName'> & { sellerName?: string } ));

    if (products.length === 0) {
        return [];
    }

    // Get unique seller IDs from all products
    const sellerIds = [...new Set(products.map(p => p.sellerId))];
    
    // Fetch all unique seller documents
    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('__name__', 'in', sellerIds)));
    const sellerMap = new Map<string, string>();
    usersSnapshot.forEach(doc => {
      sellerMap.set(doc.id, doc.data().name || 'Anonymous');
    });

    // Map seller names back to products
    return products.map(product => ({
      ...product,
      sellerName: sellerMap.get(product.sellerId) || 'Anonymous',
    })) as Product[];

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
    await runTransaction(db, async (transaction) => {
      // 1. Create the new order document reference ahead of time
      const orderRef = doc(collection(db, 'orders'));

      // 2. READ phase: Read all product documents first
      const productUpdates = [];
      for (const item of orderData.items) {
        const productRef = doc(db, 'products', item.product.id);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error(`Product ${item.product.name} not found!`);
        }

        const currentStock = productDoc.data().stock;
        const newStock = currentStock - item.quantity;

        if (newStock < 0) {
          throw new Error(`Not enough stock for ${item.product.name}.`);
        }
        
        productUpdates.push({ ref: productRef, newStock });
      }

      // 3. WRITE phase: Perform all updates and the set
      for (const update of productUpdates) {
        transaction.update(update.ref, { stock: update.newStock });
      }

      // Finally, create the order document
      transaction.set(orderRef, {
        ...orderData,
        createdAt: Timestamp.now(),
      });
    });
    
  } catch (error) {
    console.error('Error adding order to Firestore: ', error);
    throw error; // Re-throw the error to be caught by the calling function
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

export const deleteOrderFromFirestore = async (orderId: string) => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    console.error('Error deleting order from Firestore: ', error);
    throw error;
  }
};
