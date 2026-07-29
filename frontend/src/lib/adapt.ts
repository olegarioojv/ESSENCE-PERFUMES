import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import type { Product } from "./types";

/**
 * Maps the real NestJS `Product` entity (id/sku/slug/price as string/
 * promotionalPrice/olfactoryFamily/notes as a flat string[]/isFeatured...)
 * onto this frontend's `Product` shape (compareAtPrice/notes split into
 * top-heart-base/rating/image/brand). The backend has no image or brand-name
 * field yet (Cloudinary wiring is Fase 19), so those are filled in here —
 * remove this adapter once the backend exposes them directly.
 */

const PLACEHOLDER_IMAGES = [p1, p2, p3, p4, p5, p6];

export interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  price: string;
  promotionalPrice: string | null;
  volumeMl: string | null;
  olfactoryFamily: string | null;
  notes: string[] | null;
  isFeatured: boolean;
  isActive: boolean;
}

function placeholderImage(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
}

function splitNotes(notes: string[] | null): Product["notes"] | undefined {
  if (!notes || notes.length === 0) return undefined;
  const third = Math.ceil(notes.length / 3);
  return {
    top: notes.slice(0, third),
    heart: notes.slice(third, third * 2),
    base: notes.slice(third * 2),
  };
}

export function adaptProduct(api: ApiProduct): Product {
  const price = api.promotionalPrice ? Number(api.promotionalPrice) : Number(api.price);
  const compareAtPrice = api.promotionalPrice ? Number(api.price) : undefined;

  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    brand: "Essence Perfumes",
    price,
    compareAtPrice,
    image: placeholderImage(api.id),
    family: api.olfactoryFamily ?? undefined,
    size: api.volumeMl ? `${api.volumeMl}ml` : undefined,
    badges: api.isFeatured ? ["bestseller"] : undefined,
    notes: splitNotes(api.notes),
    description: api.description ?? undefined,
  };
}
