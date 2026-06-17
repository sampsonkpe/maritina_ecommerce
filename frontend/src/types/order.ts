export interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_type: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}