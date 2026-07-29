"use client";

import styled from "styled-components";
import type { BadgeTone } from "@/lib/data/mockAdmin";

const toneStyles: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: "#E4EDE7", fg: "#2E5339" },
  gold: { bg: "#F2E7D4", fg: "#8A6A3B" },
  tan: { bg: "#F1EAE0", fg: "#B08D57" },
  pale: { bg: "#F1EAE0", fg: "#8A8377" },
  brown: { bg: "#E9E0D3", fg: "#5C4324" },
  danger: { bg: "#F5DEDC", fg: "#B3261E" },
  neutral: { bg: "#0E0D0C", fg: "#FFFFFF" },
};

export const StatusBadge = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background: ${({ $tone }) => toneStyles[$tone].bg};
  color: ${({ $tone }) => toneStyles[$tone].fg};
  white-space: nowrap;
`;

export const toneDotColor: Record<BadgeTone, string> = {
  success: "#2E5339",
  gold: "#B08D57",
  tan: "#D4B98C",
  pale: "#C9C2B4",
  brown: "#5C4324",
  danger: "#B3261E",
  neutral: "#0E0D0C",
};
