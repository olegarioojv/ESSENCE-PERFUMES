import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { productsQuery } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "feminino", label: "Feminino" },
  { key: "masculino", label: "Masculino" },
  { key: "unissex", label: "Unissex" },
] as const;

const SORTS = [
  { key: "featured", label: "Destaques" },
  { key: "price-asc", label: "Menor preço" },
  { key: "price-desc", label: "Maior preço" },
  { key: "rating", label: "Melhor avaliados" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];
type SortKey = (typeof SORTS)[number]["key"];

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Coleção — Essence Perfumes" },
      {
        name: "description",
        content:
          "Descubra a coleção completa de perfumes importados da Essence. Femininos, masculinos e unissex, com curadoria de autor.",
      },
      { property: "og:title", content: "Coleção — Essence Perfumes" },
      {
        property: "og:description",
        content: "Perfumes raros importados, com curadoria de autor.",
      },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
  },
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const shown = useMemo(() => {
    let list = products;
    if (filter !== "all") list = list.filter((p) => p.gender === filter);
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "rating":
        return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return list;
    }
  }, [products, filter, sort]);

  return (
    <div className="pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="eyebrow mb-4">Todas as fragrâncias</p>
          <h1 className="font-display text-5xl leading-tight text-balance md:text-7xl">
            A Coleção <span className="italic gold-gradient-text">Essence</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
            {shown.length} {shown.length === 1 ? "criação" : "criações"} disponíveis.
            Explore por gênero ou preço, ou deixe-se guiar pela curadoria da casa.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col justify-between gap-6 border-y hairline py-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-all",
                  filter === f.key
                    ? "border-gold/60 bg-gold/10 text-gold"
                    : "border-transparent text-foreground/70 hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <label htmlFor="sort" className="hidden md:inline">
              Ordenar
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent border hairline rounded-full px-4 py-2 text-foreground cursor-pointer hover:border-gold/40 transition-colors focus:outline-none focus:border-gold"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key} className="bg-background">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {shown.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 6) * 0.04}>
              <ProductCard product={p} priority={i < 3} />
            </Reveal>
          ))}
        </div>

        {shown.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">
            Nenhuma fragrância nesta seleção.
          </div>
        )}
      </div>
    </div>
  );
}
