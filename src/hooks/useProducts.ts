import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    // Step 1: Initial fast load with getDocs (one-time query)
    const loadInitialData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        if (!mounted) return;

        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (!mounted) return;
        setError("無法載入產品 (Failed to load products)");
        setLoading(false);
      }
    };

    loadInitialData();

    // Step 2: Enable real-time listener after 5 seconds (delayed for performance)
    const timer = setTimeout(() => {
      if (!mounted || unsubscribeRef.current) return;

      console.log('[useProducts] Enabling real-time updates');
      unsubscribeRef.current = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!mounted) return;
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[];
          setProducts(productsData);
        },
        (err) => {
          console.error("Error in real-time listener:", err);
          if (!mounted) return;
          setError("即時更新失敗 (Real-time update failed)");
        }
      );
    }, 5000); // 5 second delay

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (err) {
      console.error("Error adding product:", err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.error("Error deleting product:", err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updates);
    } catch (err) {
      console.error("Error updating product:", err);
      throw err;
    }
  };

  return { products, loading, error, addProduct, deleteProduct, updateProduct };
};
