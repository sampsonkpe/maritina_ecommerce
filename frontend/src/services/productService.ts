import api from "../api/axios";

export const productService = {
  async getProducts() {
    const response = await api.get("/products/products/");
    return response.data;
  },

  async getCategories() {
    const response = await api.get("/products/categories/");
    return response.data;
  },
};