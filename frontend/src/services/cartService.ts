import api from "../api/axios";

export const cartService = {
  async getCart() {
    const response = await api.get("/cart/");
    return response.data;
  },

  async addToCart(
    variantId: number,
    quantity: number
  ) {
    const response = await api.post(
      "/cart/add/",
      {
        variant_id: variantId,
        quantity,
      }
    );

    return response.data;
  },

  async removeItem(
    variantId: number
  ) {
    const response = await api.post(
      "/cart/remove/",
      {
        variant_id: variantId,
      }
    );

    return response.data;
  },

  async clearCart() {
    const response = await api.post(
      "/cart/clear/"
    );

    return response.data;
  },
};