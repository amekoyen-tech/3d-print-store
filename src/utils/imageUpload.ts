import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadProgress {
  percent: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * 上傳訂單留言圖片到 Firebase Storage
 * @param orderId 訂單 ID
 * @param messageId 留言 ID
 * @param file 圖片檔案
 * @returns 圖片 URL
 */
export const uploadOrderMessageImage = async (
  orderId: string,
  messageId: string,
  file: File
): Promise<string> => {
  // 驗證檔案
  if (!file.type.startsWith('image/')) {
    throw new Error('只能上傳圖片檔案');
  }

  // 檢查檔案大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('圖片大小不能超過 5MB');
  }

  try {
    // 生成檔案路徑
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const storagePath = `order-messages/${orderId}/${messageId}.${fileExtension}`;
    const storageRef = ref(storage, storagePath);

    // 上傳檔案
    await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    // 獲取下載 URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('圖片上傳失敗:', error);
    throw new Error('圖片上傳失敗，請稍後再試');
  }
};

/**
 * 驗證圖片檔案
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '只能上傳圖片檔案（JPG, PNG, GIF）' };
  }

  // 檢查檔案大小
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: '圖片大小不能超過 5MB' };
  }

  // 檢查圖片格式
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '只支援 JPG、PNG、GIF、WebP 格式' };
  }

  return { valid: true };
};
