export interface Product {
  id: string;
  name: string;
  materials: string[];
  weight_g: number;
  print_time_min: number;
  post_processing_time_min: number;
  price: number;
  images: string[];
  description: string;
  precision_mm?: number;
  isCustomizable?: boolean;
  customizationFee?: number;
}

export interface ColorSwatch {
  id: string;
  name: string;
  hexCode: string;
  material: string;
  inStock: boolean;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: ColorSwatch | 'default';
  status?: 'pending' | 'printing' | 'completed';
}

export type OrderStatus = 'pending' | 'accepted' | 'printing' | 'post_processing' | 'rejected' | 'completed' | 'cancelled';
export type DeliveryMethod = 'in_person' | 'mailing';
export type PaymentMethod = 'bank_transfer' | 'line_pay' | 'cash';

export interface OrderMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  content: string;
  imageUrl?: string; // 圖片 URL（存在 Firebase Storage）
  type: 'message' | 'system'; // 一般留言或系統訊息
  timestamp: any; // Firestore Timestamp
}

export interface OrderModificationRequest {
  id: string;
  requestedBy: 'customer'; // 只有用戶能提出
  requestType: 'change_color' | 'change_quantity' | 'change_address' | 'other';
  description: string; // 修改說明
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string; // 商家回應
  createdAt: any;
  processedAt?: any;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    contactMethod: string; // email, line, or ig
    address?: string;
    notes?: string;
  };
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  shippingFee: number;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  estimatedCompletionDate?: string | null;
  adminNotes?: string;
  createdAt: any; // Firestore Timestamp or Date
  rejectionReason?: string;
  messages?: OrderMessage[];
  modificationRequests?: OrderModificationRequest[];
  hasUnreadMessages?: boolean; // Admin 未讀標記
  hasUnreadReplies?: boolean; // Customer 未讀標記
  subscriberEmails?: string[]; // Email 訂閱列表
}

export interface StoreSettings {
  freeShippingThreshold: number;
  baseShippingFee: number;
}
