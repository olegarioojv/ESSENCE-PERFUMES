"use client";

import Link from "next/link";
import styled from "styled-components";

const Aside = styled.aside`
  width: 240px;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.surfaceAlt};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.p`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.goldLight};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavLink = styled(Link)`
  color: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/produtos", label: "Produtos" },
  { href: "/estoque", label: "Estoque" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/cupons", label: "Cupons" },
  { href: "/configuracoes", label: "Configurações" },
];

/**
 * Minimal admin sidebar — scaffolding only. Real auth-gating, active-link
 * highlighting, icons, etc. come with the actual Painel Administrativo
 * pages.
 */
export default function AdminSidebar() {
  return (
    <Aside>
      <Title>Essence Admin</Title>
      <NavList>
        {links.map((link) => (
          <NavLink key={link.href} href={link.href}>
            {link.label}
          </NavLink>
        ))}
      </NavList>
    </Aside>
  );
}
