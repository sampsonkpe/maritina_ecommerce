import api from "../api/axios";

import type { Order } from "../types/order";
import type {
  CreateOrderResponse,
  OrderStatusResponse,
} from "../types/api";

export const orderService = {
  async createOrder(
    deliveryType: string,
    addressId?: number
  ): Promise<CreateOrderResponse> {
    const response = await api.post(
      "/orders/create/",
      {
        delivery_type: deliveryType,
        address_id: addressId,
      }
    );

    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await api.get("/orders/");

    return response.data;
  },

  async getAdminOrders(filters?: {
    status?: string;
    deliveryType?: string;
    search?: string;
  }): Promise<Order[]> {
    const response = await api.get(
      "/orders/admin/all/",
      {
        params: {
          status: filters?.status || undefined,
          delivery_type:
            filters?.deliveryType || undefined,
          search:
            filters?.search || undefined,
        },
      }
    );

    return response.data;
  },

  async updateOrderStatus(
    orderId: number,
    status: string
  ): Promise<OrderStatusResponse> {
    const response = await api.patch(
      `/orders/admin/update-status/${orderId}/`,
      {
        status,
      }
    );

    return response.data;
  },
};