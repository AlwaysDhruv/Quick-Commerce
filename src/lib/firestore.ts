
import { doc, getDoc, setDoc, addDoc, collection, getDocs, query, where, Timestamp, updateDoc, deleteDoc, writeBatch, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/hooks/use-auth';
import type { Product } from './mock-data';
import { CartItem } from '@/hooks/use-cart';

// --- USER ---

export const addUserToFirestore = async (userId: string, name: string, email: string, role: 'buyer' | 'seller' | 'delivery') => {
  try {
    const userData: any = {
      name,
      email,
      role,
    };
    if (role === 'delivery') {
      userData.associatedSellerId = null;
      userData.associatedSellerName = null;
    }
    await setDoc(doc(db, 'users', userId), userData);
  } catch (error) {
    console.error('Error adding user to Firestore: ', error);
    throw error;
  }
};

export const getUserFromFirestore = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      console.log('No such user document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user from Firestore: ', error);
    throw error;
  }
};

export const getSellerProfile = async (sellerId: string): Promise<{ name: string } | null> => {
    try {
        const docRef = doc(db, 'users', sellerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'seller') {
            return { name: docSnap.data().name };
        }
        return null;
    } catch (error) {
        console.error('Error getting seller profile from Firestore: ', error);
        throw error;
    }
}

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


export const getAllSellers = async (): Promise<User[]> => {
    try {
        const q = query(collection(db, 'users'), where('role', '==', 'seller'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error('Error getting sellers from Firestore: ', error);
        throw error;
    }
}


// --- PRODUCT ---

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


// --- ORDER ---

export type Order = {
  id: string;
  buyerId: string;
  buyerName: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  createdAt: Timestamp;
  sellerId: string;
  deliveryPersonId?: string | null;
  deliveryPersonName?: string | null;
};

export const addOrderToFirestore = async (orderData: Omit<Order, 'id'>) => {
  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(collection(db, 'orders'));

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

      for (const update of productUpdates) {
        transaction.update(update.ref, { stock: update.newStock });
      }

      transaction.set(orderRef, {
        ...orderData,
        createdAt: Timestamp.now(),
      });
    });
    
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

export const deleteOrderFromFirestore = async (orderId: string) => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    console.error('Error deleting order from Firestore: ', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (error) {
    console.error('Error updating order status: ', error);
    throw error;
  }
}


// --- DELIVERY REQUEST ---

export type DeliveryRequestStatus = 'pending' | 'approved' | 'rejected';

export type DeliveryRequest = {
  id: string;
  sellerId: string;
  sellerName: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  status: DeliveryRequestStatus;
  createdAt: Timestamp;
};

export const createDeliveryRequest = async (data: Omit<DeliveryRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
        const requestData = {
            ...data,
            status: 'pending',
            createdAt: Timestamp.now(),
        };
        await addDoc(collection(db, 'deliveryRequests'), requestData);
    } catch (error) {
        console.error('Error creating delivery request: ', error);
        throw error;
    }
}

export const getDeliveryRequestsForSeller = async (sellerId: string): Promise<DeliveryRequest[]> => {
    try {
        const q = query(collection(db, 'deliveryRequests'), where('sellerId', '==', sellerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryRequest));
    } catch (error) {
        console.error('Error getting delivery requests for seller: ', error);
        throw error;
    }
}

export const getDeliveryRequestsForDeliveryPerson = async (deliveryPersonId: string): Promise<DeliveryRequest[]> => {
    try {
        const q = query(collection(db, 'deliveryRequests'), where('deliveryPersonId', '==', deliveryPersonId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryRequest));
    } catch (error) {
        console.error('Error getting delivery requests for delivery person: ', error);
        throw error;
    }
}

export const updateDeliveryRequestStatus = async (requestId: string, status: DeliveryRequestStatus) => {
    try {
        const requestRef = doc(db, 'deliveryRequests', requestId);
        await updateDoc(requestRef, { status });
    } catch (error) {
        console.error('Error updating delivery request status: ', error);
        throw error;
    }
}

export const approveDeliveryRequest = async (request: DeliveryRequest) => {
    try {
        const batch = writeBatch(db);
        
        // Update the request status
        const requestRef = doc(db, 'deliveryRequests', request.id);
        batch.update(requestRef, { status: 'approved' });

        // Update the delivery person's user document
        const deliveryPersonRef = doc(db, 'users', request.deliveryPersonId);
        batch.update(deliveryPersonRef, { 
            associatedSellerId: request.sellerId,
            associatedSellerName: request.sellerName
        });

        await batch.commit();
    } catch (error) {
        console.error('Error approving delivery request: ', error);
        throw error;
    }
}

export const getDeliveryTeamForSeller = async (sellerId: string): Promise<User[]> => {
    try {
        const q = query(collection(db, 'users'), 
            where('role', '==', 'delivery'), 
            where('associatedSellerId', '==', sellerId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error('Error getting delivery team for seller: ', error);
        throw error;
    }
}
