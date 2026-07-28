"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Input = styled.input<{ $invalid?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Select = styled.select<{ $invalid?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`;

export default function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <ErrorText role="alert" id={`${htmlFor}-error`}>
          {error}
        </ErrorText>
      )}
    </Field>
  );
}
