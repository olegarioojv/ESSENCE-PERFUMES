"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import ProductSwatch from "@/components/product/ProductSwatch";
import { BagIcon, CheckIcon } from "@/components/icons/Icons";
import { fetchProducts } from "@/lib/api/products";
import type { HomeProduct } from "@/lib/data/mockProducts";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";

const COLLECTION_SLUGS = ["essence-legacy", "essence-botanical", "essence-rose"];

const Wrap = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  text-align: center;
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
`;

const Rule = styled.div`
  width: 48px;
  height: 2px;
  background: ${({ theme }) => theme.colors.gold};
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 1100px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  text-align: left;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const Name = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.xxs};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Price = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.ink};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const BuyButton = styled.button<{ $added: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme, $added }) => ($added ? theme.colors.success : theme.colors.gold)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $added }) => ($added ? theme.colors.success : "transparent")};
  color: ${({ theme, $added }) => ($added ? theme.colors.white : theme.colors.gold)};
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: ${({ theme, $added }) => ($added ? theme.colors.success : theme.colors.gold)};
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    cursor: default;
  }
`;

const ViewAll = styled(Link)`
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

export default function Collection() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const [essenceCollection, setEssenceCollection] = useState<HomeProduct[]>([]);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts().then((products) => {
      const bySlug = new Map(products.map((product) => [product.slug, product]));
      setEssenceCollection(COLLECTION_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean) as HomeProduct[]);
    });
  }, []);

  function handleAdd(product: HomeProduct) {
    if (!user) {
      router.push("/login");
      return;
    }
    addItem({ productId: product.id ?? product.slug, name: product.name, price: product.price, quantity: 1 }).then(
      () => {
        setAddedSlug(product.slug);
        setTimeout(() => setAddedSlug((current) => (current === product.slug ? null : current)), 1500);
      },
      () => {},
    );
  }

  return (
    <Wrap>
      <Eyebrow>Our Signature</Eyebrow>
      <Title>The Essence Collection</Title>
      <Rule />

      <Grid>
        {essenceCollection.map((product) => {
          const added = addedSlug === product.slug;
          return (
            <Card key={product.slug}>
              <Link href={`/produto/${product.slug}`}>
                <ProductSwatch
                  from={product.swatch[0]}
                  to={product.swatch[1]}
                  image={product.image}
                  alt={product.name}
                />
              </Link>
              <Name>{product.name.toUpperCase()}</Name>
              <Description>{product.description}</Description>
              <Price>
                ${product.price} / {product.volumeMl}ml
              </Price>
              <BuyButton
                type="button"
                $added={added}
                disabled={added}
                aria-label={added ? `${product.name} adicionado à sacola` : `Adicionar ${product.name} à sacola`}
                onClick={() => handleAdd(product)}
              >
                {added ? <CheckIcon /> : <BagIcon />}
              </BuyButton>
            </Card>
          );
        })}
      </Grid>

      <ViewAll href="/catalogo">View All Collections</ViewAll>
    </Wrap>
  );
}
