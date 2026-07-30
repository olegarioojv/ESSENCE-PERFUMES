import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Essence Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

const TABS = [
  { key: "login", label: "Entrar" },
  { key: "register", label: "Cadastrar" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function LoginPage() {
  const [tab, setTab] = useState<TabKey>("login");

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
            {tab === "login" ? (
              <>Bem-vindo <span className="italic gold-gradient-text">de volta</span>.</>
            ) : (
              <>Junte-se <span className="italic gold-gradient-text">à casa</span>.</>
            )}
          </h1>
          <p className="mt-6 max-w-md text-sm text-muted-foreground leading-relaxed">
            {tab === "login"
              ? "Entre para acompanhar seus pedidos, gerenciar seus endereços e acessar edições reservadas aos membros da casa."
              : "Crie sua conta para acompanhar pedidos, salvar favoritos e ter acesso a edições reservadas aos membros da casa."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="border hairline rounded-md bg-surface p-8"
        >
          <div className="mb-8 flex gap-1 border-b hairline">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "flex-1 pb-4 text-[11px] uppercase tracking-[0.28em] transition-colors",
                  tab === key
                    ? "text-foreground border-b border-gold -mb-px"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </motion.div>
      </div>
    </div>
  );
}

function LoginForm() {
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
    <form onSubmit={onSubmit} className="space-y-6">
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
    </form>
  );
}

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Conta criada. Bem-vindo à Essence.");
      navigate({ to: "/account" });
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 0
          ? "Servidor indisponível — tente novamente em instantes."
          : err instanceof Error
            ? err.message
            : "Não foi possível criar sua conta.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block">
        <span className="eyebrow mb-2 block">Nome</span>
        <input
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b hairline py-2 text-foreground focus:border-gold focus:outline-none transition-colors"
          placeholder="Seu nome completo"
        />
      </label>
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
        <span className="eyebrow mb-2 block">Senha</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
          title="Mínimo de 8 caracteres, com ao menos uma letra e um número"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border-b hairline py-2 text-foreground focus:border-gold focus:outline-none transition-colors"
          placeholder="••••••••"
        />
        <span className="mt-2 block text-[10px] text-muted-foreground">
          Mínimo de 8 caracteres, com ao menos uma letra e um número.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-foreground py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-all hover:bg-champagne hover:shadow-glow disabled:opacity-60"
      >
        {loading ? "Criando conta…" : "Criar conta"}
      </button>
    </form>
  );
}
