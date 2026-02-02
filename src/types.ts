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
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: ColorSwatch;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    notes?: string;
  };
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  estimatedCompletionDate?: string | null;
  adminNotes?: string;
  createdAt: any; // Firestore Timestamp or Date
  rejectionReason?: string;
}
