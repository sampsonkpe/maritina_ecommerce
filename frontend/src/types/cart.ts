export interface CartItem {
  id: number;
  variant: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  total_price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  created_at: string;
}