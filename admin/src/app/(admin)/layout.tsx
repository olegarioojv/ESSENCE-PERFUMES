"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminFooterBar from "@/components/admin/AdminFooterBar";
import PageTransition from "@/components/motion/PageTransition";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * Layout for the "Painel Administrativo" route group: Dashboard, Produtos,
 * Estoque, Pedidos, Clientes, Cupons, Configurações. Requires a logged-in
 * user with role "admin" — redirects to /login otherwise.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [user, hasHydrated, router]);

  if (!checked) return null;

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
