import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OrderModificationRequest } from '../types';

/**
 * Hook to listen to modification requests for a specific order
 */
export const useOrderModificationRequests = (orderId: string | null) => {
  const [requests, setRequests] = useState<OrderModificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const requestsRef = collection(db, 'orders', orderId, 'modificationRequests');
    const q = query(requestsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrderModificationRequest[];

      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error('監聽修改請求失敗:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { requests, loading };
};
