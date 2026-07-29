import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatPrice, installments } from "@/lib/format";
import { useUI } from "@/stores/ui";
import type { Product } from "@/lib/types";

const BADGE_LABEL: Record<string, string> = {
  new: "Novo",
  bestseller: "Bestseller",
  sale: "Oferta",
  limited: "Edição Limitada",
};

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const isFav = useUI((s) => s.favorites.includes(product.id));
  const toggleFav = useUI((s) => s.toggleFavorite);

  return (
    <motion.article
      whileHover="hover"
      initial="rest"
      animate="rest"
      className="group relative"
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={`${product.brand} — ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface hairline border">
          {/* Ambient gold on hover */}
          <motion.div
            aria-hidden
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(500px 400px at 50% 60%, rgba(212,175,55,0.18), transparent 60%)",
            }}
          />
          <motion.img
            src={product.image}
            alt={`${product.name} por ${product.brand}`}
            loading={priority ? "eager" : "lazy"}
            width={1024}
            height={1280}
            variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 h-full w-full object-cover"
          />

          {/* Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className={cn(
                    "px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] backdrop-blur-md rounded-full border",
                    b === "sale"
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : b === "limited"
                        ? "border-champagne/40 bg-black/40 text-champagne"
                        : "border-white/15 bg-black/40 text-foreground",
                  )}
                >
                  {BADGE_LABEL[b]}
                </span>
              ))}
            </div>
          )}

          {/* Fav button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFav(product.id);
            }}
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className={cn(
              "absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all",
              isFav
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-white/10 bg-black/40 text-foreground/80 hover:text-gold hover:border-gold/40",
            )}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
          </button>

          {/* Add-to-bag reveal */}
          <motion.div
            variants={{
              rest: { y: 20, opacity: 0 },
              hover: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-4 bottom-4 z-20"
          >
            <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-background/80 py-3 text-[11px] uppercase tracking-[0.28em] text-foreground backdrop-blur-md">
              <ShoppingBag className="h-3.5 w-3.5" />
              Ver detalhes
            </div>
          </motion.div>
        </div>

        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow truncate">{product.brand}</p>
            {typeof product.rating === "number" && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h3 className="font-display text-xl leading-tight text-foreground text-balance">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-medium">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{installments(product.price)}</p>
        </div>
      </Link>
    </motion.article>
  );
}
