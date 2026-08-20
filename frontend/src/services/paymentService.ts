import api from "../api/axios";
import type { Order } from "../types/order";

export interface InitializePaymentResponse {
  status: boolean;
  message: string;

  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  message: string;

  order: Order | null;

  data: {
    status: boolean;
    message: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      [key: string]: unknown;
    };
  };
}

export const paymentService = {
  async initializePayment(
    checkoutId: number
  ): Promise<InitializePaymentResponse> {
    const response = await api.post(
      "/payments/initialize/",
      {
        checkout_id: checkoutId,
      }
    );

    return response.data;
  },

  async verifyPayment(
    reference: string
  ): Promise<VerifyPaymentResponse> {
    const response = await api.get(
      `/payments/verify/${reference}/`
    );

    return response.data;
  },
};