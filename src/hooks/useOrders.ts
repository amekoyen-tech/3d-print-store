import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Order, OrderStatus, Product } from '../types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Handle timestamps if necessary, but for now we trust it matches or we cast it
        } as unknown as Order;
      });
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to fetch orders");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (
    id: string, 
    status: OrderStatus, 
    extra?: { estimatedCompletionDate?: string | null, adminNotes?: string }
  ) => {
    const ref = doc(db, 'orders', id);
    const updates: any = { status };
    if (extra?.estimatedCompletionDate !== undefined) updates.estimatedCompletionDate = extra.estimatedCompletionDate;
    if (extra?.adminNotes !== undefined) updates.adminNotes = extra.adminNotes;
    
    await updateDoc(ref, updates);
  };

  const deleteOrder = async (id: string) => {
    await deleteDoc(doc(db, 'orders', id));
  };

  const updateEstimatedDate = async (id: string, newDate: string) => {
    const ref = doc(db, 'orders', id);
    await updateDoc(ref, { estimatedCompletionDate: newDate });
  };

  const batchUpdateEstimatedDate = async (
    orderIds: string[],
    newDate: string
  ): Promise<{ success: string[]; failed: string[] }> => {
    const success: string[] = [];
    const failed: string[] = [];

    const results = await Promise.allSettled(
      orderIds.map(async (id) => {
        await updateEstimatedDate(id, newDate);
        return id;
      })
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(orderIds[index]);
      } else {
        failed.push(orderIds[index]);
        console.error(`Failed to update order ${orderIds[index]}:`, result.reason);
      }
    });

    return { success, failed };
  };

  const calculateEstimatedCompletion = async () => {
    try {
      // Fetch products to get times
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsMap = new Map<string, Product>();
      productsSnap.docs.forEach(doc => {
        productsMap.set(doc.id, { id: doc.id, ...doc.data() } as Product);
      });

      // Filter active orders (including the one we might be about to accept if it's already in the list with pending status)
      // We consider all orders that are taking up machine time.
      // Pending orders count? The instruction says "Fetches all orders with status NOT 'completed' or 'rejected'". 
      // It implies pending orders are also in the queue conceptually or we are calculating the END of the queue.
      // Assuming we want to know when the NEWEST item will be done if added to the end.
      const activeOrders = orders.filter(o => 
        o.status !== 'completed' && 
        o.status !== 'rejected' && 
        o.status !== 'cancelled'
      );

      let totalMinutes = 0;

      activeOrders.forEach(order => {
        order.items.forEach(item => {
          const product = productsMap.get(item.productId);
          if (product) {
            const printTime = product.print_time_min || 0;
            const postTime = product.post_processing_time_min || 0;
            totalMinutes += (printTime + postTime) * item.quantity;
          }
        });
      });

      // Add 10% buffer
      totalMinutes = Math.ceil(totalMinutes * 1.1);

      const completionDate = new Date(Date.now() + totalMinutes * 60000);
      return completionDate;

    } catch (err) {
      console.error("Error calculating estimation:", err);
      return new Date(); // Return now as fallback
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    deleteOrder,
    calculateEstimatedCompletion,
    updateEstimatedDate,
    batchUpdateEstimatedDate
  };
};
