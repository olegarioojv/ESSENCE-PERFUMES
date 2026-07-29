"use client";

import { useState } from "react";
import styled from "styled-components";
import { StarIcon } from "@/components/icons/Icons";
import { testimonials } from "@/lib/data/mockProducts";

const Wrap = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Card = styled.blockquote`
  max-width: 640px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Rating = styled.div`
  display: flex;
  justify-content: center;
  gap: 2px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Quote = styled.p`
  font-style: italic;
  color: ${({ theme }) => theme.colors.ink};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Author = styled.cite`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
  font-style: normal;
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.gold : theme.colors.border};
`;

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];

  return (
    <Wrap>
      <Title>What Our Clients Say</Title>

      <Card>
        <Rating>
          {Array.from({ length: testimonial.rating }).map((_, index) => (
            <StarIcon key={index} />
          ))}
        </Rating>
        <Quote>&ldquo;{testimonial.quote}&rdquo;</Quote>
        <Author>— {testimonial.name}</Author>
      </Card>

      <Dots>
        {testimonials.map((item, index) => (
          <Dot
            key={item.name}
            type="button"
            $active={index === active}
            aria-label={`Ver depoimento de ${item.name}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
          />
        ))}
      </Dots>
    </Wrap>
  );
}
