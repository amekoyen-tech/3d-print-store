import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OrderModificationRequest } from '../types';

export const useModificationRequests = () => {
  /**
   * 創建修改請求
   */
  const createRequest = async (
    orderId: string,
    requestType: OrderModificationRequest['requestType'],
    description: string
  ): Promise<void> => {
    if (!description.trim()) {
      throw new Error('請描述您的修改需求');
    }

    if (description.length > 500) {
      throw new Error('描述長度不能超過 500 字');
    }

    try {
      // 創建修改請求到子集合
      const requestsRef = collection(db, 'orders', orderId, 'modificationRequests');
      await addDoc(requestsRef, {
        requestedBy: 'customer',
        requestType,
        description: description.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 標記訂單有未讀消息（通知 admin）
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        hasUnreadMessages: true,
      });
    } catch (error) {
      console.error('創建修改請求失敗:', error);
      throw error;
    }
  };

  /**
   * 批准修改請求
   */
  const approveRequest = async (
    orderId: string,
    requestId: string,
    adminResponse: string
  ): Promise<void> => {
    try {
      // 更新請求狀態
      const requestRef = doc(db, 'orders', orderId, 'modificationRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        adminResponse,
        processedAt: serverTimestamp(),
      });

      // 標記訂單有未讀回覆（通知 customer）
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        hasUnreadReplies: true,
      });
    } catch (error) {
      console.error('批准請求失敗:', error);
      throw error;
    }
  };

  /**
   * 拒絕修改請求
   */
  const rejectRequest = async (
    orderId: string,
    requestId: string,
    adminResponse: string
  ): Promise<void> => {
    try {
      // 更新請求狀態
      const requestRef = doc(db, 'orders', orderId, 'modificationRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        adminResponse,
        processedAt: serverTimestamp(),
      });

      // 標記訂單有未讀回覆（通知 customer）
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        hasUnreadReplies: true,
      });
    } catch (error) {
      console.error('拒絕請求失敗:', error);
      throw error;
    }
  };

  /**
   * 獲取訂單的所有修改請求
   */
  const getRequests = async (orderId: string): Promise<OrderModificationRequest[]> => {
    try {
      const requestsRef = collection(db, 'orders', orderId, 'modificationRequests');
      const snapshot = await getDoc(doc(db, 'orders', orderId));

      if (!snapshot.exists()) {
        return [];
      }

      // 這裡需要實際查詢子集合
      // 暫時返回空數組，實際使用時需要在組件中用 onSnapshot 監聽
      return [];
    } catch (error) {
      console.error('獲取修改請求失敗:', error);
      return [];
    }
  };

  return {
    createRequest,
    approveRequest,
    rejectRequest,
    getRequests,
  };
};
