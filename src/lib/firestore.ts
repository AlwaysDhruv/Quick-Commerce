
import { doc, getDoc, setDoc, addDoc, collection, getDocs, query, where, Timestamp, updateDoc, deleteDoc, writeBatch, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/hooks/use-auth';
import type { Product } from './mock-data';
import { CartItem } from '@/hooks/use-cart';

// --- USER ---

export const addUserToFirestore = async (userId: string, name: string, email: string, role: 'buyer' | 'seller' | 'delivery') => {
  try {
    const userData: Partial<User> = {
      name,
      email,
      role,
    };
    if (role === 'delivery') {
      userData.associatedSellerId = null;
      userData.associatedSellerName = null;
    }
    if (role === 'buyer') {
      userData.address = null;
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

export const updateUserAddress = async (userId: string, address: Address) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { address });
    } catch (error) {
        console.error('Error updating user address in Firestore: ', error);
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

export const getUniqueBuyerCountForSeller = async (sellerId: string): Promise<number> => {
    try {
        const q = query(collection(db, 'orders'), where('sellerId', '==', sellerId));
        const querySnapshot = await getDocs(q);
        const buyerIds = new Set(querySnapshot.docs.map(doc => doc.data().buyerId));
        return buyerIds.size;
    } catch (error) {
        console.error('Error getting unique buyer count for seller: ', error);
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

export const getAvailableDeliveryPersonnel = async (): Promise<User[]> => {
    try {
        const q = query(collection(db, 'users'), 
            where('role', '==', 'delivery'),
            where('associatedSellerId', '==', null)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error('Error getting available delivery personnel from Firestore: ', error);
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
export type Address = {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  district: string;
  country: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
};

export type Order = {
  id: string;
  buyerId: string;
  buyerName: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  createdAt: Timestamp;
  deliveredAt?: Timestamp | null;
  sellerId: string;
  deliveryPersonId?: string | null;
  deliveryPersonName?: string | null;
  address: Address;
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

export const getOrdersByBuyer = async (buyerId: string): Promise<Order[]> => {
    try {
        const q = query(collection(db, "orders"), where("buyerId", "==", buyerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error("Error getting orders by buyer from Firestore: ", error);
        throw error;
    }
}

export const getOrdersByDeliveryPerson = async (deliveryPersonId: string): Promise<Order[]> => {
    try {
        const q = query(collection(db, "orders"), where("deliveryPersonId", "==", deliveryPersonId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error("Error getting orders by delivery person from Firestore: ", error);
        throw error;
    }
}


export const deleteOrderFromFirestore = async (orderId: string) => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    console.error('Error deleting order from Firestore: ', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  deliveryPerson?: { id: string; name: string }
) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) {
        throw new Error('Order not found!');
      }

      const updateData: any = { status };
      const currentOrderData = orderDoc.data() as Order;

      // When shipping, a delivery person MUST be assigned.
      if (status === 'Shipped') {
        if (!deliveryPerson) {
          throw new Error('A delivery person must be assigned to ship an order.');
        }
        updateData.deliveryPersonId = deliveryPerson.id;
        updateData.deliveryPersonName = deliveryPerson.name;
      }
      
      // For subsequent statuses, carry over the existing assignment.
      if ((status === 'Out for Delivery' || status === 'Delivered') && currentOrderData.deliveryPersonId) {
        updateData.deliveryPersonId = currentOrderData.deliveryPersonId;
        updateData.deliveryPersonName = currentOrderData.deliveryPersonName;
      }

      if (status === 'Delivered') {
        updateData.deliveredAt = Timestamp.now();
      }

      transaction.update(orderRef, updateData);
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};


// --- DELIVERY REQUEST ---

export type DeliveryRequestStatus = 'pending' | 'approved' | 'rejected' | 'left';

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
            status: 'pending' as const,
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


// --- LEAVE REQUESTS ---

export type LeaveRequestStatus = 'pending' | 'approved';

export type LeaveRequest = {
  id: string;
  sellerId: string;
  sellerName: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  status: LeaveRequestStatus;
  createdAt: Timestamp;
};

export const createLeaveRequest = async (data: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
        const requestData = {
            ...data,
            status: 'pending' as const,
            createdAt: Timestamp.now(),
        };
        await addDoc(collection(db, 'leaveRequests'), requestData);
    } catch (error) {
        console.error('Error creating leave request: ', error);
        throw error;
    }
}

export const getLeaveRequestsForSeller = async (sellerId: string): Promise<LeaveRequest[]> => {
    try {
        const q = query(collection(db, 'leaveRequests'), where('sellerId', '==', sellerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
    } catch (error) {
        console.error('Error getting leave requests for seller: ', error);
        throw error;
    }
}

export const getPendingLeaveRequestForDeliveryPerson = async (deliveryPersonId: string): Promise<LeaveRequest | null> => {
     try {
        const q = query(
            collection(db, 'leaveRequests'), 
            where('deliveryPersonId', '==', deliveryPersonId),
            where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as LeaveRequest;
        }
        return null;
    } catch (error) {
        console.error('Error getting pending leave request: ', error);
        throw error;
    }
}


export const approveLeaveRequest = async (request: LeaveRequest) => {
    try {
        const batch = writeBatch(db);
        
        // Update the leave request status to 'approved'
        const leaveRequestRef = doc(db, 'leaveRequests', request.id);
        batch.update(leaveRequestRef, { status: 'approved' });

        // Update the delivery person's user document to remove association
        const deliveryPersonRef = doc(db, 'users', request.deliveryPersonId);
        batch.update(deliveryPersonRef, { 
            associatedSellerId: null,
            associatedSellerName: null
        });

        // Find the corresponding 'approved' deliveryRequest and update its status to 'left'
        const deliveryRequestQuery = query(
            collection(db, 'deliveryRequests'),
            where('deliveryPersonId', '==', request.deliveryPersonId),
            where('sellerId', '==', request.sellerId),
            where('status', '==', 'approved')
        );

        const deliveryRequestSnapshot = await getDocs(deliveryRequestQuery);
        if (!deliveryRequestSnapshot.empty) {
            const deliveryRequestDoc = deliveryRequestSnapshot.docs[0];
            batch.update(deliveryRequestDoc.ref, { status: 'left' });
        }

        await batch.commit();
    } catch (error) {
        console.error('Error approving leave request: ', error);
        throw error;
    }
}

// --- SELLER INVITES ---

export type SellerInviteStatus = 'pending' | 'accepted' | 'rejected';

export type SellerInvite = {
  id: string;
  sellerId: string;
  sellerName: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  status: SellerInviteStatus;
  createdAt: Timestamp;
};

export const createSellerInvite = async (data: Omit<SellerInvite, 'id' | 'createdAt' | 'status'>) => {
    try {
        const inviteData = {
            ...data,
            status: 'pending' as const,
            createdAt: Timestamp.now(),
        };
        await addDoc(collection(db, 'sellerInvites'), inviteData);
    } catch (error) {
        console.error('Error creating seller invite: ', error);
        throw error;
    }
};

export const getInvitesForDeliveryPerson = async (deliveryPersonId: string): Promise<SellerInvite[]> => {
    try {
        const q = query(
            collection(db, 'sellerInvites'),
            where('deliveryPersonId', '==', deliveryPersonId),
            where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SellerInvite));
    } catch (error) {
        console.error('Error getting invites for delivery person: ', error);
        throw error;
    }
}

export const getSentInvitesForSeller = async (sellerId: string): Promise<SellerInvite[]> => {
    try {
        const q = query(collection(db, 'sellerInvites'), where('sellerId', '==', sellerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SellerInvite));
    } catch (error) {
        console.error('Error getting sent invites for seller: ', error);
        throw error;
    }
}

export const updateSellerInviteStatus = async (inviteId: string, status: SellerInviteStatus) => {
    try {
        const inviteRef = doc(db, 'sellerInvites', inviteId);
        await updateDoc(inviteRef, { status });
    } catch (error) {
        console.error('Error updating seller invite status: ', error);
        throw error;
    }
};

export const approveSellerInvite = async (invite: SellerInvite) => {
    try {
        const batch = writeBatch(db);
        
        // Update the invite status
        const inviteRef = doc(db, 'sellerInvites', invite.id);
        batch.update(inviteRef, { status: 'accepted' });

        // Update the delivery person's user document
        const deliveryPersonRef = doc(db, 'users', invite.deliveryPersonId);
        batch.update(deliveryPersonRef, { 
            associatedSellerId: invite.sellerId,
            associatedSellerName: invite.sellerName
        });

        await batch.commit();
    } catch (error) {
        console.error('Error approving seller invite: ', error);
        throw error;
    }
}

// --- CATEGORIES ---

export type Category = {
  id: string;
  name: string;
  sellerId: string;
  image?: string;
};

export const addCategory = async (data: Omit<Category, 'id'>) => {
  try {
    await addDoc(collection(db, 'categories'), data);
  } catch (error) {
    console.error('Error adding category: ', error);
    throw error;
  }
};

export const getAllCategories = async (): Promise<Category[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      // Remove duplicates by name, keeping the first one encountered
      const uniqueCategories = Array.from(new Map(categories.map(cat => [cat.name, cat])).values());
      return uniqueCategories;
    } catch (error) {
      console.error('Error getting all categories: ', error);
      throw error;
    }
};

export const getCategoriesBySeller = async (sellerId: string): Promise<Category[]> => {
  try {
    const q = query(collection(db, 'categories'), where('sellerId', '==', sellerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    console.error('Error getting categories by seller: ', error);
    throw error;
  }
};

export const getCategoryCountForSeller = async (sellerId: string): Promise<number> => {
    try {
        const q = query(collection(db, 'categories'), where('sellerId', '==', sellerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting category count for seller: ', error);
        throw error;
    }
}

export const updateCategory = async (categoryId: string, data: { name: string; image?: string }) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, data);
  } catch (error) {
    console.error('Error updating category: ', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    console.error('Error deleting category: ', error);
    throw error;
  }
};
