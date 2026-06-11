import api from "../api/axios";

export const productService = {
  async getProducts() {
    const response = await api.get("/products/");
    return response.data;
  },

  async getCategories() {
    const response = await api.get("/products/categories/");
    return response.data;
  },

  async getProduct(id: string) {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },
};