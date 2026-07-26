"use client";

import { useCartStore } from "@/lib/store/useCartStore";

/**
 * Placeholder Carrinho page. Reads from the real useCartStore (Zustand) to
 * prove the store works end-to-end, even though there's no UI yet to add
 * items to it.
 */
export default function CarrinhoPage() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <section style={{ padding: "3rem 2rem" }}>
      <h1>Carrinho (em construção)</h1>
      <p>Itens no carrinho: {totalItems}</p>
      {items.length === 0 && <p>Seu carrinho está vazio.</p>}
    </section>
  );
}
