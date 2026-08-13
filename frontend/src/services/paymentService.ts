import api from "../api/axios";

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
    orderId: number
  ): Promise<InitializePaymentResponse> {
    const response = await api.post(
      "/payments/initialize/",
      {
        order_id: orderId,
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