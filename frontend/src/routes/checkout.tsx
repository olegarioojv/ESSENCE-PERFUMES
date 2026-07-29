import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, ChevronRight, CreditCard, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { useUI } from "@/stores/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Essence Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
  },
  component: CheckoutPage,
});

const STEPS = ["Entrega", "Pagamento", "Confirmação"] as const;

function CheckoutPage() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const localCart = useUI((s) => s.localCart);
  const clearCart = useUI((s) => s.clearLocalCart);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login", search: { next: "/checkout" } as never });
  }, [isAuthenticated, navigate]);

  const items = Object.entries(localCart)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      return product ? { product, quantity: qty } : null;
    })
    .filter((x): x is { product: (typeof products)[number]; quantity: number } => Boolean(x));

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal > 800 || subtotal === 0 ? 0 : 39.9;
  const total = subtotal + shipping;

  function next() {
    setStep((s) => Math.min(s + 1, 2));
  }

  function complete() {
    // Real: POST /orders/checkout via api()
    toast.success("Pedido realizado. Um perfume espera por você.");
    clearCart();
    setStep(2);
  }

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="mb-12">
          <p className="eyebrow mb-3">Finalizar pedido</p>
          <h1 className="font-display text-4xl md:text-6xl">Checkout</h1>
        </div>

        <ol className="mb-14 grid grid-cols-3 gap-2">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 border-t-2 pt-4 transition-colors",
                i <= step ? "border-gold" : "border-white/10",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs transition-all",
                  i < step
                    ? "bg-gold text-background"
                    : i === step
                      ? "border border-gold text-gold"
                      : "border hairline text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] uppercase tracking-[0.24em]",
                  i <= step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="border hairline rounded-md p-8 bg-surface"
            >
              {step === 0 && <StepDelivery onNext={next} />}
              {step === 1 && <StepPayment onNext={complete} />}
              {step === 2 && <StepConfirmation />}
            </motion.div>
          </AnimatePresence>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border hairline rounded-md p-6 bg-surface">
              <p className="eyebrow mb-6">Seu pedido</p>
              <ul className="space-y-4">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-background/60">
                      <img src={product.image} alt="" className="h-full w-full object-cover" />
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] text-background">
                        {quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{product.name}</p>
                      <p className="text-[11px] text-muted-foreground">{product.brand}</p>
                    </div>
                    <span className="text-sm tabular-nums">{formatPrice(product.price * quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-2 border-t hairline pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt><dd className="text-foreground tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Envio</dt><dd className="text-foreground tabular-nums">{shipping === 0 ? "Grátis" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t hairline pt-3">
                  <dt>Total</dt><dd className="font-display text-xl tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input
        {...rest}
        className="w-full bg-transparent border-b hairline py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none transition-colors"
      />
    </label>
  );
}

function StepDelivery({ onNext }: { onNext: () => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onNext(); }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gold" />
        <h2 className="font-display text-2xl">Endereço de entrega</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nome completo" required autoComplete="name" />
        <Field label="Telefone" required autoComplete="tel" />
        <Field label="CEP" required inputMode="numeric" />
        <Field label="Cidade" required />
        <Field label="Endereço" required className="sm:col-span-2" />
        <Field label="Número" required />
        <Field label="Complemento" />
        <Field label="Bairro" required />
        <Field label="Estado" required />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-champagne transition-colors"
      >
        Continuar para pagamento
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function StepPayment({ onNext }: { onNext: () => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onNext(); }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-gold" />
        <h2 className="font-display text-2xl">Pagamento</h2>
      </div>
      <Field label="Nome no cartão" required autoComplete="cc-name" />
      <Field label="Número do cartão" required inputMode="numeric" autoComplete="cc-number" placeholder="•••• •••• •••• ••••" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Validade" required placeholder="MM/AA" autoComplete="cc-exp" />
        <Field label="CVV" required inputMode="numeric" autoComplete="cc-csc" placeholder="•••" />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-champagne hover:shadow-glow transition-all"
      >
        Confirmar pedido
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function StepConfirmation() {
  return (
    <div className="text-center py-6">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="mt-6 font-display text-3xl">Pedido confirmado</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Enviamos uma confirmação por email. Sua fragrância será preparada com discrição.
      </p>
    </div>
  );
}
