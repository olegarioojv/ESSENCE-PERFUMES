"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { SearchIcon, AccountIcon, CartIcon, MenuIcon, CloseIcon } from "@/components/icons/Icons";

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
  gap: ${({ theme }) => theme.spacing.md};
`;

const Side = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  flex: 1;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.06em;
  text-transform: uppercase;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.ink};

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const MenuToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.ink};
  background: transparent;

  svg {
    width: 22px;
    height: 22px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const MobilePanel = styled.nav`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    gap: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;

const MobileNavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.ink};
  padding: ${({ theme }) => theme.spacing.xs} 0;

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const Logo = styled(Link)`
  position: relative;
  display: block;
  width: 190px;
  height: 64px;
  flex-shrink: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const IconLink = styled(Link)`
  position: relative;
  color: ${({ theme }) => theme.colors.ink};
  display: flex;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.gold};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.6rem;
  line-height: 15px;
  text-align: center;
`;

const navItems = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/catalogo" },
  { label: "The Journal", href: "/catalogo" },
  { label: "About Us", href: "/conta" },
];

export default function Header() {
  const totalItems = useCartStore((state) => state.totalItems());
  const fetchCart = useCartStore((state) => state.fetchCart);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated && user) {
      fetchCart().catch(() => {});
    }
  }, [hasHydrated, user, fetchCart]);

  return (
    <Bar>
      <Side>
        <Nav>
          {navItems.map((item) => (
            <NavLink key={item.label} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </Nav>

        <MenuToggle
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </MenuToggle>
      </Side>

      <Logo href="/" aria-label="Essence Perfumes">
        <Image
          src="/logo.png"
          alt="Essence Perfumes"
          fill
          sizes="190px"
          style={{ objectFit: "contain", objectPosition: "center" }}
        />
      </Logo>

      <Actions>
        <IconLink href="/catalogo" aria-label="Buscar">
          <SearchIcon />
        </IconLink>
        <IconLink href="/conta" aria-label="Minha conta">
          <AccountIcon />
        </IconLink>
        <IconLink href="/carrinho" aria-label="Carrinho">
          <CartIcon />
          {totalItems > 0 && <CartCount>{totalItems}</CartCount>}
        </IconLink>
      </Actions>

      {menuOpen && (
        <MobilePanel id="mobile-nav">
          {navItems.map((item) => (
            <MobileNavLink
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </MobileNavLink>
          ))}
        </MobilePanel>
      )}
    </Bar>
  );
}
