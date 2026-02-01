import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface OrderData {
  productName: string;
  name: string;
  phone: string;
  note: string;
  price: number;
}

export const useOrderSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitOrder = async (order: OrderData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Store in Firestore
      await addDoc(collection(db, "orders"), {
        ...order,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      // 2. Mock Telegram Notification
      await notifyOwner(order);

      setSuccess(true);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const notifyOwner = async (order: OrderData) => {
    // This is a mock implementation of a Telegram notification
    // In a real scenario, you'd call a backend function or use a Telegram Bot API directly (with secrets)
    console.log("🔔 [NOTIFY] New order received!");
    console.log(`Product: ${order.productName}`);
    console.log(`Customer: ${order.name} (${order.phone})`);
    console.log(`Note: ${order.note}`);
    
    // Example of how it would look with fetch:
    /*
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    if (BOT_TOKEN && CHAT_ID) {
      const text = `📦 *New Order!*\n\n*Product:* ${order.productName}\n*Customer:* ${order.name}\n*Phone:* ${order.phone}\n*Note:* ${order.note}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
      });
    }
    */
  };

  return { submitOrder, isSubmitting, error, success };
};
