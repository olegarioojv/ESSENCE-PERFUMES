"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import ProductSwatch from "@/components/product/ProductSwatch";
import { BagIcon } from "@/components/icons/Icons";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatPrice } from "@/lib/cart";
import type { HomeProduct } from "@/lib/data/mockProducts";

const Wrap = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

const Title = styled.h2`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Card = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin: ${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.xxs};
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Add = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.gold};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.gold};

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export default function RelatedProducts({
  title = "You May Also Like",
  products,
}: {
  title?: string;
  products: HomeProduct[];
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);

  function handleAdd(item: HomeProduct) {
    if (!user) {
      router.push("/login");
      return;
    }
    addItem({ productId: item.id ?? item.slug, name: item.name, price: item.price, quantity: 1 }).catch(() => {});
  }

  if (products.length === 0) return null;

  return (
    <Wrap>
      <Title>{title}</Title>
      <Grid>
        {products.map((item) => (
          <Card key={item.slug}>
            <Link href={`/produto/${item.slug}`}>
              <ProductSwatch from={item.swatch[0]} to={item.swatch[1]} image={item.image} alt={item.name} />
            </Link>
            <h3>{item.name.toUpperCase()}</h3>
            <Footer>
              <Price>{formatPrice(item.price)}</Price>
              <Add
                type="button"
                aria-label={`Add ${item.name} to bag`}
                onClick={() => handleAdd(item)}
              >
                <BagIcon />
              </Add>
            </Footer>
          </Card>
        ))}
      </Grid>
    </Wrap>
  );
}
