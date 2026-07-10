import api from "../api/axios";

import type { Cart } from "../types/cart";

interface CartActionResponse {
  message: string;
}

interface AddToCartResponse {
  message: string;
  item_id: number;
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get(
      "/cart/"
    );

    return response.data;
  },

  async addToCart(
    variantId: number,
    quantity: number
  ): Promise<AddToCartResponse> {
    const response = await api.post(
      "/cart/add/",
      {
        variant_id: variantId,
        quantity,
      }
    );

    return response.data;
  },

  async updateCart(
    variantId: number,
    quantity: number
  ): Promise<CartActionResponse> {
    const response = await api.post(
      "/cart/update/",
      {
        variant_id: variantId,
        quantity,
      }
    );

    return response.data;
  },

  async removeItem(
    variantId: number
  ): Promise<CartActionResponse> {
    const response = await api.post(
      "/cart/remove/",
      {
        variant_id: variantId,
      }
    );

    return response.data;
  },

  async clearCart(): Promise<CartActionResponse> {
    const response = await api.post(
      "/cart/clear/"
    );

    return response.data;
  },
};