"use client";

import Link from "next/link";
import styled from "styled-components";

const Wrap = styled.footer`
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.surfaceAlt};
`;

const Top = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  display: grid;
  grid-template-columns: 1.3fr repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Brand = styled.div`
  h2 {
    color: ${({ theme }) => theme.colors.surface};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    letter-spacing: 0.1em;
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    max-width: 24ch;
  }
`;

const Column = styled.div`
  h3 {
    color: ${({ theme }) => theme.colors.surface};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  a {
    color: ${({ theme }) => theme.colors.muted};
    font-size: ${({ theme }) => theme.fontSizes.sm};

    &:hover {
      color: ${({ theme }) => theme.colors.goldLight};
    }
  }
`;

const Bottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Perfumes", href: "/catalogo" },
      { label: "Best Sellers", href: "/catalogo" },
      { label: "New Arrivals", href: "/catalogo" },
      { label: "Gift Sets", href: "/catalogo" },
      { label: "Accessories", href: "/catalogo" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/conta" },
      { label: "Craftsmanship", href: "/conta" },
      { label: "Ingredients", href: "/conta" },
      { label: "Sustainability", href: "/conta" },
      { label: "Careers", href: "/conta" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/conta" },
      { label: "Shipping & Returns", href: "/conta" },
      { label: "Order Tracking", href: "/conta" },
      { label: "Contact Us", href: "/conta" },
      { label: "Terms & Conditions", href: "/conta" },
    ],
  },
];

export default function Footer() {
  return (
    <Wrap>
      <Top>
        <Brand>
          <h2>ESSENCE PERFUMES</h2>
          <p>The art of fine fragrance. Made to be remembered.</p>
        </Brand>

        {columns.map((column) => (
          <Column key={column.title}>
            <h3>{column.title}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </Column>
        ))}

        <Column>
          <h3>Contact</h3>
          <ul>
            <li>hello@essenceperfumes.com</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Fragrance Lane, New York, NY 10001, US</li>
          </ul>
        </Column>
      </Top>

      <Bottom>
        &copy; {new Date().getFullYear()} Essence Perfumes. All rights reserved.
      </Bottom>
    </Wrap>
  );
}
