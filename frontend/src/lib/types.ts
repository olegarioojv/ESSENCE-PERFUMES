export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  gallery?: string[];
  rating?: number;
  reviewCount?: number;
  badges?: Array<"new" | "bestseller" | "sale" | "limited">;
  gender?: "feminino" | "masculino" | "unissex";
  family?: string;
  size?: string;
  volumes?: Array<{ ml: number; price: number }>;
  notes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
  description?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export interface Address {
  id?: string;
  fullName: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
  items: CartItem[];
  address?: Address;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: "user" | "admin";
}
