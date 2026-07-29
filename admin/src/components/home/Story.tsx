"use client";

import Link from "next/link";
import styled from "styled-components";
import ProductSwatch from "@/components/product/ProductSwatch";

const Wrap = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Visual = styled.div`
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  line-height: 1.2;
`;

const Rule = styled.div`
  width: 48px;
  height: 2px;
  background: ${({ theme }) => theme.colors.gold};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Cta = styled(Link)`
  display: inline-block;
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
  }
`;

export default function Story() {
  return (
    <Wrap>
      <Visual>
        <ProductSwatch from="#EFE6D6" to="#C7B48F" image="/ourshory.jpeg" alt="Essence Perfumes" />
      </Visual>

      <div>
        <Eyebrow>Our Story</Eyebrow>
        <Title>Crafted with passion. Inspired by memory.</Title>
        <Rule />
        <Text>
          Essence Perfumes was born from a passion for the art of fine
          fragrance. We believe that a scent is more than just a fragrance —
          it&apos;s a memory, a feeling, a part of who you are.
        </Text>
        <Text>
          Each bottle is meticulously crafted using the world&apos;s finest
          ingredients, blended by master perfumers to create timeless
          olfactory experiences.
        </Text>
        <Cta href="/conta">Learn More About Us</Cta>
      </div>
    </Wrap>
  );
}
