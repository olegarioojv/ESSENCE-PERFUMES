"use client";

import styled from "styled-components";

const Wrap = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const StepButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.ink};

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.gold};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const Value = styled.span`
  width: 28px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 10,
  label,
}: {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <Wrap role="group" aria-label={`Quantidade de ${label}`}>
      <StepButton
        type="button"
        aria-label={`Diminuir quantidade de ${label}`}
        disabled={quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - 1))}
      >
        −
      </StepButton>
      <Value aria-live="polite">{quantity}</Value>
      <StepButton
        type="button"
        aria-label={`Aumentar quantidade de ${label}`}
        disabled={quantity >= max}
        onClick={() => onChange(Math.min(max, quantity + 1))}
      >
        +
      </StepButton>
    </Wrap>
  );
}
