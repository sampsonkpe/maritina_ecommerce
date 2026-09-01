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
    variantId: number
  ): Promise<FavouriteAddResponse> {
    const response = await api.post(
      "/favourites/add/",
      {
        variant_id: variantId,
      }
    );

    return response.data;
  },

  async removeFromFavourites(
    variantId: number
  ): Promise<FavouriteRemoveResponse> {
    const response = await api.delete(
      `/favourites/remove/${variantId}/`
    );

    return response.data;
  },
};