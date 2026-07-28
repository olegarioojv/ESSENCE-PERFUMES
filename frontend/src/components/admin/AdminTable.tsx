"use client";

import styled from "styled-components";

export const Table = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TableHeadRow = styled.div<{ $columns: string }>`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const HeadCell = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Row = styled.div<{ $columns: string }>`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

export const Cell = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.ink};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
