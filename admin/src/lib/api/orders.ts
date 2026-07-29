/**
 * Admin-facing orders API — Fase 18 "Integração". Replaces the mock
 * `allAdminOrders` data (frontend/src/lib/data/mockAdmin.ts) with real calls
 * against the NestJS `/orders` module.
 *
 * Note: the backend Order entity has no shipping address or payment method
 * field — those were mock-only fields and are intentionally not modeled
 * here.
 */
import { apiClient, parseApiError } from "@/lib/api/client";
import type { AdminOrderStatus } from "@/lib/data/mockAdmin";

export interface ApiOrder {
  id: string;
  userId: string;
  status: AdminOrderStatus;
  subtotal: string;
  couponCode: string | null;
  discountAmount: string;
  total: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAdminOrder extends ApiOrder {
  customerName: string | null;
  customerEmail: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  createdAt: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: AdminOrderStatus;
  note: string | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrder {
  id: string;
  customer: string;
  customerEmail: string | null;
  date: string;
  status: AdminOrderStatus;
  total: number;
}

function toAdminOrder(order: ApiAdminOrder): AdminOrder {
  return {
    id: order.id,
    customer: order.customerName ?? "—",
    customerEmail: order.customerEmail,
    date: order.createdAt,
    status: order.status,
    total: Number(order.total),
  };
}

export interface FetchAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: AdminOrderStatus | "todos";
}

export interface AdminOrdersPage {
  items: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Fetches a page of orders for the admin table, server-side paginated/filtered. */
export async function fetchAdminOrders(params: FetchAdminOrdersParams = {}): Promise<AdminOrdersPage> {
  const { page = 1, limit = 8, status } = params;
  const { data } = await apiClient.get<PaginatedResponse<ApiAdminOrder>>("/orders/admin", {
    params: {
      page,
      limit,
      status: status && status !== "todos" ? status : undefined,
    },
  });
  return {
    items: data.items.map(toAdminOrder),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
}

export interface OrderDetail extends ApiOrder {
  items: OrderItem[];
}

export async function fetchOrderDetail(id: string): Promise<OrderDetail> {
  const { data } = await apiClient.get<OrderDetail>(`/orders/${id}`);
  return data;
}

export async function fetchOrderTimeline(id: string): Promise<OrderStatusHistoryEntry[]> {
  const { data } = await apiClient.get<OrderStatusHistoryEntry[]>(`/orders/${id}/timeline`);
  return data;
}

export async function updateOrderStatus(
  id: string,
  status: AdminOrderStatus,
  note?: string,
): Promise<OrderDetail> {
  const { data } = await apiClient.patch<OrderDetail>(`/orders/${id}/status`, { status, note });
  return data;
}

export { parseApiError };
