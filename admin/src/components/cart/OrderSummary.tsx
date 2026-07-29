"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import ProductSwatch from "@/components/product/ProductSwatch";
import { useCartStore } from "@/lib/store/useCartStore";
import { cartItemCount, cartSubtotal, formatPrice, shippingCost } from "@/lib/cart";

const Wrap = styled.aside`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  align-self: start;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.md};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ItemsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ItemRow = styled.li`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Thumb = styled.div`
  width: 56px;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;

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

const ItemPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.ink};
`;

const ShippingValue = styled.span<{ $free: boolean }>`
  color: ${({ theme, $free }) => ($free ? theme.colors.success : theme.colors.ink)};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  span:first-child {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  span:last-child {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-family: ${({ theme }) => theme.fonts.heading};
  }
`;

const Installments = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default function OrderSummary({
  showItems = false,
  children,
}: {
  showItems?: boolean;
  children?: ReactNode;
}) {
  const items = useCartStore((state) => state.items);
  const subtotal = cartSubtotal(items);
  const shipping = shippingCost(subtotal);
  const total = subtotal + shipping;

  return (
    <Wrap>
      <Title>Order Summary</Title>

      {showItems && items.length > 0 && (
        <ItemsList>
          {items.map((item) => (
            <ItemRow key={item.productId}>
              <Thumb>
                <ProductSwatch from="#EFE6D6" to="#C7B48F" alt={item.name} />
              </Thumb>
              <ItemInfo>
                <h3>{item.name.toUpperCase()}</h3>
                <p>Qty: {item.quantity}</p>
              </ItemInfo>
              <ItemPrice>{formatPrice(item.price * item.quantity)}</ItemPrice>
            </ItemRow>
          ))}
        </ItemsList>
      )}

      <Row>
        <span>Subtotal ({cartItemCount(items)} items)</span>
        <span>{formatPrice(subtotal)}</span>
      </Row>
      <Row>
        <span>Shipping</span>
        <ShippingValue $free={shipping === 0}>
          {shipping === 0 ? "Free" : formatPrice(shipping)}
        </ShippingValue>
      </Row>

      <Divider />

      <TotalRow>
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </TotalRow>
      <Installments>or up to 6x of {formatPrice(total / 6)} interest-free</Installments>

      {children}
    </Wrap>
  );
}
