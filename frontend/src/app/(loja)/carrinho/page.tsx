"use client";

import Link from "next/link";
import styled from "styled-components";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductSwatch from "@/components/product/ProductSwatch";
import RelatedProducts from "@/components/product/RelatedProducts";
import OrderSummary from "@/components/cart/OrderSummary";
import QuantityStepper from "@/components/cart/QuantityStepper";
import { ArrowRightIcon, CloseIcon, ShieldIcon, TruckIcon } from "@/components/icons/Icons";
import { useCartStore } from "@/lib/store/useCartStore";
import { findProductBySlug, relatedProducts } from "@/lib/data/mockProducts";
import { amountToFreeShipping, cartSubtotal, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

const Wrap = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ShippingProgress = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ShippingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.gold};
    flex-shrink: 0;
  }

  strong {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const Track = styled.div`
  position: relative;
  height: 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Fill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ theme }) => theme.colors.gold};
  transition: width 0.2s ease;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
  }
`;

const Product = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const Thumb = styled.div`
  width: 80px;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin: 0 0 ${({ theme }) => theme.spacing.xxs};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
    margin: 0;
  }
`;

const Cell = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Total = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  background: transparent;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const ContinueLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;

  svg {
    width: 14px;
    height: 14px;
    transform: rotate(180deg);
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PrimaryAction = styled(Link)`
  display: block;
  width: 100%;
  text-align: center;
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
  }
`;

const SecondaryAction = styled(Link)`
  display: block;
  width: 100%;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.ink};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const InfoList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const InfoItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.gold};
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.ink};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl} 0;

  p {
    color: ${({ theme }) => theme.colors.muted};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

export default function CarrinhoPage() {
  const ready = useRequireAuth();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const subtotal = cartSubtotal(items);
  const remaining = amountToFreeShipping(subtotal);
  const percent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (!ready) return null;

  return (
    <Wrap>
      <Title>Cart</Title>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      {items.length === 0 ? (
        <EmptyState>
          <p>Your cart is empty.</p>
          <SecondaryAction href="/catalogo" style={{ maxWidth: 280, margin: "0 auto", display: "inline-block" }}>
            Continue Shopping
          </SecondaryAction>
        </EmptyState>
      ) : (
        <Layout>
          <div>
            <ShippingProgress>
              <ShippingHeader>
                <TruckIcon />
                {remaining > 0 ? (
                  <span>
                    Only <strong>{formatPrice(remaining)}</strong> away from free shipping.
                  </span>
                ) : (
                  <span>
                    You&apos;ve unlocked <strong>free shipping</strong>!
                  </span>
                )}
              </ShippingHeader>
              <Track>
                <Fill $percent={percent} />
              </Track>
            </ShippingProgress>

            <TableHead>
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span />
            </TableHead>

            {items.map((item) => {
              const product = findProductBySlug(item.productId);
              return (
                <Row key={item.productId}>
                  <Product>
                    <Thumb>
                      <ProductSwatch
                        from={product?.swatch[0] ?? "#EFE6D6"}
                        to={product?.swatch[1] ?? "#C7B48F"}
                        image={product?.image}
                        alt={item.name}
                      />
                    </Thumb>
                    <ProductInfo>
                      <h3>{item.name.toUpperCase()}</h3>
                      <p>{product?.concentration ?? "Eau de Parfum"}</p>
                      <p>Size: {product?.volumeMl ?? 100}ml</p>
                    </ProductInfo>
                  </Product>
                  <Cell>{formatPrice(item.price)}</Cell>
                  <Cell>
                    <QuantityStepper
                      quantity={item.quantity}
                      label={item.name}
                      onChange={(next) => setQuantity(item.productId, next)}
                    />
                  </Cell>
                  <Total>{formatPrice(item.price * item.quantity)}</Total>
                  <RemoveButton
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeItem(item.productId)}
                  >
                    <CloseIcon />
                  </RemoveButton>
                </Row>
              );
            })}

            <Actions>
              <ContinueLink href="/catalogo">
                <ArrowRightIcon />
                Continue Shopping
              </ContinueLink>
              <ClearButton type="button" onClick={clear}>
                <CloseIcon />
                Clear Cart
              </ClearButton>
            </Actions>
          </div>

          <OrderSummary>
            <PrimaryAction href="/checkout">Checkout</PrimaryAction>
            <SecondaryAction href="/checkout">One-Click Buy</SecondaryAction>

            <InfoList>
              <InfoItem>
                <ShieldIcon />
                <span>
                  <strong>Secure Payment</strong>
                  Your data is fully protected.
                </span>
              </InfoItem>
              <InfoItem>
                <TruckIcon />
                <span>
                  <strong>Guaranteed Delivery</strong>
                  Shipping across the country.
                </span>
              </InfoItem>
            </InfoList>
          </OrderSummary>
        </Layout>
      )}

      <RelatedProducts title="You May Also Like" products={relatedProducts(items[0]?.productId ?? "")} />
    </Wrap>
  );
}
