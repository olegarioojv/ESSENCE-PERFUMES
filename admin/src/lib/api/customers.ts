/**
 * Admin-facing customers API — Fase 18 "Integração". Replaces the mock
 * `mockCustomers` data (frontend/src/lib/data/mockAdmin.ts) with real calls
 * against the NestJS `/users` and `/orders/admin` endpoints.
 *
 * The backend `User` entity has no order-count/total-spent fields, so those
 * stats are derived by aggregating `/orders/admin` client-side (one batched
 * request instead of one-per-customer).
 */
import { apiClient, parseApiError } from "@/lib/api/client";
import type { AdminOrderStatus } from "@/lib/data/mockAdmin";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cliente";
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  ordersCount: number;
  totalSpent: number;
  since: string;
  status: "ativo" | "inativo";
}

export interface ApiAdminOrder {
  id: string;
  userId: string;
  status: AdminOrderStatus;
  subtotal: string;
  couponCode: string | null;
  discountAmount: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
}

export interface CustomerOrder {
  id: string;
  date: string;
  status: AdminOrderStatus;
  total: number;
}

function toCustomer(user: ApiUser, orderStats: Map<string, { count: number; total: number }>): Customer {
  const stats = orderStats.get(user.id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    ordersCount: stats?.count ?? 0,
    totalSpent: stats?.total ?? 0,
    since: user.createdAt,
    status: user.deletedAt == null ? "ativo" : "inativo",
  };
}

/** Fetches every customer (role === "cliente") with aggregated order stats. */
export async function fetchCustomers(): Promise<Customer[]> {
  const [{ data: users }, { data: ordersPage }] = await Promise.all([
    apiClient.get<ApiUser[]>("/users"),
    apiClient.get<{ items: ApiAdminOrder[]; total: number }>("/orders/admin", { params: { limit: 200 } }),
  ]);

  const orderStats = new Map<string, { count: number; total: number }>();
  for (const order of ordersPage.items) {
    const existing = orderStats.get(order.userId) ?? { count: 0, total: 0 };
    existing.count += 1;
    existing.total += Number(order.total);
    orderStats.set(order.userId, existing);
  }

  return users.filter((user) => user.role === "cliente").map((user) => toCustomer(user, orderStats));
}

/** Fetches a single customer's orders for the profile modal. */
export async function fetchCustomerOrders(userId: string): Promise<CustomerOrder[]> {
  const { data } = await apiClient.get<{ items: ApiAdminOrder[]; total: number }>("/orders/admin", {
    params: { userId, limit: 100 },
  });
  return data.items.map((order) => ({
    id: order.id,
    date: order.createdAt,
    status: order.status,
    total: Number(order.total),
  }));
}

export { parseApiError };
