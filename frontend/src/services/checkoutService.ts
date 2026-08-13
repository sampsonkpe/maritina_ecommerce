import api from "../api/axios";

import type { DeliveryType } from "../constants/order";

export interface CreateCheckoutResponse {
  id: number;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  expires_at: string;
}

export const checkoutService = {
  async createCheckout(
    deliveryType: DeliveryType,
    addressId?: number,
    guestData?: {
      full_name?: string;
      email?: string;
      phone?: string;
      address?: string;
    }
  ): Promise<CreateCheckoutResponse> {
    const response = await api.post(
      "/checkout/create/",
      {
        delivery_type: deliveryType,
        address_id: addressId,
        ...guestData,
      }
    );

    return response.data;
  },
};