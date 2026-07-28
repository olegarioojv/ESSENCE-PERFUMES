/**
 * Mock data for the Painel Administrativo (Fase 17). Placeholder until Fase
 * 18 wires these sections up to the real admin API endpoints — everything
 * here is local, static data consumed by client components.
 */

import { allProducts, mockUser, type HomeProduct } from "./mockProducts";

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

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

export interface AdminProduct extends HomeProduct {
  sku: string;
  stock: number;
  status: "ativo" | "inativo";
}

function skuFromSlug(slug: string): string {
  return slug.replace("essence-", "ESS-").toUpperCase();
}

export const adminProducts: AdminProduct[] = uniqueProducts.map((product, index) => ({
  ...product,
  sku: skuFromSlug(product.slug),
  stock: [42, 18, 65, 30, 12, 54, 8][index] ?? 25,
  status: "ativo",
}));

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------

export interface StockItem {
  productSlug: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  status: "ok" | "baixo" | "esgotado";
  lastRestock: string;
}

function stockStatus(current: number, min: number): StockItem["status"] {
  if (current <= 0) return "esgotado";
  if (current <= min) return "baixo";
  return "ok";
}

const stockOverrides: Record<string, number> = {
  "essence-vetiver": 5,
  "essence-aura": 0,
};

export const stockItems: StockItem[] = adminProducts.map((product, index) => {
  const currentStock = stockOverrides[product.slug] ?? product.stock;
  const minStock = 15;
  return {
    productSlug: product.slug,
    name: product.name,
    sku: product.sku,
    currentStock,
    minStock,
    status: stockStatus(currentStock, minStock),
    lastRestock: ["2026-05-20", "2026-05-18", "2026-05-24", "2026-05-15", "2026-05-10", "2026-05-22", "2026-05-05"][
      index
    ] ?? "2026-05-01",
  };
});

export const adminAlerts: AdminAlert[] = [
  { id: "stock", kind: "stock", title: "Estoque baixo", description: "12 produtos com estoque baixo" },
  { id: "orders", kind: "order", title: "Pedidos pendentes", description: "22 pedidos aguardando processamento" },
  { id: "reviews", kind: "review", title: "Avaliações pendentes", description: "8 avaliações aguardando aprovação" },
];

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

export interface AdminOrderDetail extends AdminOrder {
  items: number;
  paymentMethod: string;
  address: string;
}

const customerPool = [
  "Mariana Silva",
  "Lucas Oliveira",
  "Juliana Costa",
  "Rafael Almeida",
  "Fernanda Souza",
  "João Victor",
  "Camila Ferreira",
  "Bruno Santos",
  "Patrícia Lima",
  "Diego Martins",
];

const statusCycle: AdminOrderStatus[] = ["entregue", "transito", "processando", "cancelado", "estornado"];
const paymentMethods = ["Cartão de crédito", "Pix", "Boleto"];

export const allAdminOrders: AdminOrderDetail[] = Array.from({ length: 18 }, (_, index) => {
  const customer = customerPool[index % customerPool.length];
  const status = statusCycle[index % statusCycle.length];
  const day = 28 - index;
  return {
    id: `#124${58 - index}`,
    customer,
    date: `2026-05-${String(Math.max(day, 1)).padStart(2, "0")}`,
    status,
    total: 249.9 + (index % 6) * 130.5,
    items: 1 + (index % 4),
    paymentMethod: paymentMethods[index % paymentMethods.length],
    address: `Rua das Flores, ${100 + index} — Extrema, MG`,
  };
});

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  since: string;
  status: "ativo" | "inativo";
}

// ---------------------------------------------------------------------------
// Cupons
// ---------------------------------------------------------------------------

export interface Coupon {
  code: string;
  type: "percentual" | "fixo";
  value: number;
  minOrder?: number;
  usageLimit: number;
  usageCount: number;
  expiresAt: string;
  status: "ativo" | "agendado" | "expirado";
}

export const mockCoupons: Coupon[] = [
  { code: "BEMVINDO10", type: "percentual", value: 10, minOrder: 100, usageLimit: 500, usageCount: 312, expiresAt: "2026-12-31", status: "ativo" },
  { code: "FRETEGRATIS", type: "fixo", value: 19.9, minOrder: 150, usageLimit: 200, usageCount: 87, expiresAt: "2026-08-31", status: "ativo" },
  { code: "VERAO25", type: "percentual", value: 25, minOrder: 200, usageLimit: 100, usageCount: 100, expiresAt: "2026-06-30", status: "expirado" },
  { code: "ESSENCE50", type: "fixo", value: 50, minOrder: 300, usageLimit: 80, usageCount: 34, expiresAt: "2026-09-15", status: "ativo" },
  { code: "PRIMAVERA15", type: "percentual", value: 15, usageLimit: 300, usageCount: 0, expiresAt: "2026-09-01", status: "agendado" },
  { code: "BLACKFRIDAY30", type: "percentual", value: 30, minOrder: 250, usageLimit: 1000, usageCount: 0, expiresAt: "2026-11-29", status: "agendado" },
  { code: "ANIVERSARIO20", type: "percentual", value: 20, usageLimit: 150, usageCount: 150, expiresAt: "2026-05-01", status: "expirado" },
  { code: "VIP100", type: "fixo", value: 100, minOrder: 500, usageLimit: 50, usageCount: 12, expiresAt: "2026-10-31", status: "ativo" },
];

export const mockCustomers: Customer[] = customerPool.map((name, index) => {
  const isLoggedInUser = name === mockUser.name;
  const ordersForCustomer = allAdminOrders.filter((order) => order.customer === name);
  return {
    id: `CUST-${String(index + 1).padStart(3, "0")}`,
    name,
    email: isLoggedInUser ? mockUser.email : `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
    phone: isLoggedInUser ? mockUser.phone : `(35) 9${8000 + index}-${1000 + index}`,
    ordersCount: ordersForCustomer.length,
    totalSpent: ordersForCustomer.reduce((sum, order) => sum + order.total, 0),
    since: `202${4 + (index % 3)}-0${1 + (index % 9)}-15`,
    status: index === 8 ? "inativo" : "ativo",
  };
});
