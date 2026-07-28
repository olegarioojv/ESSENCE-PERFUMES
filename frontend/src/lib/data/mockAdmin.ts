/**
 * Mock data for the Painel Administrativo (Fase 17). Placeholder until Fase
 * 18 wires these sections up to the real admin API endpoints — everything
 * here is local, static data consumed by client components.
 */

import { allProducts, type HomeProduct } from "./mockProducts";

const uniqueProducts: HomeProduct[] = Array.from(
  new Map(allProducts.map((product) => [product.slug, product])).values(),
);

export type BadgeTone = "success" | "gold" | "tan" | "pale" | "brown" | "danger" | "neutral";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStat {
  label: string;
  value: string;
  deltaPct: number;
  direction: "up" | "down";
  caption: string;
}

export const dashboardStats: DashboardStat[] = [
  {
    label: "Faturamento Total",
    value: "R$ 48.750,90",
    deltaPct: 18.6,
    direction: "up",
    caption: "em relação aos últimos 30 dias",
  },
  {
    label: "Pedidos",
    value: "152",
    deltaPct: 12.3,
    direction: "up",
    caption: "em relação aos últimos 30 dias",
  },
  {
    label: "Clientes",
    value: "1.284",
    deltaPct: 9.8,
    direction: "up",
    caption: "em relação aos últimos 30 dias",
  },
  {
    label: "Ticket Médio",
    value: "R$ 320,73",
    deltaPct: 15.4,
    direction: "up",
    caption: "em relação aos últimos 30 dias",
  },
];

export interface RevenuePoint {
  date: string;
  current: number;
  previous: number;
}

export const revenueSeries: RevenuePoint[] = [
  { date: "01 Mai", current: 12000, previous: 8000 },
  { date: "06 Mai", current: 18500, previous: 13500 },
  { date: "11 Mai", current: 15200, previous: 16800 },
  { date: "16 Mai", current: 24800, previous: 17200 },
  { date: "21 Mai", current: 38500, previous: 22000 },
  { date: "26 Mai", current: 29800, previous: 25500 },
  { date: "31 Mai", current: 33200, previous: 27800 },
];

export type AdminOrderStatus = "entregue" | "transito" | "processando" | "cancelado" | "estornado";

export const orderStatusMeta: Record<AdminOrderStatus, { label: string; tone: BadgeTone }> = {
  entregue: { label: "Entregue", tone: "success" },
  transito: { label: "Em trânsito", tone: "gold" },
  processando: { label: "Processando", tone: "tan" },
  cancelado: { label: "Cancelado", tone: "pale" },
  estornado: { label: "Estornado", tone: "brown" },
};

export interface OrderStatusSlice {
  status: AdminOrderStatus;
  count: number;
  pct: number;
}

export const orderStatusBreakdown: OrderStatusSlice[] = [
  { status: "entregue", count: 78, pct: 51.3 },
  { status: "transito", count: 34, pct: 22.4 },
  { status: "processando", count: 22, pct: 14.5 },
  { status: "cancelado", count: 10, pct: 6.6 },
  { status: "estornado", count: 8, pct: 5.2 },
];

export interface AdminOrder {
  id: string;
  customer: string;
  date: string;
  status: AdminOrderStatus;
  total: number;
}

export const recentAdminOrders: AdminOrder[] = [
  { id: "#12458", customer: "Mariana Silva", date: "2026-05-28", status: "entregue", total: 349.9 },
  { id: "#12457", customer: "Lucas Oliveira", date: "2026-05-28", status: "transito", total: 699.8 },
  { id: "#12456", customer: "Juliana Costa", date: "2026-05-27", status: "processando", total: 1049.7 },
  { id: "#12455", customer: "Rafael Almeida", date: "2026-05-27", status: "entregue", total: 349.9 },
  { id: "#12454", customer: "Fernanda Souza", date: "2026-05-26", status: "cancelado", total: 479.8 },
];

export interface TopProduct {
  slug: string;
  name: string;
  image?: string;
  swatch: [string, string];
  sales: number;
  revenue: number;
}

export const topProducts: TopProduct[] = uniqueProducts.slice(0, 4).map((product, index) => ({
  slug: product.slug,
  name: product.name,
  image: product.image,
  swatch: product.swatch,
  sales: [45, 38, 31, 28][index] ?? 20,
  revenue: [15745.5, 13251.2, 10089.7, 9772.2][index] ?? 5000,
}));

export interface AdminAlert {
  id: string;
  kind: "stock" | "order" | "review";
  title: string;
  description: string;
}

export const adminAlerts: AdminAlert[] = [
  { id: "stock", kind: "stock", title: "Estoque baixo", description: "12 produtos com estoque baixo" },
  { id: "orders", kind: "order", title: "Pedidos pendentes", description: "22 pedidos aguardando processamento" },
  { id: "reviews", kind: "review", title: "Avaliações pendentes", description: "8 avaliações aguardando aprovação" },
];
