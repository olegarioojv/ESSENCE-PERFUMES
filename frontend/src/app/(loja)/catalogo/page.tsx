"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductSwatch from "@/components/product/ProductSwatch";
import { BagIcon, CheckIcon } from "@/components/icons/Icons";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatPrice } from "@/lib/cart";
import { fetchProducts } from "@/lib/api/products";
import type { HomeProduct } from "@/lib/data/mockProducts";

const Wrap = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) => ($active ? theme.colors.gold : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.ink)};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.04em;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

const SortRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ResultCount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div``;

const Name = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.xxs};
`;

const Family = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const AddButton = styled.button<{ $added: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid ${({ theme, $added }) => ($added ? theme.colors.success : theme.colors.gold)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $added }) => ($added ? theme.colors.success : "transparent")};
  color: ${({ theme, $added }) => ($added ? theme.colors.white : theme.colors.gold)};
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    background: ${({ theme, $added }) => ($added ? theme.colors.success : theme.colors.gold)};
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    cursor: default;
  }
`;

const EmptyState = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

type SortOption = "featured" | "price-asc" | "price-desc" | "name";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
];

function sortProducts(products: HomeProduct[], sort: SortOption): HomeProduct[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export default function CatalogoPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("featured");
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const families = useMemo(
    () => Array.from(new Set(products.map((product) => product.family).filter(Boolean))) as string[],
    [products],
  );

  const filtered = useMemo(() => {
    const base = activeFamily ? products.filter((product) => product.family === activeFamily) : products;
    return sortProducts(base, sort);
  }, [products, activeFamily, sort]);

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
      <Title>Catalog</Title>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Catalog" }]} />

      <Toolbar>
        <Filters>
          <FilterChip type="button" $active={activeFamily === null} onClick={() => setActiveFamily(null)}>
            All
          </FilterChip>
          {families.map((family) => (
            <FilterChip
              key={family}
              type="button"
              $active={activeFamily === family}
              aria-pressed={activeFamily === family}
              onClick={() => setActiveFamily(family)}
            >
              {family}
            </FilterChip>
          ))}
        </Filters>

        <SortRow>
          <label htmlFor="sort">Sort by</label>
          <SortSelect id="sort" value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SortSelect>
        </SortRow>
      </Toolbar>

      <ResultCount>
        {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
      </ResultCount>

      {loading ? (
        <EmptyState>Loading...</EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState>No fragrances match this filter.</EmptyState>
      ) : (
        <Grid>
          {filtered.map((product) => {
            const added = addedSlug === product.slug;
            return (
              <Card key={product.slug}>
                <Link href={`/produto/${product.slug}`}>
                  <ProductSwatch from={product.swatch[0]} to={product.swatch[1]} image={product.image} alt={product.name} />
                </Link>
                <Name>{product.name.toUpperCase()}</Name>
                {product.family && <Family>{product.family}</Family>}
                <CardFooter>
                  <Price>{formatPrice(product.price)}</Price>
                  <AddButton
                    type="button"
                    $added={added}
                    disabled={added}
                    aria-label={added ? `${product.name} added to bag` : `Add ${product.name} to bag`}
                    onClick={() => handleAdd(product)}
                  >
                    {added ? <CheckIcon /> : <BagIcon />}
                  </AddButton>
                </CardFooter>
              </Card>
            );
          })}
        </Grid>
      )}
    </Wrap>
  );
}
