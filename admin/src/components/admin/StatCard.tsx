"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconChip = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.goldLight};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Label = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const Value = styled.p`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin: 0;
`;

const Delta = styled.span<{ $direction: "up" | "down" }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme, $direction }) => ($direction === "up" ? theme.colors.success : theme.colors.danger)};
`;

const Caption = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const Footer = styled.p`
  margin: 0;
`;

export default function StatCard({
  icon,
  label,
  value,
  deltaPct,
  direction = "up",
  caption,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  deltaPct?: number;
  direction?: "up" | "down";
  caption?: string;
}) {
  return (
    <Card>
      <IconChip>{icon}</IconChip>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {(deltaPct !== undefined || caption) && (
        <Footer>
          {deltaPct !== undefined && <Delta $direction={direction}>{direction === "up" ? "↑" : "↓"} {deltaPct}%</Delta>}
          {caption && <Caption> {caption}</Caption>}
        </Footer>
      )}
    </Card>
  );
}
