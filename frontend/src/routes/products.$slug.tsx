import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Star, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { productQuery, productsQuery } from "@/lib/queries";
import { useUI } from "@/stores/ui";
import { useAuth } from "@/stores/auth";
import { formatPrice, installments } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(productQuery(params.slug));
    context.queryClient.ensureQueryData(productsQuery());
  },
  head: ({ params, loaderData }) => {
    const p = (loaderData as { name?: string; brand?: string } | undefined);
    const title = p?.name
      ? `${p.name} — ${p.brand ?? "Essence Perfumes"}`
      : "Perfume — Essence Perfumes";
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/products/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/products/${params.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: all } = useSuspenseQuery(productsQuery());
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVol, setSelectedVol] = useState(
    product.volumes?.[product.volumes.length - 1] ?? null,
  );
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const price = selectedVol?.price ?? product.price;
  const addLocal = useUI((s) => s.addLocal);
  const isFav = useUI((s) => s.favorites.includes(product.id));
  const toggleFav = useUI((s) => s.toggleFavorite);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const related = all.filter((p) => p.id !== product.id).slice(0, 3);

  function handleAdd() {
    if (!isAuthenticated) {
      toast.error("Entre para adicionar à sacola.");
      navigate({ to: "/login" });
      return;
    }
    addLocal(product.id, 1);
    toast.success(`${product.name} adicionado à sacola`);
  }

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <nav className="mb-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link to="/" className="hover:text-gold">Casa</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-gold">Coleção</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground/80">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface hairline border">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(212,175,55,0.14), transparent 70%)",
                }}
              />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={gallery[activeImg]}
                  alt={`${product.name} — vista ${activeImg + 1}`}
                  loading="eager"
                  width={1024}
                  height={1280}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-sm border transition-all",
                      activeImg === i ? "border-gold" : "hairline hover:border-gold/40",
                    )}
                    aria-label={`Ver imagem ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <p className="eyebrow">{product.brand}</p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-balance md:text-6xl">
                {product.name}
              </h1>
              {typeof product.rating === "number" && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < Math.round(product.rating ?? 0)
                            ? "fill-gold text-gold"
                            : "text-white/20",
                        )}
                      />
                    ))}
                  </div>
                  <span>
                    {product.rating.toFixed(1)} · {product.reviewCount ?? 0} avaliações
                  </span>
                </div>
              )}
            </div>

            <div className="border-y hairline py-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl">{formatPrice(price)}</span>
                {product.compareAtPrice && !selectedVol && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{installments(price)}</p>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty md:text-base">
                {product.description}
              </p>
            )}

            {product.volumes && product.volumes.length > 0 && (
              <div>
                <p className="eyebrow mb-3">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.volumes.map((v) => (
                    <button
                      key={v.ml}
                      onClick={() => setSelectedVol(v)}
                      className={cn(
                        "rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-all",
                        selectedVol?.ml === v.ml
                          ? "border-gold bg-gold/10 text-gold"
                          : "hairline text-foreground/80 hover:border-gold/40",
                      )}
                    >
                      {v.ml}ml · {formatPrice(v.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAdd}
                className="group flex-1 inline-flex items-center justify-center gap-3 rounded-full bg-foreground py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-all hover:bg-champagne hover:shadow-glow"
              >
                <ShoppingBag className="h-4 w-4" />
                Adicionar à sacola
              </button>
              <button
                onClick={() => toggleFav(product.id)}
                aria-label={isFav ? "Remover dos favoritos" : "Favoritar"}
                className={cn(
                  "grid h-[52px] w-[52px] place-items-center rounded-full border transition-all",
                  isFav
                    ? "border-gold bg-gold/10 text-gold"
                    : "hairline text-foreground/80 hover:border-gold/40 hover:text-gold",
                )}
              >
                <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
              </button>
            </div>

            <ul className="grid grid-cols-1 gap-3 pt-4 text-xs text-muted-foreground sm:grid-cols-3">
              {[
                { Icon: Truck, label: "Envio expresso premium" },
                { Icon: ShieldCheck, label: "Autenticidade certificada" },
                { Icon: RotateCcw, label: "30 dias para trocar" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gold/80" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            {product.notes && (
              <div className="border-t hairline pt-8 space-y-6">
                <p className="eyebrow">Pirâmide Olfativa</p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {(["top", "heart", "base"] as const).map((k) => (
                    <div key={k}>
                      <p className="font-display text-xl text-gold">
                        {k === "top" ? "Saída" : k === "heart" ? "Coração" : "Fundo"}
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
                        {product.notes![k].map((n) => (
                          <li key={n}>· {n}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FAQ />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-32">
            <Reveal>
              <p className="eyebrow mb-4">Também poderia gostar</p>
              <h2 className="font-display text-3xl md:text-4xl mb-12">
                Composições relacionadas
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "Como é embalado e enviado?",
    a: "Cada frasco é envolto em papel de seda, acomodado em caixa Essence com lacre em cera. O envio é assegurado com rastreamento em tempo real.",
  },
  {
    q: "Os perfumes são autênticos?",
    a: "Sim. Trabalhamos apenas com distribuidores oficiais e maisons independentes. Cada peça acompanha certificado de autenticidade.",
  },
  {
    q: "Posso trocar se não gostar?",
    a: "Você tem 30 dias corridos após a entrega para solicitar a troca. Amostras acompanham todos os pedidos para uma decisão sem riscos.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t hairline pt-8">
      <p className="eyebrow mb-4">Perguntas Frequentes</p>
      <div className="divide-y hairline border-y hairline">
        {FAQ_ITEMS.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left"
              aria-expanded={open === i}
            >
              <span className="text-sm text-foreground">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  open === i && "rotate-180 text-gold",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
