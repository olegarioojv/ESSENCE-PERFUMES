import { queryOptions } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { MOCK_PRODUCTS, findMockProduct } from "./mock-products";
import { adaptProduct, type ApiProduct } from "./adapt";
import type { Cart, Product, Order } from "./types";

/**
 * All backend queries fall back to mock data if the backend is unreachable
 * (network error, 404, or CORS in the sandbox preview). Once the real API
 * URL is configured, live data replaces mocks transparently.
 */
async function safeFetch<T>(path: string, fallback: T, auth = true): Promise<T> {
  try {
    return await api<T>(path, { auth });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 0 || e.status === 404)) {
      return fallback;
    }
    throw e;
  }
}

interface PaginatedResponse<T> {
  items: T[];
}

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await safeFetch<PaginatedResponse<ApiProduct> | Product[]>(
        "/products?limit=100",
        MOCK_PRODUCTS,
        false,
      );
      return Array.isArray(res) ? res : res.items.map(adaptProduct);
    },
    staleTime: 60_000,
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["products", slug],
    queryFn: async () => {
      const fallback = findMockProduct(slug) ?? MOCK_PRODUCTS[0];
      const res = await safeFetch<ApiProduct | Product>(`/products/slug/${slug}`, fallback, false);
      return "olfactoryFamily" in res ? adaptProduct(res) : res;
    },
    staleTime: 60_000,
  });

export const cartQuery = () =>
  queryOptions({
    queryKey: ["cart"],
    queryFn: () => safeFetch<Cart>("/cart", { items: [], subtotal: 0 }),
  });

export const ordersQuery = () =>
  queryOptions({
    queryKey: ["orders"],
    queryFn: () => safeFetch<Order[]>("/orders", []),
  });
