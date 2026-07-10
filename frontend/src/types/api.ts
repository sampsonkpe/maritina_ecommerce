import type { Order } from "./order";
import type { Address } from "./address";
import type { Cart } from "./cart";

export interface MessageResponse {
  message: string;
}

export interface OrderStatusResponse extends MessageResponse {
  status: string;
}

export interface CreateOrderResponse extends MessageResponse {
  order: Order;

  summary: {
    subtotal: number;
    delivery_fee: number;
    total_amount: number;
  };
}

export interface PaymentInitializeResponse {
  status: boolean;
  message: string;

  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaymentVerifyResponse extends MessageResponse {
  data: unknown;
}

export type AddressesResponse = Address[];

export type OrdersResponse = Order[];

export type CartResponse = Cart;