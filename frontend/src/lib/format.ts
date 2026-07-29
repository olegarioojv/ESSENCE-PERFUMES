export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPrice(v: number): string {
  return brl.format(v);
}

export function installments(v: number, n = 10): string {
  return `${n}x de ${brl.format(v / n)} sem juros`;
}
