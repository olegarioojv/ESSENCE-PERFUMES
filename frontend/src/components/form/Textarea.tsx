"use client";

import styled from "styled-components";

export const Textarea = styled.textarea<{ $invalid?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
  font-family: inherit;
  resize: vertical;
  min-height: 88px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

export default Textarea;
