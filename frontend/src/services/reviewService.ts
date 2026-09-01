import api from "../api/axios";

import type {
  Review,
  ReviewCreateData,
} from "../types/review";

export const reviewService = {
  async getProductReviews(
    productId: number
  ): Promise<Review[]> {
    const response = await api.get(
      `/reviews/product/${productId}/`
    );

    return response.data;
  },

  async createReview(
    data: ReviewCreateData
  ): Promise<Review> {
    const response = await api.post(
      "/reviews/create/",
      data
    );

    return response.data;
  },
};