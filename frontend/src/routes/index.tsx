import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Sparkles, Award } from "lucide-react";
import { useRef } from "react";
import heroBottle from "@/assets/hero-bottle.jpg";
import { productsQuery } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Essence Perfumes — Fragrâncias raras importadas" },
      {
        name: "description",
        content:
          "Descubra a coleção Essence: perfumes de alta costura, edições limitadas e amostras exclusivas.",
      },
      { property: "og:title", content: "Essence Perfumes — Fragrâncias raras importadas" },
      {
        property: "og:description",
        content: "Perfumaria de alta costura. Curadoria, autenticidade e discrição.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
  },
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Featured />
      <Story />
    </>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative min-h-dvh overflow-hidden pt-24"
      aria-label="Destaque"
    >
      {/* Ambient gold aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 700px at 70% 30%, rgba(212,175,55,0.16), transparent 60%), radial-gradient(600px 500px at 20% 80%, rgba(232,215,179,0.06), transparent 60%)",
        }}
      />
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
          style={{ opacity: reduce ? 1 : opacity }}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold/60" />
            <p className="eyebrow">Nova Coleção · Outono 2026</p>
          </div>

          <h1 className="font-display text-5xl leading-[0.95] text-balance sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            A arte de <span className="gold-gradient-text italic">envolver</span><br />
            em uma fragrância.
          </h1>

          <p className="max-w-lg text-base text-muted-foreground leading-relaxed text-pretty md:text-lg">
            Uma seleção discreta de perfumes de autor, importados diretamente de
            maisons independentes. Cada frasco é uma assinatura — nunca uma
            reprodução.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-all hover:bg-champagne hover:shadow-glow"
            >
              Comprar agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#colecao"
              className="inline-flex items-center gap-3 rounded-full border border-white/15 px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-foreground transition-all hover:border-gold/50 hover:text-gold"
            >
              Explorar coleção
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-10 md:grid-cols-4 md:gap-4">
            {[
              { Icon: ShieldCheck, label: "100% Autêntico" },
              { Icon: Truck, label: "Envio expresso" },
              { Icon: Sparkles, label: "Amostras exclusivas" },
              { Icon: Award, label: "Curadoria assinada" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-4 w-4 text-gold/80" />
                <span className="tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative"
          style={{ y: reduce ? 0 : y }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square w-full max-w-[620px] mx-auto"
          >
            {/* Glow behind */}
            <div
              aria-hidden
              className="absolute inset-8 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(212,175,55,0.35), transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <motion.img
              src={heroBottle}
              alt="Frasco Elysian Noir — perfume de assinatura"
              width={1600}
              height={1600}
              fetchPriority="high"
              className="relative z-10 h-full w-full object-contain drop-shadow-[0_60px_60px_rgba(0,0,0,0.6)]"
              animate={
                reduce
                  ? undefined
                  : { y: [0, -14, 0] }
              }
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Signature ring */}
            <motion.div
              aria-hidden
              className="absolute inset-6 rounded-full border border-gold/25"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          <div className="absolute left-4 bottom-4 lg:left-0 lg:bottom-0 max-w-[240px] rounded-md border hairline bg-surface/70 backdrop-blur-md px-4 py-3">
            <p className="eyebrow">Signature</p>
            <p className="mt-1 font-display text-lg leading-tight">Elysian Noir</p>
            <p className="text-xs text-muted-foreground">Oud · Rosa · Baunilha</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Featured() {
  const { data: products } = useSuspenseQuery(productsQuery());

  return (
    <section id="colecao" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">A Coleção</p>
            <h2 className="font-display text-4xl leading-tight text-balance md:text-6xl">
              Fragrâncias selecionadas, <span className="italic gold-gradient-text">uma a uma</span>.
            </h2>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-foreground/80 hover:text-gold transition-colors"
          >
            Ver todas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {products.slice(0, 6).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="relative py-24 lg:py-32 border-t hairline">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <Reveal>
          <p className="eyebrow mb-6">A Casa</p>
          <p className="font-display text-3xl leading-[1.25] text-balance md:text-5xl">
            <span className="text-muted-foreground italic">"Um perfume não se usa —</span>{" "}
            se <span className="gold-gradient-text italic">habita</span>.
            <span className="text-muted-foreground italic">"</span>
          </p>
          <p className="mt-8 mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed">
            Fundada por colecionadores de fragrâncias raras, a Essence trabalha
            diretamente com maisons independentes ao redor do mundo — de Grasse a
            Tóquio — para trazer composições que dificilmente encontrariam seu
            caminho até aqui.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
