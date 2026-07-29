"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { SearchIcon, AccountIcon, CartIcon, MenuIcon, CloseIcon } from "@/components/icons/Icons";

/** Exported so pages with a dark hero (currently just Home) can add matching
 * top padding — the navbar overlaps them via a negative margin instead of
 * taking up layout space, so its height has to be compensated somewhere. */
export const HEADER_HEIGHT = 84;

const Bar = styled.header<{ $solid: boolean; $overlap: boolean }>`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.header};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ $overlap }) => ($overlap ? `-${HEADER_HEIGHT}px` : "0")};
  background: ${({ $solid }) => ($solid ? "rgba(7, 7, 7, 0.78)" : "transparent")};
  backdrop-filter: ${({ $solid }) => ($solid ? "blur(16px) saturate(140%)" : "none")};
  -webkit-backdrop-filter: ${({ $solid }) => ($solid ? "blur(16px) saturate(140%)" : "none")};
  border-bottom: 1px solid
    ${({ $solid, theme }) => ($solid ? theme.colors.luxe.border : "transparent")};
  box-shadow: ${({ $solid }) => ($solid ? "0 8px 30px rgba(0, 0, 0, 0.35)" : "none")};
  transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease,
    border-color 0.4s ease;
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
  position: relative;
  color: ${({ theme }) => theme.colors.luxe.text};
  padding-bottom: 4px;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    right: 50%;
    bottom: 0;
    height: 1px;
    background: ${({ theme }) => theme.colors.luxe.gold};
    transition: left 0.25s ease, right 0.25s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.luxe.gold};
  }

  &:hover::after {
    left: 0;
    right: 0;
  }
`;

const MenuToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.luxe.text};
  background: transparent;

  svg {
    width: 22px;
    height: 22px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const MobilePanel = styled(motion.nav)`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(7, 7, 7, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.luxe.border};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    gap: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    letter-spacing: 0.06em;
    text-transform: uppercase;
    overflow: hidden;
  }
`;

const MobileNavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.luxe.text};
  padding: ${({ theme }) => theme.spacing.xs} 0;

  &:hover {
    color: ${({ theme }) => theme.colors.luxe.gold};
  }
`;

const Logo = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
`;

const LogoMark = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.colors.luxe.text};
`;

const LogoSub = styled.span`
  font-size: 0.55rem;
  letter-spacing: 0.35em;
  color: ${({ theme }) => theme.colors.luxe.gold};
  margin-top: 2px;
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
  color: ${({ theme }) => theme.colors.luxe.text};
  display: flex;
  transition: color 0.2s ease, transform 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.luxe.gold};
    transform: translateY(-1px);
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
  background: ${({ theme }) => theme.colors.luxe.gold};
  color: #070707;
  font-size: 0.6rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
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
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = useCartStore((state) => state.totalItems());
  const fetchCart = useCartStore((state) => state.fetchCart);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && user) {
      fetchCart().catch(() => {});
    }
  }, [hasHydrated, user, fetchCart]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    setScrolled(window.scrollY > 16);
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <Bar $solid={scrolled} $overlap={isHome}>
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
        <LogoMark>ESSENCE</LogoMark>
        <LogoSub>PERFUMES</LogoSub>
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

      <AnimatePresence>
        {menuOpen && (
          <MobilePanel
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
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
      </AnimatePresence>
    </Bar>
  );
}
