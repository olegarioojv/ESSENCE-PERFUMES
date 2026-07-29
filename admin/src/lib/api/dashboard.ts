import { apiClient } from "@/lib/api/client";
import { orderStatusMeta, type AdminOrderStatus } from "@/lib/data/mockAdmin";

export interface DashboardSummary {
  totalSales: number;
  ordersCount: number;
  customersCount: number;
  productsCount: number;
  averageTicket: number;
  profit: number;
}

export interface SalesChartPoint {
  date: string;
  ordersCount: number;
  revenue: number;
}

export interface BestSellerEntry {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface OutOfStockEntry {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
}

export async function fetchSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function fetchSalesChart(days = 30): Promise<SalesChartPoint[]> {
  const { data } = await apiClient.get<SalesChartPoint[]>("/dashboard/sales-chart", { params: { days } });
  return data;
}

export async function fetchBestSellers(limit = 4): Promise<BestSellerEntry[]> {
  const { data } = await apiClient.get<BestSellerEntry[]>("/dashboard/best-sellers", { params: { limit } });
  return data;
}

export async function fetchOutOfStock(): Promise<OutOfStockEntry[]> {
  const { data } = await apiClient.get<OutOfStockEntry[]>("/dashboard/out-of-stock");
  return data;
}

export interface OrderStatusCount {
  status: AdminOrderStatus;
  count: number;
  pct: number;
}

interface AdminOrderListItem {
  status: AdminOrderStatus;
}

/** No aggregated "orders by status" endpoint exists — fetch a large page of
 * admin orders and tally locally. Acceptable approximation: reflects the
 * most recent `limit` orders, not the full historical total. */
export async function fetchOrderStatusBreakdown(limit = 200): Promise<{ total: number; breakdown: OrderStatusCount[] }> {
  const { data } = await apiClient.get<{ items: AdminOrderListItem[]; total: number }>("/orders/admin", {
    params: { limit },
  });

  const counts = new Map<AdminOrderStatus, number>();
  for (const order of data.items) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }

  const total = data.items.length;
  const breakdown: OrderStatusCount[] = Object.keys(orderStatusMeta)
    .map((status) => status as AdminOrderStatus)
    .map((status) => {
      const count = counts.get(status) ?? 0;
      return { status, count, pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0 };
    })
    .filter((entry) => entry.count > 0);

  return { total, breakdown };
}
