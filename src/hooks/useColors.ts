import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ColorSwatch } from '../types';

export const useColors = () => {
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'color_swatches'), 
      (snapshot) => {
        const fetchedColors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ColorSwatch[];
        setColors(fetchedColors);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching colors:", err);
        setError("Failed to load colors.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addColor = async (color: Omit<ColorSwatch, 'id'>) => {
    try {
      await addDoc(collection(db, 'color_swatches'), color);
    } catch (err) {
      console.error("Error adding color:", err);
      throw err;
    }
  };

  const updateColor = async (id: string, updates: Partial<ColorSwatch>) => {
    try {
      await updateDoc(doc(db, 'color_swatches', id), updates);
    } catch (err) {
      console.error("Error updating color:", err);
      throw err;
    }
  };

  const deleteColor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'color_swatches', id));
    } catch (err) {
      console.error("Error deleting color:", err);
      throw err;
    }
  };

  return { colors, loading, error, addColor, updateColor, deleteColor };
};
