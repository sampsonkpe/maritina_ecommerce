import api from "../api/axios";

import type { Order } from "../types/order";
import type {
  CreateOrderResponse,
  OrderStatusResponse,
} from "../types/api";

import type { DeliveryType } from "../constants/order";

export const orderService = {
  async createOrder(
    deliveryType: DeliveryType,
    addressId?: number,
    guestData?: {
      full_name?: string;
      email?: string;
      phone?: string;
      address?: string;
    }
  ): Promise<CreateOrderResponse> {
    const response = await api.post(
      "/orders/create/",
      {
        delivery_type: deliveryType,
        address_id: addressId,
        ...guestData,
      }
    );

    return response.data;
  },

  async claimGuestOrders(): Promise<{
    message: string;
    claimed_count: number;
  }> {
    const response = await api.post(
      "/orders/claim-guest/"
    );

    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await api.get("/orders/");

    return response.data;
  },

  async getOrder(
    orderId: number
  ): Promise<Order> {
    const response = await api.get(
      `/orders/${orderId}/`
    );

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

  async reorderOrder(
    orderId: number
  ): Promise<{
    message: string;
    added_items: {
      product_name: string;
      variant_name: string;
      quantity: number;
    }[];
    unavailable_items: {
      product_name: string;
      variant_name: string;
      reason: string;
    }[];
  }> {
    const response = await api.post(
      `/orders/${orderId}/reorder/`
    );

    return response.data;
  },
};