/**
 * Admin-facing product API — Fase 18 "Integração". Replaces the mock
 * `adminProducts` data (frontend/src/lib/data/mockAdmin.ts) with real calls
 * against the NestJS `/products`, `/categories`, and `/brands` endpoints.
 *
 * Note: the backend Product entity has no stock field — stock is a separate
 * resource (`/stock/:productId`) owned by the Estoque admin page, so it is
 * intentionally not modeled here.
 */
import { apiClient, parseApiError } from "@/lib/api/client";

export interface ApiAdminProduct {
  id: string;
  name: string;
  sku: string;
  slug: string;
  barcode: string | null;
  ean: string | null;
  description: string | null;
  price: string;
  promotionalPrice: string | null;
  costPrice: string | null;
  promotionStartsAt: string | null;
  promotionEndsAt: string | null;
  brandId: string;
  categoryId: string;
  volumeMl: string | null;
  weightGrams: number | null;
  olfactoryFamily: string | null;
  notes: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string;
  price: number;
  volumeMl: number;
  brandId: string;
  categoryId: string;
  categoryName?: string;
  isActive: boolean;
  swatch: [string, string];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DEFAULT_SWATCH: [string, string] = ["#EFE6D6", "#C7B48F"];

function toAdminProduct(product: ApiAdminProduct, categoryNames: Map<string, string>): AdminProduct {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description ?? "",
    price: Number(product.price),
    volumeMl: product.volumeMl ? Number(product.volumeMl) : 0,
    brandId: product.brandId,
    categoryId: product.categoryId,
    categoryName: categoryNames.get(product.categoryId),
    isActive: product.isActive,
    swatch: DEFAULT_SWATCH,
  };
}

/** Fetches every product (active and inactive) for the admin catalog table. */
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const [{ data }, categories] = await Promise.all([
    apiClient.get<PaginatedResponse<ApiAdminProduct>>("/products", {
      params: { limit: 100 },
    }),
    fetchCategories(),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  return data.items.map((product) => toAdminProduct(product, categoryNames));
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data } = await apiClient.get<Brand[]>("/brands");
  return data;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  price: number;
  brandId: string;
  categoryId: string;
  volumeMl?: number;
  isActive?: boolean;
}

export async function createProduct(input: CreateProductInput): Promise<ApiAdminProduct> {
  const { data } = await apiClient.post<ApiAdminProduct>("/products", input);
  return data;
}

export async function updateProduct(
  id: string,
  input: Partial<CreateProductInput>,
): Promise<ApiAdminProduct> {
  const { data } = await apiClient.patch<ApiAdminProduct>(`/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function setProductActive(id: string, isActive: boolean): Promise<ApiAdminProduct> {
  const { data } = await apiClient.patch<ApiAdminProduct>(
    `/products/${id}/${isActive ? "activate" : "deactivate"}`,
  );
  return data;
}

export { parseApiError };
