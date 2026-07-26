"use client";

import styled from "styled-components";

const Bar = styled.footer`
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.surfaceAlt};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

/**
 * Minimal storefront footer — scaffolding only.
 */
export default function Footer() {
  return (
    <Bar>
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} Essence Perfumes. Todos os direitos
        reservados.
      </p>
    </Bar>
  );
}
