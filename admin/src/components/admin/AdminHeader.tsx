"use client";

import { useState } from "react";
import styled from "styled-components";
import { BellIcon, ChevronDownIcon } from "@/components/icons/Icons";

const Bar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin: 0 0 ${({ theme }) => theme.spacing.xxs} 0;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BellButton = styled.button`
  position: relative;
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  display: flex;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AccountMenu = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.ink};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default function AdminHeader({
  title,
  subtitle,
  notificationCount = 3,
}: {
  title: string;
  subtitle: string;
  notificationCount?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Bar>
      <div>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </div>
      <Actions>
        <BellButton type="button" aria-label="Notificações">
          <BellIcon />
          {notificationCount > 0 && <Badge>{notificationCount}</Badge>}
        </BellButton>
        <AccountMenu type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
          Essence Perfumes
          <ChevronDownIcon />
        </AccountMenu>
      </Actions>
    </Bar>
  );
}
