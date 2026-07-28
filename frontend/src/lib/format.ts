/**
 * pt-BR formatting helpers for the Painel Administrativo. Kept separate from
 * `lib/cart.ts`, which is Loja-scoped (en-US copy, `$` formatting) — the
 * admin panel is pt-BR/`R$` throughout.
 */

export function formatPriceBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDateBR(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
}
