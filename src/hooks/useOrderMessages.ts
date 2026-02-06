import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OrderMessage } from '../types';
import { uploadOrderMessageImage } from '../utils/imageUpload';

export const useOrderMessages = (orderId: string) => {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 即時監聽訂單留言
  useEffect(() => {
    if (!orderId) return;

    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const orderData = snapshot.data();
        setMessages(orderData.messages || []);
      }
      setLoading(false);
    }, (error) => {
      console.error('監聽留言失敗:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  /**
   * 添加留言
   */
  const addMessage = async (
    content: string,
    sender: 'customer' | 'admin',
    senderName: string,
    imageFile?: File
  ): Promise<void> => {
    if (!content.trim() && !imageFile) {
      throw new Error('留言內容不能為空');
    }

    // 限制留言長度
    if (content.length > 500) {
      throw new Error('留言長度不能超過 500 字');
    }

    try {
      setUploading(true);

      const messageId = `msg_${Date.now()}`;
      let imageUrl: string | undefined;

      // 如果有圖片，先上傳
      if (imageFile) {
        imageUrl = await uploadOrderMessageImage(orderId, messageId, imageFile);
      }

      // 創建留言物件
      const newMessage: OrderMessage = {
        id: messageId,
        sender,
        senderName,
        content: content.trim(),
        imageUrl,
        type: 'message',
        timestamp: Timestamp.now(),
      };

      // 更新 Firestore
      const orderRef = doc(db, 'orders', orderId);
      const updates: any = {
        messages: arrayUnion(newMessage),
      };

      // 標記未讀
      if (sender === 'customer') {
        updates.hasUnreadMessages = true; // Admin 需要看
        updates.hasUnreadReplies = false; // Customer 已讀
      } else {
        updates.hasUnreadReplies = true; // Customer 需要看
      }

      await updateDoc(orderRef, updates);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.error('發送留言失敗:', error);
      throw error;
    }
  };

  /**
   * 標記留言為已讀
   */
  const markAsRead = async (role: 'admin' | 'customer'): Promise<void> => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updates: any = {};

      if (role === 'admin') {
        updates.hasUnreadMessages = false;
      } else {
        updates.hasUnreadReplies = false;
      }

      await updateDoc(orderRef, updates);
    } catch (error) {
      console.error('標記已讀失敗:', error);
      throw error;
    }
  };

  /**
   * 添加系統訊息（例如：修改請求已批准）
   */
  const addSystemMessage = async (content: string): Promise<void> => {
    try {
      const messageId = `sys_${Date.now()}`;
      const systemMessage: OrderMessage = {
        id: messageId,
        sender: 'admin',
        senderName: '系統',
        content,
        type: 'system',
        timestamp: Timestamp.now(),
      };

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        messages: arrayUnion(systemMessage),
        hasUnreadReplies: true,
      });
    } catch (error) {
      console.error('添加系統訊息失敗:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    uploading,
    addMessage,
    markAsRead,
    addSystemMessage,
  };
};
