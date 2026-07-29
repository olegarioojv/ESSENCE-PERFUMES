"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { CloseIcon } from "@/components/icons/Icons";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(14, 13, 12, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndices.modal};
`;

const Content = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <Content onClick={(event) => event.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </CloseButton>
        </Header>
        {children}
      </Content>
    </Overlay>
  );
}
