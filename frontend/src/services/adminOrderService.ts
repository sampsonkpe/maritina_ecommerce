import api from "../api/axios";

export const adminOrderService = {
  async getOrders() {
    const response = await api.get(
      "/orders/admin/all/"
    );

    return response.data;
  },

  async updateStatus(
    orderId: number,
    status: string
  ) {
    const response = await api.patch(
      `/orders/admin/update-status/${orderId}/`,
      {
        status,
      }
    );

    return response.data;
  },
};