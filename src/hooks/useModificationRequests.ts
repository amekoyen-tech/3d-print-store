import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
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
      const requestId = `req_${Date.now()}`;
      const newRequest: OrderModificationRequest = {
        id: requestId,
        requestedBy: 'customer',
        requestType,
        description: description.trim(),
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        modificationRequests: arrayUnion(newRequest),
        hasUnreadMessages: true, // 通知 admin
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
    adminResponse: string,
    requests: OrderModificationRequest[]
  ): Promise<void> => {
    try {
      // 找到對應的請求並更新
      const updatedRequests = requests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'approved' as const,
            adminResponse,
            processedAt: Timestamp.now(),
          };
        }
        return req;
      });

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        modificationRequests: updatedRequests,
        hasUnreadReplies: true, // 通知 customer
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
    adminResponse: string,
    requests: OrderModificationRequest[]
  ): Promise<void> => {
    try {
      // 找到對應的請求並更新
      const updatedRequests = requests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'rejected' as const,
            adminResponse,
            processedAt: Timestamp.now(),
          };
        }
        return req;
      });

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        modificationRequests: updatedRequests,
        hasUnreadReplies: true, // 通知 customer
      });
    } catch (error) {
      console.error('拒絕請求失敗:', error);
      throw error;
    }
  };

  return {
    createRequest,
    approveRequest,
    rejectRequest,
  };
};
