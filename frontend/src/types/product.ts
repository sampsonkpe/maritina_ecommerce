export interface ProductImage {
  id: number;
  product: number;
  image: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  price: string;
  stock: number;
  is_available: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string | null;
  category: number;
  images: ProductImage[];
  variants: ProductVariant[];
}