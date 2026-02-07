import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
  arrayUnion,
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OrderModificationRequest, Order } from '../types';

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

  /**
   * 批准修改請求（需價格調整）
   */
  const approveWithPriceAdjustment = async (
    requestId: string,
    orderId: string,
    adminResponse: string,
    priceAdjustment: {
      amount: number;
      reason: string;
    },
    estimatedDateAdjustment?: string
  ): Promise<void> => {
    try {
      const requestRef = doc(db, 'orders', orderId, 'modificationRequests', requestId);

      const updateData: any = {
        status: 'pending_customer_confirmation',
        adminResponse,
        adminRespondedAt: serverTimestamp(),
        priceAdjustment: {
          amount: priceAdjustment.amount,
          reason: priceAdjustment.reason,
          proposedAt: serverTimestamp(),
          proposedBy: 'admin',
        },
      };

      if (estimatedDateAdjustment) {
        updateData.estimatedDateAdjustment = estimatedDateAdjustment;
      }

      await updateDoc(requestRef, updateData);

      // 發送系統訊息通知客戶
      const messagesRef = collection(db, 'orders', orderId, 'messages');
      let messageContent = `您的修改請求需要額外費用調整（${priceAdjustment.amount >= 0 ? '+' : ''}$${priceAdjustment.amount}）`;
      if (estimatedDateAdjustment) {
        messageContent += `，預計完成日期調整為 ${estimatedDateAdjustment}`;
      }
      messageContent += '，請至訂單詳情確認。';

      await addDoc(messagesRef, {
        sender: 'admin',
        senderName: '系統',
        content: messageContent,
        type: 'system',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('批准修改請求失敗:', error);
      throw error;
    }
  };

  /**
   * 客戶確認價格調整
   */
  const confirmPriceAdjustment = async (
    requestId: string,
    orderId: string
  ): Promise<void> => {
    try {
      const requestRef = doc(db, 'orders', orderId, 'modificationRequests', requestId);
      const orderRef = doc(db, 'orders', orderId);

      // 使用 Transaction 確保一致性
      await runTransaction(db, async (transaction) => {
        const requestSnap = await transaction.get(requestRef);
        const orderSnap = await transaction.get(orderRef);

        if (!requestSnap.exists() || !orderSnap.exists()) {
          throw new Error('訂單或修改請求不存在');
        }

        const request = requestSnap.data() as OrderModificationRequest;
        const order = orderSnap.data() as Order;

        if (!request.priceAdjustment) {
          throw new Error('無價格調整資訊');
        }

        // 驗證訂單狀態
        if (order.status === 'completed' || order.status === 'cancelled') {
          throw new Error('已完成或已取消的訂單無法調整價格');
        }

        // 驗證是否已確認
        if (request.priceAdjustment.customerConfirmedAt) {
          throw new Error('此價格調整已確認過');
        }

        const { amount, reason } = request.priceAdjustment;
        const currentTotal = order.effectiveTotalPrice || order.totalPrice;
        const newTotal = currentTotal + amount;

        // 驗證最終金額
        if (newTotal < 0) {
          throw new Error('調整後金額不可小於 0');
        }

        // 更新修改請求狀態
        transaction.update(requestRef, {
          status: 'approved',
          'priceAdjustment.customerConfirmedAt': serverTimestamp(),
        });

        // 更新訂單金額
        const orderUpdateData: any = {
          effectiveTotalPrice: newTotal,
          priceAdjustments: arrayUnion({
            modificationRequestId: requestId,
            amount,
            reason,
            appliedAt: serverTimestamp(),
            appliedBy: 'customer',
          }),
        };

        // 如果有交貨日期調整，也一併更新
        if (request.estimatedDateAdjustment) {
          orderUpdateData.estimatedCompletionDate = request.estimatedDateAdjustment;
        }

        transaction.update(orderRef, orderUpdateData);
      });

      // 發送確認訊息
      const messagesRef = collection(db, 'orders', orderId, 'messages');
      const orderSnap = await getDoc(orderRef);
      const order = orderSnap.data() as Order;
      const newTotal = (order.effectiveTotalPrice || order.totalPrice);

      await addDoc(messagesRef, {
        sender: 'admin',
        senderName: '系統',
        content: `客戶已確認價格調整，新總價：$${newTotal}`,
        type: 'system',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('確認價格調整失敗:', error);
      throw error;
    }
  };

  /**
   * 客戶拒絕價格調整
   */
  const rejectPriceAdjustment = async (
    requestId: string,
    orderId: string
  ): Promise<void> => {
    try {
      const requestRef = doc(db, 'orders', orderId, 'modificationRequests', requestId);

      await updateDoc(requestRef, {
        status: 'rejected_by_customer',
        'priceAdjustment.customerRejectedAt': serverTimestamp(),
      });

      // 發送拒絕訊息
      const messagesRef = collection(db, 'orders', orderId, 'messages');
      await addDoc(messagesRef, {
        sender: 'admin',
        senderName: '系統',
        content: '客戶已拒絕價格調整，修改請求已取消。',
        type: 'system',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('拒絕價格調整失敗:', error);
      throw error;
    }
  };

  /**
   * 批准修改請求（無價格調整）
   */
  const approveRequest = async (
    requestId: string,
    orderId: string,
    adminResponse: string
  ): Promise<void> => {
    try {
      const requestRef = doc(db, 'orders', orderId, 'modificationRequests', requestId);

      await updateDoc(requestRef, {
        status: 'approved',
        adminResponse,
        adminRespondedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
      });

      // 發送批准訊息
      const messagesRef = collection(db, 'orders', orderId, 'messages');
      await addDoc(messagesRef, {
        sender: 'admin',
        senderName: '系統',
        content: `您的修改請求已批准：${adminResponse}`,
        type: 'system',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('批准修改請求失敗:', error);
      throw error;
    }
  };

  /**
   * 拒絕修改請求
   */
  const rejectRequest = async (
    requestId: string,
    orderId: string,
    adminResponse: string
  ): Promise<void> => {
    try {
      const requestRef = doc(db, 'orders', orderId, 'modificationRequests', requestId);

      await updateDoc(requestRef, {
        status: 'rejected',
        adminResponse,
        adminRespondedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
      });

      // 發送拒絕訊息
      const messagesRef = collection(db, 'orders', orderId, 'messages');
      await addDoc(messagesRef, {
        sender: 'admin',
        senderName: '系統',
        content: `您的修改請求已被拒絕：${adminResponse}`,
        type: 'system',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('拒絕修改請求失敗:', error);
      throw error;
    }
  };

  return {
    requests,
    loading,
    approveRequest,
    rejectRequest,
    approveWithPriceAdjustment,
    confirmPriceAdjustment,
    rejectPriceAdjustment,
  };
};
