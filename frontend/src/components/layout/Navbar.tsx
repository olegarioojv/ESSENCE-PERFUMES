import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/stores/auth";
import { useUI } from "@/stores/ui";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/products", label: "Coleção" },
  { to: "/products", label: "Feminino", search: { gender: "feminino" } },
  { to: "/products", label: "Masculino", search: { gender: "masculino" } },
  { to: "/products", label: "Unissex", search: { gender: "unissex" } },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const { isAuthenticated } = useAuth();
  const localCart = useUI((s) => s.localCart);
  const favorites = useUI((s) => s.favorites);
  const cartCount = Object.values(localCart).reduce((a, b) => a + b, 0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-500",
        transparent
          ? "bg-transparent border-b border-transparent"
          : "bg-background/70 backdrop-blur-xl border-b hairline",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20 lg:px-10">
        <button
          type="button"
          className="lg:hidden text-foreground/80 hover:text-foreground"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          to="/"
          className="group relative select-none"
          aria-label="Essence Perfumes — Home"
        >
          <span className="font-display text-2xl tracking-[0.18em] uppercase">
            Essence
          </span>
          <span className="ml-2 text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
            Perfumes
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-[13px] uppercase tracking-[0.22em] text-foreground/80 hover:text-foreground transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <Link
            to="/account"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Favoritos"
          >
            <Heart className="h-4.5 w-4.5" />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-background">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Sacola"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-background">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => navigate({ to: isAuthenticated ? "/account" : "/login" })}
            className="inline-flex h-10 items-center gap-2 rounded-full border hairline px-3 text-[12px] uppercase tracking-[0.22em] text-foreground/80 hover:text-foreground hover:border-gold/40 transition-colors md:px-4"
            aria-label={isAuthenticated ? "Minha conta" : "Entrar"}
          >
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{isAuthenticated ? "Conta" : "Entrar"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-6 h-16">
              <span className="font-display text-2xl tracking-[0.18em] uppercase">Essence</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-6 py-8 gap-6">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-3xl tracking-tight"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
