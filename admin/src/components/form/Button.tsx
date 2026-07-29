"use client";

import styled from "styled-components";

export const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: 1px solid transparent;

  ${({ theme, $variant = "primary" }) => {
    if ($variant === "secondary") {
      return `
        background: transparent;
        border-color: ${theme.colors.border};
        color: ${theme.colors.ink};

        &:hover { border-color: ${theme.colors.gold}; color: ${theme.colors.gold}; }
      `;
    }
    if ($variant === "danger") {
      return `
        background: transparent;
        border-color: ${theme.colors.danger};
        color: ${theme.colors.danger};

        &:hover { background: ${theme.colors.danger}; color: ${theme.colors.white}; }
      `;
    }
    return `
      background: ${theme.colors.black};
      color: ${theme.colors.white};

      &:hover { background: ${theme.colors.gold}; }
    `;
  }}

  svg {
    width: 16px;
    height: 16px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Button;
