import { apiClient } from "@/lib/api/client";
import type { HomeProduct, OlfactoryNotes } from "@/lib/data/mockProducts";

/**
 * The backend Product entity has no image field (photos are a separate,
 * Cloudinary-backed resource with no credentials configured in this env)
 * and no swatch/gradient concept. Since this is still the same 6-product
 * catalog the frontend used as mock data, we keep serving the already-
 * uploaded local photos via this slug-keyed map instead of wiring real
 * image upload.
 */
const PRODUCT_VISUALS: Record<string, { image: string; swatch: [string, string] }> = {
  "essence-legacy": { image: "/card1.jpeg", swatch: ["#D9B98C", "#8A6A3B"] },
  "essence-botanical": { image: "/card2.jpeg", swatch: ["#2E3B36", "#0E0D0C"] },
  "essence-rose": { image: "/card3.jpeg", swatch: ["#F2D9DD", "#B97C88"] },
  "essence-midnight": { image: "/midnight.png", swatch: ["#1A1816", "#0E0D0C"] },
  "essence-vetiver": { image: "/vetiver.png", swatch: ["#5B5A2E", "#2A2A18"] },
  "essence-aura": { image: "/aura.png", swatch: ["#E9E6F0", "#B9AFC9"] },
};
const DEFAULT_VISUAL = { image: undefined, swatch: ["#EFE6D6", "#C7B48F"] as [string, string] };

const OLFACTORY_FAMILY_LABELS: Record<string, string> = {
  floral: "Floral",
  amadeirado: "Woody",
  oriental: "Oriental",
  citrico: "Citrus",
  aquatico: "Aquatic",
  chipre: "Chypre",
  gourmand: "Gourmand",
  fougere: "Fougère",
};

export interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  price: string;
  brandId: string;
  categoryId: string;
  volumeMl: string | null;
  olfactoryFamily: string | null;
  notes: string[] | null;
  isFeatured: boolean;
  isActive: boolean;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiCategory {
  id: string;
  name: string;
}

let categoryNameCache: Map<string, string> | null = null;

async function getCategoryNames(): Promise<Map<string, string>> {
  if (categoryNameCache) return categoryNameCache;
  const { data } = await apiClient.get<ApiCategory[]>("/categories");
  categoryNameCache = new Map(data.map((category) => [category.id, category.name]));
  return categoryNameCache;
}

/** Splits the backend's flat notes array into top/heart/base thirds — the
 * backend doesn't model pyramid position, so this is a display approximation. */
function splitNotes(notes: string[] | null): OlfactoryNotes | undefined {
  if (!notes || notes.length === 0) return undefined;
  const third = Math.ceil(notes.length / 3);
  return {
    top: notes.slice(0, third),
    heart: notes.slice(third, third * 2),
    base: notes.slice(third * 2),
  };
}

export async function toHomeProduct(product: ApiProduct): Promise<HomeProduct> {
  const categoryNames = await getCategoryNames();
  const visual = PRODUCT_VISUALS[product.slug] ?? DEFAULT_VISUAL;
  const volumeMl = product.volumeMl ? Number(product.volumeMl) : 100;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? undefined,
    price: Number(product.price),
    volumeMl,
    swatch: visual.swatch,
    image: visual.image,
    collection: categoryNames.get(product.categoryId),
    family: product.olfactoryFamily ? OLFACTORY_FAMILY_LABELS[product.olfactoryFamily] : undefined,
    sizes: [volumeMl],
    notes: splitNotes(product.notes),
  };
}

export interface ProductFilters {
  isFeatured?: boolean;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<HomeProduct[]> {
  const { data } = await apiClient.get<PaginatedResponse<ApiProduct>>("/products", {
    params: { limit: 50, isActive: true, ...filters },
  });
  return Promise.all(data.items.map(toHomeProduct));
}

export async function fetchProductBySlug(slug: string): Promise<HomeProduct | null> {
  try {
    const { data } = await apiClient.get<ApiProduct>(`/products/slug/${slug}`);
    return await toHomeProduct(data);
  } catch {
    return null;
  }
}
