"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { ArrowRightIcon, LeafIcon, CraftIcon, ShieldIcon } from "@/components/icons/Icons";

const Wrap = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Copy = styled.div`
  max-width: 32rem;
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, ${({ theme }) => theme.fontSizes.display});
  line-height: 1.08;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Rule = styled.div`
  width: 48px;
  height: 2px;
  background: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Cta = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
  }
`;

const Badges = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Badge = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const Visual = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

export default function Hero() {
  return (
    <Wrap>
      <Copy>
        <Eyebrow>Discover the Essence</Eyebrow>
        <Title>The Art of Scent</Title>
        <Rule />
        <Text>
          Unveil your personal fragrance journey. Delicate, coiling plumes of
          subtle, coordinated midnight blue and soft gold vapor.
        </Text>
        <Cta href="/catalogo">
          Discover Collection
          <ArrowRightIcon />
        </Cta>
        <Badges>
          <Badge>
            <LeafIcon />
            Fine Ingredients
          </Badge>
          <Badge>
            <CraftIcon />
            Expert Craftsmanship
          </Badge>
          <Badge>
            <ShieldIcon />
            Timeless Luxury
          </Badge>
        </Badges>
      </Copy>

      <Visual>
        <Image
          src="/hero.png"
          alt="Essence Perfumes — Eau de Parfum"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </Visual>
    </Wrap>
  );
}
