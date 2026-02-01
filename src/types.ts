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
}
