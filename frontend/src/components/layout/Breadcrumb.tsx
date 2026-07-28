"use client";

import Link from "next/link";
import styled from "styled-components";

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  a {
    color: ${({ theme }) => theme.colors.muted};

    &:hover {
      color: ${({ theme }) => theme.colors.gold};
    }
  }

  span[aria-current="page"] {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Nav aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {index > 0 && <span aria-hidden="true">›</span>}
            {item.href && !isLast ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </Nav>
  );
}
