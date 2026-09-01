export interface FavouriteVariant {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  name: string;
  price: string;
  stock: number;
  is_available: boolean;
}

export interface FavouriteItem {
  id: number;
  variant: FavouriteVariant;
  created_at: string;
}

export interface FavouriteAddResponse {
  created: boolean;
  item: FavouriteItem;
}

export interface FavouriteRemoveResponse {
  message: string;
}