/**
 * Admin-facing coupons API — Fase 18 "Integração". Replaces the mock
 * `mockCoupons` data (frontend/src/lib/data/mockAdmin.ts) with real calls
 * against the NestJS `/coupons` endpoints (admin-only, class-level guard).
 *
 * Notable differences from the mock shape:
 * - The backend has no `minOrder` (pedido mínimo) field at all.
 * - The backend has no `status` field — it's derived here from
 *   `isActive` / `startsAt` / `expiresAt`.
 * - The enum value is `valor_fixo` (with underscore), not `fixo`.
 * - `value` comes back from the API as a string (decimal column) and is
 *   normalized to a number here.
 */
import { apiClient, parseApiError } from "@/lib/api/client";

export type CouponType = "percentual" | "valor_fixo";
export type CouponStatus = "ativo" | "agendado" | "expirado";

export interface ApiCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  maxUses?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

/** Derives the UI-only status the mock invented, from real backend fields. */
export function deriveCouponStatus(coupon: ApiCoupon): CouponStatus {
  if (!coupon.isActive) return "expirado";
  const now = Date.now();
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) return "agendado";
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) return "expirado";
  return "ativo";
}

function toCoupon(apiCoupon: ApiCoupon): Coupon {
  return {
    id: apiCoupon.id,
    code: apiCoupon.code,
    type: apiCoupon.type,
    value: Number(apiCoupon.value),
    maxUses: apiCoupon.maxUses,
    usedCount: apiCoupon.usedCount,
    startsAt: apiCoupon.startsAt,
    expiresAt: apiCoupon.expiresAt,
    isActive: apiCoupon.isActive,
    status: deriveCouponStatus(apiCoupon),
    createdAt: apiCoupon.createdAt,
    updatedAt: apiCoupon.updatedAt,
  };
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const { data } = await apiClient.get<ApiCoupon[]>("/coupons");
  return data.map(toCoupon);
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const { data } = await apiClient.post<ApiCoupon>("/coupons", input);
  return toCoupon(data);
}

export async function updateCoupon(id: string, input: Partial<CouponInput>): Promise<Coupon> {
  const { data } = await apiClient.patch<ApiCoupon>(`/coupons/${id}`, input);
  return toCoupon(data);
}

export async function deleteCoupon(id: string): Promise<void> {
  await apiClient.delete(`/coupons/${id}`);
}

export { parseApiError };
