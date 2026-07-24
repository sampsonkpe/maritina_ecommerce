export interface CartItem {
  id: number;
  variant: number;
  product_name: string;
  variant_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
}