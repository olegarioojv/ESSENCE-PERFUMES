import { create } from "zustand";
import { apiClient } from "@/lib/api/client";

/**
 * Cart is server-side (no anonymous/guest cart in the backend — every
 * `/cart` route requires a bearer token), so this store is a thin client
 * over GET/POST/PATCH/DELETE `/cart*`, not a local reducer. Every mutation
 * re-syncs `items`/`subtotal` from the API's response rather than guessing
 * the new state locally, so it never drifts from what's actually persisted.
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartSummaryResponse {
  cartId: string;
  items: { productId: string; name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  itemCount: number;
  subtotal: number;
}

function toCartItems(summary: CartSummaryResponse): CartItem[] {
  return summary.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
  }));
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await apiClient.get<CartSummaryResponse>("/cart");
      set({ items: toCartItems(data) });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    const { data } = await apiClient.post<CartSummaryResponse>("/cart/items", {
      productId: item.productId,
      quantity: item.quantity,
    });
    set({ items: toCartItems(data) });
  },

  removeItem: async (productId) => {
    const { data } = await apiClient.delete<CartSummaryResponse>(`/cart/items/${productId}`);
    set({ items: toCartItems(data) });
  },

  setQuantity: async (productId, quantity) => {
    const { data } = await apiClient.patch<CartSummaryResponse>(`/cart/items/${productId}`, { quantity });
    set({ items: toCartItems(data) });
  },

  clear: async () => {
    const { items } = get();
    await Promise.all(items.map((item) => apiClient.delete(`/cart/items/${item.productId}`)));
    set({ items: [] });
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
