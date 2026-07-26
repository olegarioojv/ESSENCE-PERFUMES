"use client";

import Link from "next/link";
import styled from "styled-components";

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.header};
`;

const Logo = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.black};
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.ink};

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

/**
 * Minimal storefront header — scaffolding only. Real navigation, search,
 * cart badge, auth state, etc. come with the actual Loja pages.
 */
export default function Header() {
  return (
    <Bar>
      <Logo href="/">Essence Perfumes</Logo>
      <Nav>
        <NavLink href="/catalogo">Catálogo</NavLink>
        <NavLink href="/carrinho">Carrinho</NavLink>
        <NavLink href="/conta">Minha Conta</NavLink>
        <NavLink href="/login">Entrar</NavLink>
      </Nav>
    </Bar>
  );
}
