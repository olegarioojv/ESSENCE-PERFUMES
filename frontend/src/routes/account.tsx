import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Package, Heart, MapPin, Ticket, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { useUI } from "@/stores/ui";
import { productsQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "orders", label: "Pedidos", Icon: Package },
  { key: "favorites", label: "Favoritos", Icon: Heart },
  { key: "addresses", label: "Endereços", Icon: MapPin },
  { key: "coupons", label: "Cupons", Icon: Ticket },
  { key: "profile", label: "Perfil", Icon: UserIcon },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Minha Conta — Essence Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
  },
  component: AccountPage,
});

function AccountPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("orders");

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12">
          <p className="eyebrow mb-3">Minha conta</p>
          <h1 className="font-display text-4xl md:text-6xl">
            Olá, <span className="italic gold-gradient-text">{user?.name ?? user?.email?.split("@")[0] ?? "membro"}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          <aside>
            <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-all shrink-0 whitespace-nowrap",
                    tab === key
                      ? "bg-surface text-foreground border hairline"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
              <button
                onClick={() => { logout(); navigate({ to: "/" }); }}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors shrink-0 whitespace-nowrap"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </nav>
          </aside>

          <div className="min-w-0">
            {tab === "orders" && <OrdersPanel />}
            {tab === "favorites" && <FavoritesPanel />}
            {tab === "addresses" && <AddressesPanel />}
            {tab === "coupons" && <CouponsPanel />}
            {tab === "profile" && <ProfilePanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function OrdersPanel() {
  const MOCK_ORDERS = [
    { id: "ES-24019", date: "12 Nov 2026", status: "Entregue", total: 1290, items: 1 },
    { id: "ES-24014", date: "03 Nov 2026", status: "Em trânsito", total: 2570, items: 2 },
    { id: "ES-24011", date: "27 Out 2026", status: "Confirmado", total: 890, items: 1 },
  ];
  return (
    <Panel title="Pedidos" subtitle="Acompanhe suas compras recentes.">
      <ul className="divide-y hairline border-y hairline">
        {MOCK_ORDERS.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <p className="font-display text-lg">{o.id}</p>
              <p className="text-xs text-muted-foreground">{o.date} · {o.items} {o.items === 1 ? "item" : "itens"}</p>
            </div>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-gold">
              {o.status}
            </span>
            <div className="text-right">
              <p className="font-display text-xl tabular-nums">{formatPrice(o.total)}</p>
              <button className="mt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground hover:text-gold transition-colors">
                Detalhes
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function FavoritesPanel() {
  const favorites = useUI((s) => s.favorites);
  const { data: products } = useSuspenseQuery(productsQuery());
  const items = products.filter((p) => favorites.includes(p.id));

  return (
    <Panel title="Favoritos" subtitle={items.length === 0 ? "Você ainda não favoritou nenhum perfume." : `${items.length} ${items.length === 1 ? "peça salva" : "peças salvas"}.`}>
      {items.length === 0 ? (
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border hairline px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-foreground hover:border-gold/40 hover:text-gold transition-colors"
        >
          Explorar coleção
        </Link>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </Panel>
  );
}

function AddressesPanel() {
  return (
    <Panel title="Endereços" subtitle="Salve endereços para checkouts mais rápidos.">
      <div className="border hairline rounded-md p-6 bg-surface">
        <p className="eyebrow">Principal</p>
        <p className="mt-2 font-display text-lg">Residência</p>
        <p className="text-sm text-muted-foreground mt-1">Rua Oscar Freire, 725 · Jardins</p>
        <p className="text-sm text-muted-foreground">São Paulo · SP · 01426-001</p>
      </div>
      <button className="mt-6 inline-flex items-center gap-2 rounded-full border hairline px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] hover:border-gold/40 hover:text-gold transition-colors">
        + Adicionar endereço
      </button>
    </Panel>
  );
}

function CouponsPanel() {
  return (
    <Panel title="Cupons" subtitle="Códigos ativos e recompensas.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[{ code: "MEMBRO10", desc: "10% em qualquer compra" }, { code: "AMOSTRAX3", desc: "Três amostras adicionais grátis" }].map((c) => (
          <div key={c.code} className="border hairline rounded-md p-6 bg-surface">
            <p className="eyebrow text-gold">{c.code}</p>
            <p className="mt-2 text-sm text-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ProfilePanel() {
  const { user } = useAuth();
  return (
    <Panel title="Perfil" subtitle="Suas informações pessoais.">
      <dl className="divide-y hairline border-y hairline">
        {[
          { l: "Email", v: user?.email ?? "—" },
          { l: "Nome", v: user?.name ?? "—" },
        ].map(({ l, v }) => (
          <div key={l} className="flex items-center justify-between py-5">
            <dt className="eyebrow">{l}</dt>
            <dd className="text-sm text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
