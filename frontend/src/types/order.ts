export interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;

  user: number | null;
  user_email: string | null;

  guest_full_name: string;
  guest_email: string;
  guest_phone: string;
  guest_address: string;

  subtotal: number;
  delivery_fee: number;
  total_amount: number;

  delivery_type: string;
  delivery_type_display: string;

  status: string;
  payment_status: string;

  payment_reference: string | null;
  paid_at: string | null;

  address: number | null;
  address_text: string | null;

  created_at: string;
  updated_at: string;

  items: OrderItem[];
}