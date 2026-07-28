"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import ProductSwatch from "@/components/product/ProductSwatch";
import { StarIcon } from "@/components/icons/Icons";
import { fetchProducts } from "@/lib/api/products";
import type { HomeProduct } from "@/lib/data/mockProducts";

const BEST_SELLER_SLUGS = ["essence-legacy", "essence-midnight", "essence-vetiver", "essence-aura"];
const BEST_SELLER_RATINGS: Record<string, { rating: number; reviewCount: number }> = {
  "essence-legacy": { rating: 5, reviewCount: 142 },
  "essence-midnight": { rating: 5, reviewCount: 118 },
  "essence-vetiver": { rating: 4, reviewCount: 68 },
  "essence-aura": { rating: 5, reviewCount: 52 },
};

const Wrap = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  text-align: center;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
`;

const Rule = styled.div`
  width: 48px;
  height: 2px;
  background: ${({ theme }) => theme.colors.gold};
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  text-align: left;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Name = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.xxs};
`;

const Price = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};

  svg {
    width: 12px;
    height: 12px;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    margin-left: ${({ theme }) => theme.spacing.xxs};
  }
`;

const ExploreLink = styled(Link)`
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.ink};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export default function BestSellers() {
  const [bestSellers, setBestSellers] = useState<HomeProduct[]>([]);

  useEffect(() => {
    fetchProducts().then((products) => {
      const bySlug = new Map(products.map((product) => [product.slug, product]));
      setBestSellers(
        BEST_SELLER_SLUGS.map((slug) => {
          const product = bySlug.get(slug);
          if (!product) return undefined;
          return { ...product, ...BEST_SELLER_RATINGS[slug] };
        }).filter(Boolean) as HomeProduct[],
      );
    });
  }, []);

  return (
    <Wrap>
      <Title>Best Sellers</Title>
      <Rule />

      <Grid>
        {bestSellers.map((product) => (
          <div key={product.slug}>
            <Link href={`/produto/${product.slug}`}>
              <ProductSwatch
                from={product.swatch[0]}
                to={product.swatch[1]}
                image={product.image}
                alt={product.name}
              />
            </Link>
            <Name>{product.name.toUpperCase()}</Name>
            <Price>
              ${product.price} / {product.volumeMl}ml
            </Price>
            {product.rating && (
              <Rating>
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon
                    key={index}
                    style={{
                      opacity: index < product.rating! ? 1 : 0.25,
                    }}
                  />
                ))}
                <span>({product.reviewCount})</span>
              </Rating>
            )}
          </div>
        ))}
      </Grid>

      <ExploreLink href="/catalogo">Explore Best Sellers</ExploreLink>
    </Wrap>
  );
}
