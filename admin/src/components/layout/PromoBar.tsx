"use client";

import styled from "styled-components";
import { TruckIcon } from "@/components/icons/Icons";

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.goldLight};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  text-align: center;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

export default function PromoBar() {
  return (
    <Bar>
      <TruckIcon />
      Free shipping on orders over $299
    </Bar>
  );
}
