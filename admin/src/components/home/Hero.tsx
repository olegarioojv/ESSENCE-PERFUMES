"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { motion, useMotionValue, useReducedMotion, useSpring, type Variants } from "framer-motion";
import { ArrowRightIcon, LeafIcon, CraftIcon, ShieldIcon } from "@/components/icons/Icons";
import { HEADER_HEIGHT } from "@/components/layout/Header";

const Wrap = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: calc(${({ theme }) => theme.spacing.xxl} + ${HEADER_HEIGHT}px)
    ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.luxe.background};
  color: ${({ theme }) => theme.colors.luxe.text};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  }
`;

/** Ambient gold bloom behind the bottle — pure decoration, so it's hidden from AT. */
const Glow = styled.div`
  position: absolute;
  top: 50%;
  right: 8%;
  width: 640px;
  height: 640px;
  transform: translateY(-50%);
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.28) 0%,
    rgba(212, 175, 55, 0.1) 40%,
    transparent 70%
  );
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 420px;
    height: 420px;
    right: 50%;
    transform: translate(50%, -50%);
  }
`;

/** Faint film-grain texture so the flat dark background doesn't look banded. */
const Noise = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.05;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
`;

const Copy = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 32rem;
`;

const Eyebrow = styled(motion.p)`
  color: ${({ theme }) => theme.colors.luxe.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 5vw, ${({ theme }) => theme.fontSizes.display});
  line-height: 1.08;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.luxe.text};
  background: linear-gradient(
    100deg,
    ${({ theme }) => theme.colors.luxe.text} 40%,
    ${({ theme }) => theme.colors.luxe.champagne} 60%,
    ${({ theme }) => theme.colors.luxe.text} 80%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Rule = styled(motion.div)`
  height: 2px;
  background: ${({ theme }) => theme.colors.luxe.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  transform-origin: left;
`;

const Text = styled(motion.p)`
  color: ${({ theme }) => theme.colors.luxe.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CtaRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CtaPrimary = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.luxe.gold};
  color: #070707;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.luxe.champagne};
    box-shadow: 0 8px 24px rgba(212, 175, 55, 0.35);
    transform: translateY(-1px);
  }
`;

const CtaSecondary = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.luxe.text};
  border: 1px solid ${({ theme }) => theme.colors.luxe.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.luxe.gold};
    background: rgba(255, 255, 255, 0.04);
  }
`;

const Badges = styled(motion.ul)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Badge = styled(motion.li)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.luxe.textMuted};
  text-align: center;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.luxe.gold};
  }
`;

const Visual = styled(motion.div)`
  position: relative;
  z-index: 1;
  aspect-ratio: 4 / 3;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px ${({ theme }) => theme.colors.luxe.border};
`;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const parallaxX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(rawY, { stiffness: 60, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion || !wrapRef.current) return;
    const bounds = wrapRef.current.getBoundingClientRect();
    const relX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relY = (event.clientY - bounds.top) / bounds.height - 0.5;
    rawX.set(relX * 16);
    rawY.set(relY * 16);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <Wrap ref={wrapRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <Glow aria-hidden="true" />
      <Noise aria-hidden="true" />

      <Copy initial="hidden" animate="show">
        <Eyebrow custom={0} variants={fadeUp}>
          Discover the Essence
        </Eyebrow>
        <Title custom={0.1} variants={fadeUp}>
          The Art of Scent
        </Title>
        <Rule
          initial={{ scaleX: 0, width: "48px" }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
        <Text custom={0.25} variants={fadeUp}>
          Unveil your personal fragrance journey. Delicate, coiling plumes of
          subtle, coordinated midnight blue and soft gold vapor.
        </Text>
        <CtaRow custom={0.35} variants={fadeUp}>
          <CtaPrimary href="/catalogo">
            Comprar Agora
            <ArrowRightIcon />
          </CtaPrimary>
          <CtaSecondary href="#colecao">Explorar Coleção</CtaSecondary>
        </CtaRow>
        <Badges custom={0.45} variants={fadeUp}>
          <Badge whileHover={prefersReducedMotion ? undefined : { y: -3 }}>
            <LeafIcon />
            Fine Ingredients
          </Badge>
          <Badge whileHover={prefersReducedMotion ? undefined : { y: -3 }}>
            <CraftIcon />
            Expert Craftsmanship
          </Badge>
          <Badge whileHover={prefersReducedMotion ? undefined : { y: -3 }}>
            <ShieldIcon />
            Timeless Luxury
          </Badge>
        </Badges>
      </Copy>

      <Visual
        style={prefersReducedMotion ? undefined : { x: parallaxX, y: parallaxY }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 1, scale: 1, translateY: [0, -14, 0] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            : {
                opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                translateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }
        }
      >
        <Image
          src="/botanical.png"
          alt="Essence Botanical — Eau de Parfum"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </Visual>
    </Wrap>
  );
}
