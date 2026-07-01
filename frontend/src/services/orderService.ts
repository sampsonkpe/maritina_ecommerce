import api from "../api/axios";

export const orderService = {
  async createOrder(
    deliveryType: string,
    addressId?: number
  ) {
    const response = await api.post(
      "/orders/create/",
      {
        delivery_type: deliveryType,
        address_id: addressId,
      }
    );

    return response.data;
  },

  async getOrders() {
    const response = await api.get(
      "/orders/my-orders/"
    );

    return response.data;
  },

  async getAdminOrders() {
    const response = await api.get(
      "/orders/admin/all"
    );

    return response.data;
  },

  async updateOrderStatus(orderId: number, status: string) {
    const response = await api.patch(
      `/orders/admin/update-status/${orderId}/`,
      {
        status,
      }
    );

    return response.data;
  },
};