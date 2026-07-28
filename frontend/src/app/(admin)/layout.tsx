import type { ReactNode } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminFooterBar from "@/components/admin/AdminFooterBar";
import PageTransition from "@/components/motion/PageTransition";

/**
 * Layout for the "Painel Administrativo" route group: Dashboard, Produtos,
 * Estoque, Pedidos, Clientes, Cupons, Configurações. Scaffolding only — no
 * auth-gating yet (comes with Fase 18 integration / real admin pages).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <PageTransition>{children}</PageTransition>
        <AdminFooterBar />
      </div>
    </div>
  );
}
