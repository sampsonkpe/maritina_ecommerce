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
  variants: ProductVariant[];
}