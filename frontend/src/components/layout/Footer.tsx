import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube, Facebook, Mail, ShieldCheck, Truck, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t hairline bg-surface">
      {/* Trust row */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-10 md:grid-cols-3 lg:px-10">
        {[
          { icon: Truck, title: "Envio Premium", sub: "Embalagem assinada • Entrega expressa" },
          { icon: ShieldCheck, title: "100% Autêntico", sub: "Importadores certificados" },
          { icon: Sparkles, title: "Amostras exclusivas", sub: "Em toda compra acima de R$ 800" },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border hairline text-gold">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{title}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t hairline">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <div className="col-span-1 md:col-span-2 max-w-sm">
            <div className="font-display text-2xl tracking-[0.18em] uppercase">Essence</div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Uma casa de perfumaria dedicada às fragrâncias mais raras do mundo.
              Selecionamos, importamos e entregamos com discrição absoluta.
            </p>
            <form
              className="mt-8 flex items-center gap-2 border-b hairline pb-3 focus-within:border-gold/60 transition-colors"
              onSubmit={(e) => e.preventDefault()}
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="Seu email para novidades e edições limitadas"
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 outline-none"
                aria-label="Email para newsletter"
              />
              <button
                type="submit"
                className="text-[11px] uppercase tracking-[0.28em] text-gold hover:text-champagne transition-colors"
              >
                Inscrever
              </button>
            </form>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Casa</h3>
            <ul className="space-y-3 text-sm text-foreground/80">
              <li><Link to="/products" className="hover:text-gold transition-colors">Coleção completa</Link></li>
              <li><Link to="/" className="hover:text-gold transition-colors">Edições limitadas</Link></li>
              <li><Link to="/" className="hover:text-gold transition-colors">Presentes</Link></li>
              <li><Link to="/" className="hover:text-gold transition-colors">Cartão presente</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Ajuda</h3>
            <ul className="space-y-3 text-sm text-foreground/80">
              <li><Link to="/account" className="hover:text-gold transition-colors">Meus pedidos</Link></li>
              <li><a href="mailto:contato@essence.com" className="hover:text-gold transition-colors">Contato</a></li>
              <li><Link to="/" className="hover:text-gold transition-colors">Trocas e devoluções</Link></li>
              <li><Link to="/" className="hover:text-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t hairline">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-start gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Essence Perfumes. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-foreground/70">
            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social" className="hover:text-gold transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
