import type { Product } from "./product";

export interface FavouriteItem {
  id: number;
  product: Product;
  created_at: string;
}

export interface FavouriteAddResponse {
  created: boolean;
  item: FavouriteItem;
}

export interface FavouriteRemoveResponse {
  message: string;
}