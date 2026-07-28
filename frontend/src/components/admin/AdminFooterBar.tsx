"use client";

import styled from "styled-components";
import { ShieldIcon } from "@/components/icons/Icons";

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Secure = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

export default function AdminFooterBar() {
  return (
    <Bar>
      <Secure>
        <ShieldIcon />
        Ambiente 100% seguro — Seus dados estão protegidos
      </Secure>
      <span>Essence Perfumes © 2026. Todos os direitos reservados.</span>
      <span>Versão 1.0.0 — Painel Administrativo</span>
    </Bar>
  );
}
