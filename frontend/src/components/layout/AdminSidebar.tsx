"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import {
  BoxIcon,
  GearIcon,
  GridIcon,
  HelpCircleIcon,
  PackageIcon,
  ReceiptIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons/Icons";
import { mockUser } from "@/lib/data/mockProducts";

const Aside = styled.aside`
  width: 240px;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.surfaceAlt};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
`;

const Title = styled.p`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.goldLight};
  letter-spacing: 0.04em;
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme, $active }) => ($active ? theme.colors.black : theme.colors.surfaceAlt)};
  background: ${({ theme, $active }) => ($active ? theme.colors.gold : "transparent")};

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &:hover {
    color: ${({ theme, $active }) => ($active ? theme.colors.black : theme.colors.gold)};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const HelpCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(255, 255, 255, 0.06);
  margin: ${({ theme }) => theme.spacing.lg} 0;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.goldLight};
    flex-shrink: 0;
  }
`;

const HelpTitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`;

const HelpSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const UserFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.gold};
  color: ${({ theme }) => theme.colors.black};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  flex-shrink: 0;
`;

const UserName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`;

const UserRole = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const links = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon },
  { href: "/produtos", label: "Produtos", icon: PackageIcon },
  { href: "/estoque", label: "Estoque", icon: BoxIcon },
  { href: "/pedidos", label: "Pedidos", icon: ReceiptIcon },
  { href: "/clientes", label: "Clientes", icon: UsersIcon },
  { href: "/cupons", label: "Cupons", icon: TagIcon },
  { href: "/configuracoes", label: "Configurações", icon: GearIcon },
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Aside>
      <Title>Essence Admin</Title>
      <NavList>
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname?.startsWith(link.href) ?? false;
          return (
            <NavLink key={link.href} href={link.href} $active={active}>
              <Icon />
              {link.label}
            </NavLink>
          );
        })}
      </NavList>
      <Spacer />
      <HelpCard>
        <HelpCircleIcon />
        <div>
          <HelpTitle>Precisa de ajuda?</HelpTitle>
          <HelpSubtitle>Fale com o suporte</HelpSubtitle>
        </div>
      </HelpCard>
      <UserFooter>
        <Avatar>{initials(mockUser.name)}</Avatar>
        <div>
          <UserName>{mockUser.name}</UserName>
          <UserRole>Administrador</UserRole>
        </div>
      </UserFooter>
    </Aside>
  );
}
