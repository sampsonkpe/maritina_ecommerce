export interface Review {
  id: number;
  customer_first_name: string;
  product_name: string;
  variant_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewCreateData {
  product: number;
  variant: number;
  rating: number;
  comment: string;
}