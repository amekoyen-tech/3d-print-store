import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '../types';

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

  return { orders, loading, error, updateOrderStatus, deleteOrder };
};
