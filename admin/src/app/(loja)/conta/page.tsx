"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductSwatch from "@/components/product/ProductSwatch";
import TrustBar from "@/components/home/TrustBar";
import { BagIcon, EditIcon, PinIcon } from "@/components/icons/Icons";
import { mockAddress, mockFavorites, mockOrders, mockPaymentMethods, mockUser } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/cart";
import { useCartStore } from "@/lib/store/useCartStore";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useAuthStore } from "@/lib/store/useAuthStore";

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
  grid-template-columns: 260px 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: start;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0 auto ${({ theme }) => theme.spacing.sm};
`;

const UserName = styled.p`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const UserEmail = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SidebarNav = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  text-align: left;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.md};
`;

const SidebarItem = styled.li<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.ink)};
  background: ${({ theme, $active }) => ($active ? theme.colors.surfaceAlt : "transparent")};
  border-left: 2px solid ${({ theme, $active }) => ($active ? theme.colors.gold : "transparent")};
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.md};
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
    margin: ${({ theme }) => theme.spacing.xxs} 0 0;
  }
`;

const EditLink = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const ViewAllLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};

  &:hover {
    text-decoration: underline;
  }
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const DataField = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.muted};
    margin: 0 0 ${({ theme }) => theme.spacing.xxs};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin: 0;
  }
`;

const OrdersTable = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr auto;
  }
`;

const OrderProduct = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const OrderThumb = styled.div`
  width: 44px;
  flex-shrink: 0;
`;

const OrderCell = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const statusStyles = {
  delivered: { label: "Delivered" },
  shipping: { label: "In Transit" },
  processing: { label: "Processing" },
} as const;

const StatusBadge = styled.span<{ $status: keyof typeof statusStyles }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme, $status }) =>
    $status === "delivered"
      ? "rgba(46, 83, 57, 0.12)"
      : $status === "shipping"
        ? "rgba(176, 141, 87, 0.15)"
        : theme.colors.surfaceAlt};
  color: ${({ theme, $status }) =>
    $status === "delivered" ? theme.colors.success : $status === "shipping" ? theme.colors.goldDark : theme.colors.muted};
`;

const DetailsButton = styled(Link)`
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.ink};
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const AddressCard = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.ink};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.gold};
    flex-shrink: 0;
  }
`;

const PaymentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:last-of-type {
    border-bottom: none;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const DefaultTag = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.gold};
`;

const FavoriteRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

const FavoriteThumb = styled.div`
  width: 44px;
  flex-shrink: 0;
`;

const FavoriteInfo = styled.div`
  flex: 1;

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin: 0;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
    margin: 0;
  }
`;

const FavoriteAdd = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
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

const Promo = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceAlt};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const PromoImage = styled.div`
  aspect-ratio: 16 / 9;
`;

const PromoContent = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  padding-left: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  }

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const PromoForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 26rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const PromoInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
`;

const PromoSubmit = styled.button`
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
  }
