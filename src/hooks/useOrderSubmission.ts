import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CartItem } from '../types';

export interface CustomerData {
  name: string;
  phone: string;
  notes?: string;
}

export const useOrderSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitOrder = async (customer: CustomerData, items: CartItem[], totalPrice: number) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Store in Firestore
      await addDoc(collection(db, "orders"), {
        customer,
        items,
        totalPrice,
        createdAt: serverTimestamp(),
        status: 'pending',
        estimatedCompletionDate: null,
        adminNotes: ''
      });

      // 2. Mock Telegram Notification
      await notifyOwner(customer, items, totalPrice);

      setSuccess(true);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setError("訂單送出失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const notifyOwner = async (customer: CustomerData, items: CartItem[], totalPrice: number) => {
    // This is a mock implementation of a Telegram notification
    console.log("🔔 [NOTIFY] New order received!");
    console.log(`Customer: ${customer.name} (${customer.phone})`);
    console.log(`Items: ${items.map(i => `${i.name} x${i.quantity}`).join(', ')}`);
    console.log(`Total: $${totalPrice}`);
    
    // Logic for real notification remains commented out as before
  };

  return { submitOrder, isSubmitting, error, success };
};
