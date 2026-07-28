"use client";

import styled from "styled-components";
import { LeafIcon, CraftIcon, ShieldIcon, TruckIcon } from "@/components/icons/Icons";

const Wrap = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme.colors.gold};
    flex-shrink: 0;
  }
`;

const Copy = styled.div`
  h3 {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin: 0;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
    margin: 0;
  }
`;

const items = [
  {
    icon: <LeafIcon />,
    title: "Fine Ingredients",
    text: "Sourced from around the world, only the finest make the cut.",
  },
  {
    icon: <CraftIcon />,
    title: "Expert Craftsmanship",
    text: "Blended by master perfumers with decades of expertise.",
  },
  {
    icon: <ShieldIcon />,
    title: "Secure & Premium",
    text: "Luxury packaging and secure checkout experience.",
  },
  {
    icon: <TruckIcon />,
    title: "Complimentary Shipping",
    text: "Free shipping on all orders over $150.",
  },
];

export default function TrustBar() {
  return (
    <Wrap>
      {items.map((item) => (
        <Item key={item.title}>
          {item.icon}
          <Copy>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Copy>
        </Item>
      ))}
    </Wrap>
  );
}
