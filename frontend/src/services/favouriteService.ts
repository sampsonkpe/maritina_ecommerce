import api from "../api/axios";

import type {
  FavouriteItem,
  FavouriteAddResponse,
  FavouriteRemoveResponse,
} from "../types/favourite";

export const favouriteService = {
  async getFavourites(): Promise<FavouriteItem[]> {
    const response = await api.get("/favourites/");

    return response.data;
  },

  async addToFavourites(
    productId: number
  ): Promise<FavouriteAddResponse> {
    const response = await api.post(
      "/favourites/add/",
      {
        product_id: productId,
      }
    );

    return response.data;
  },

  async removeFromFavourites(
    productId: number
  ): Promise<FavouriteRemoveResponse> {
    const response = await api.delete(
      `/favourites/remove/${productId}/`
    );

    return response.data;
  },
};