import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/motion/PageTransition";

/**
 * Layout for the storefront ("Loja") route group: Home, Catálogo, Produto,
 * Carrinho, Checkout, Login, Minha Conta. Scaffolding only — Header/Footer
 * are minimal placeholders.
 */
export default function LojaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
