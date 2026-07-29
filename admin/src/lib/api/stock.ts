import { apiClient } from "@/lib/api/client";

/**
 * Backend `Stock` entity — no product name/sku embedded, only a foreign key.
 * Callers cross-reference against `/products` to resolve display fields,
 * following the same pattern used in `@/lib/api/products.ts` for category
 * names.
 */
export interface ApiStock {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  minQuantity: number;
  updatedAt: string;
}

interface ApiProductLite {
  id: string;
  name: string;
  sku: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type StockStatus = "ok" | "baixo" | "esgotado";

export interface StockItemView {
  id: string;
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  status: StockStatus;
  lastRestock: string;
}

function stockStatus(quantity: number, minQuantity: number): StockStatus {
  if (quantity <= 0) return "esgotado";
  if (quantity <= minQuantity) return "baixo";
  return "ok";
}

async function getProductLookup(): Promise<Map<string, ApiProductLite>> {
  const { data } = await apiClient.get<PaginatedResponse<ApiProductLite>>("/products", {
    params: { limit: 100 },
  });
  return new Map(data.items.map((product) => [product.id, product]));
}

function toStockItemView(stock: ApiStock, products: Map<string, ApiProductLite>): StockItemView {
  const product = products.get(stock.productId);
  return {
    id: stock.id,
    productId: stock.productId,
    name: product?.name ?? "Produto desconhecido",
    sku: product?.sku ?? "-",
    currentStock: stock.quantity,
    minStock: stock.minQuantity,
    status: stockStatus(stock.quantity, stock.minQuantity),
    lastRestock: stock.updatedAt,
  };
}

export async function fetchStockItems(): Promise<StockItemView[]> {
  const [{ data: stockRows }, products] = await Promise.all([
    apiClient.get<ApiStock[]>("/stock"),
    getProductLookup(),
  ]);
  return stockRows.map((stock) => toStockItemView(stock, products));
}

export async function fetchLowStockCount(): Promise<number> {
  const { data } = await apiClient.get<ApiStock[]>("/stock/low-stock");
  return data.length;
}

export interface StockQuantityPayload {
  quantity: number;
  reason?: string;
}

export async function increaseStock(
  productId: string,
  payload: StockQuantityPayload = { quantity: 1 },
): Promise<ApiStock> {
  const { data } = await apiClient.post<ApiStock>(`/stock/${productId}/in`, payload);
  return data;
}

export async function decreaseStock(
  productId: string,
  payload: StockQuantityPayload = { quantity: 1 },
): Promise<ApiStock> {
  const { data } = await apiClient.post<ApiStock>(`/stock/${productId}/out`, payload);
  return data;
}
