import type { CartItem } from "@/lib/store/useCartStore";

export const FREE_SHIPPING_THRESHOLD = 299;
export const STANDARD_SHIPPING = 19.9;

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function shippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING;
}

export function amountToFreeShipping(subtotal: number): number {
  return Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