`;

const sidebarItems = [
  "My Details",
  "My Orders",
  "Addresses",
  "Payment Methods",
  "Favorites",
  "Notifications",
  "Gift Cards",
  "Security",
  "Sign Out",
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ContaPage() {
  const ready = useRequireAuth();
  const authUser = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const [promoEmail, setPromoEmail] = useState("");
  const [promoSubmitted, setPromoSubmitted] = useState(false);

  if (!ready) return null;

  const displayName = authUser?.name ?? mockUser.name;
  const displayEmail = authUser?.email ?? mockUser.email;

  return (
    <Wrap>
      <Title>My Account</Title>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />

      <Layout>
        <Sidebar>
          <Avatar>{initials(displayName)}</Avatar>
          <UserName>{displayName}</UserName>
          <UserEmail>{displayEmail}</UserEmail>

          <SidebarNav>
            {sidebarItems.map((item) => (
              <SidebarItem key={item} $active={item === "My Details"}>
                {item}
              </SidebarItem>
            ))}
          </SidebarNav>
        </Sidebar>

        <Main>
          <Panel>
            <PanelHeader>
              <div>
                <h2>My Details</h2>
                <p>Manage your personal information.</p>
              </div>
              <EditLink type="button">
                <EditIcon />
                Edit
              </EditLink>
            </PanelHeader>

            <DataGrid>
              <DataField>
                <h3>Full Name</h3>
                <p>{displayName}</p>
              </DataField>
              <DataField>
                <h3>Birth Date</h3>
                <p>{new Date(mockUser.birthDate).toLocaleDateString("en-US")}</p>
              </DataField>
              <DataField>
                <h3>Email</h3>
                <p>{displayEmail}</p>
              </DataField>
              <DataField>
                <h3>CPF</h3>
                <p>{mockUser.cpf}</p>
              </DataField>
              <DataField>
                <h3>Phone</h3>
                <p>{mockUser.phone}</p>
              </DataField>
              <DataField>
                <h3>Gender</h3>
                <p>{mockUser.gender}</p>
              </DataField>
            </DataGrid>
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <h2>My Orders</h2>
                <p>Track the status of your orders.</p>
              </div>
              <ViewAllLink href="/conta">View All</ViewAllLink>
            </PanelHeader>

            <OrdersTable>
              {mockOrders.map((order) => (
                <OrderRow key={order.id}>
                  <OrderProduct>
                    <OrderThumb>
                      <ProductSwatch from="#EFE6D6" to="#C7B48F" alt="" />
                    </OrderThumb>
                    <div>
                      <strong>{order.id}</strong>
                      <span>{order.itemCount} items</span>
                    </div>
                  </OrderProduct>
                  <OrderCell>{new Date(order.date).toLocaleDateString("en-US")}</OrderCell>
                  <OrderCell>
                    <StatusBadge $status={order.status}>{statusStyles[order.status].label}</StatusBadge>
                  </OrderCell>
                  <OrderCell>{formatPrice(order.total)}</OrderCell>
                  <DetailsButton href="/conta">View Details</DetailsButton>
                </OrderRow>
              ))}
            </OrdersTable>
          </Panel>

          <InfoRow>
            <Panel>
              <PanelHeader>
                <div>
                  <h2>Addresses</h2>
                  <p>Manage your delivery addresses.</p>
                </div>
              </PanelHeader>
              <AddressCard>
                <div>
                  <strong>{mockAddress.label}</strong>
                  {mockAddress.street}
                  <br />
                  {mockAddress.complement}
                  <br />
                  {mockAddress.city}, {mockAddress.country}
                  <br />
                  {mockAddress.phone}
                </div>
                <PinIcon />
              </AddressCard>
            </Panel>

            <Panel>
              <PanelHeader>
                <div>
                  <h2>Payment Methods</h2>
                  <p>Manage your cards.</p>
                </div>
              </PanelHeader>
              {mockPaymentMethods.map((method) => (
                <PaymentRow key={method.last4}>
                  <div>
                    {method.brand} •••• {method.last4}
                    <br />
                    <span>Exp. {method.expiry}</span>
                  </div>
                  {method.isDefault && <DefaultTag>Default</DefaultTag>}
                </PaymentRow>
              ))}
            </Panel>

            <Panel>
              <PanelHeader>
                <div>
                  <h2>Favorites</h2>
                  <p>Your favorite perfumes.</p>
                </div>
                <ViewAllLink href="/catalogo">View All</ViewAllLink>
              </PanelHeader>
              {mockFavorites.map((product) => (
                <FavoriteRow key={product.slug}>
                  <FavoriteThumb>
                    <ProductSwatch from={product.swatch[0]} to={product.swatch[1]} image={product.image} alt={product.name} />
                  </FavoriteThumb>
                  <FavoriteInfo>
                    <h4>{product.name}</h4>
                    <p>
                      {product.concentration ?? "Eau de Parfum"} — {product.volumeMl}ml
                    </p>
                    <p>{formatPrice(product.price)}</p>
                  </FavoriteInfo>
                  <FavoriteAdd
                    type="button"
                    aria-label={`Add ${product.name} to bag`}
                    onClick={() =>
                      addItem({
                        productId: product.id ?? product.slug,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                      }).catch(() => {})
                    }
                  >
                    <BagIcon />
                  </FavoriteAdd>
                </FavoriteRow>
              ))}
            </Panel>
          </InfoRow>

          <Promo>
            <PromoImage>
              <ProductSwatch from="#EFE6D6" to="#C7B48F" image="/hero.png" alt="" />
            </PromoImage>
            <PromoContent>
              <h2>Exclusive Offers For You</h2>
              <p>Get first access to new launches, offers, and exclusive content.</p>
              <PromoForm
                onSubmit={(event) => {
                  event.preventDefault();
                  setPromoSubmitted(true);
                  setPromoEmail("");
                }}
              >
                <PromoInput
                  type="email"
                  required
                  placeholder="Your best email"
                  value={promoEmail}
                  disabled={promoSubmitted}
                  onChange={(event) => setPromoEmail(event.target.value)}
                  aria-label="Email"
                />
                <PromoSubmit type="submit" disabled={promoSubmitted}>
                  {promoSubmitted ? "Subscribed" : "Subscribe"}
                </PromoSubmit>
              </PromoForm>
            </PromoContent>
          </Promo>
        </Main>
      </Layout>

      <TrustBar />
    </Wrap>
  );
}
