import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Essence Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo à Essence.");
      navigate({ to: "/account" });
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 0
          ? "Servidor indisponível — tente novamente em instantes."
          : err instanceof Error
            ? err.message
            : "Não foi possível entrar.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 lg:grid-cols-2 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <p className="eyebrow mb-4">Casa Essence</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight text-balance">
            Bem-vindo <span className="italic gold-gradient-text">de volta</span>.
          </h1>
          <p className="mt-6 max-w-md text-sm text-muted-foreground leading-relaxed">
            Entre para acompanhar seus pedidos, gerenciar seus endereços e
            acessar edições reservadas aos membros da casa.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={onSubmit}
          className="border hairline rounded-md bg-surface p-8 space-y-6"
        >
          <label className="block">
            <span className="eyebrow mb-2 block">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b hairline py-2 text-foreground focus:border-gold focus:outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </label>
          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">Senha</span>
              <a href="#" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold">
                Esqueci
              </a>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b hairline py-2 text-foreground focus:border-gold focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-foreground py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-all hover:bg-champagne hover:shadow-glow disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/login" className="text-gold hover:text-champagne">
              Cadastre-se
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
