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
  delivery_type_display: string;
  status: string;
  address: number | null;
  address_text: string | null;
  user_email: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}