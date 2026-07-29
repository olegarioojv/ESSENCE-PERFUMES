import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { productsQuery } from "@/lib/queries";
import { useUI } from "@/stores/ui";
import { useAuth } from "@/stores/auth";
import { formatPrice, installments } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Sacola — Essence Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
  },
  component: CartPage,
});

function CartPage() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const localCart = useUI((s) => s.localCart);
  const setQty = useUI((s) => s.setLocalQty);
  const removeLocal = useUI((s) => s.removeLocal);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const items = Object.entries(localCart)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      return product ? { product, quantity: qty } : null;
    })
    .filter((x): x is { product: (typeof products)[number]; quantity: number } => Boolean(x));

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal > 800 || subtotal === 0 ? 0 : 39.9;
  const total = subtotal + shipping;

  useEffect(() => {
    // Gate handled at checkout, but message here
  }, []);

  function goToCheckout() {
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { next: "/checkout" } as never });
      return;
    }
    navigate({ to: "/checkout" });
  }

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12">
          <p className="eyebrow mb-3">Sua sacola</p>
          <h1 className="font-display text-4xl md:text-6xl">
            {items.length === 0 ? "Sacola vazia" : `${items.length} ${items.length === 1 ? "item" : "itens"}`}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="border hairline rounded-md p-16 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma fragrância selecionada ainda.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-champagne transition-colors"
            >
              Explorar a coleção
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <ul className="divide-y hairline border-y hairline">
              <AnimatePresence initial={false}>
                {items.map(({ product, quantity }) => (
                  <motion.li
                    key={product.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-5 py-6">
                      <Link
                        to="/products/$slug"
                        params={{ slug: product.slug }}
                        className="relative h-32 w-24 shrink-0 overflow-hidden rounded-sm bg-surface"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="eyebrow truncate">{product.brand}</p>
                              <Link
                                to="/products/$slug"
                                params={{ slug: product.slug }}
                                className="mt-1 block font-display text-xl truncate hover:text-gold transition-colors"
                              >
                                {product.name}
                              </Link>
                              {product.size && (
                                <p className="mt-1 text-xs text-muted-foreground">{product.size}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeLocal(product.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="inline-flex items-center rounded-full border hairline">
                            <button
                              onClick={() => setQty(product.id, quantity - 1)}
                              className="grid h-9 w-9 place-items-center text-foreground/80 hover:text-gold transition-colors"
                              aria-label="Diminuir"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
                            <button
                              onClick={() => setQty(product.id, quantity + 1)}
                              className="grid h-9 w-9 place-items-center text-foreground/80 hover:text-gold transition-colors"
                              aria-label="Aumentar"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-lg">
                              {formatPrice(product.price * quantity)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {installments(product.price * quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border hairline rounded-md p-8 bg-surface">
                <p className="eyebrow mb-6">Resumo</p>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-foreground">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Envio</dt>
                    <dd className="tabular-nums text-foreground">
                      {shipping === 0 ? "Grátis" : formatPrice(shipping)}
                    </dd>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] text-gold/80">
                      Faltam {formatPrice(800 - subtotal)} para envio grátis.
                    </p>
                  )}
                  <div className="border-t hairline pt-4 flex items-baseline justify-between">
                    <dt className="text-foreground">Total</dt>
                    <dd className="font-display text-2xl tabular-nums">{formatPrice(total)}</dd>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{installments(total)}</p>
                </dl>
                <button
                  onClick={goToCheckout}
                  className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-full bg-foreground py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-champagne hover:shadow-glow transition-all"
                >
                  {isAuthenticated ? "Finalizar compra" : "Entrar e finalizar"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/products"
                  className="mt-3 block text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground hover:text-gold transition-colors"
                >
                  Continuar comprando
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
