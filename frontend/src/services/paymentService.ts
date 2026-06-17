import api from "../api/axios";

export const paymentService = {
  async initializePayment(
    orderId: number
  ) {
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
  ) {
    const response = await api.get(
      `/payments/verify/${reference}/`
    );

    return response.data;
  },
};