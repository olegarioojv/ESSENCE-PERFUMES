"use client";

import { useState, type FormEvent } from "react";
import styled from "styled-components";
import Breadcrumb from "@/components/layout/Breadcrumb";
import OrderSummary from "@/components/cart/OrderSummary";
import TrustBar from "@/components/home/TrustBar";
import FormField, { Input, Select } from "@/components/form/FormField";
import { ArrowRightIcon, CraftIcon, LeafIcon, ShieldIcon, StarIcon, TruckIcon } from "@/components/icons/Icons";
import { checkoutDeliverySchema } from "@/lib/validations/checkoutSchema";
import { STANDARD_SHIPPING, formatPrice } from "@/lib/cart";

const Wrap = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Steps = styled.ol`
  display: flex;
  align-items: center;
  max-width: 480px;
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
`;

const Step = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

const StepCircle = styled.span<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) => ($active ? theme.colors.black : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.muted)};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.black : theme.colors.border)};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StepLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 0 ${({ theme }) => theme.spacing.sm};
  margin-bottom: 20px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: start;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.md};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const DeliveryMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DeliveryOption = styled.label<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const DeliveryInfo = styled.div`
  flex: 1;

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const DeliveryPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gold};
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CouponRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  input {
    flex: 1;
  }
`;

const ApplyButton = styled.button`
  padding: 0 ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
  }
`;

const ContinueButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
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

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SecureNote = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const InfoList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
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

const FormFeedback = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const deliveryMethods = [
  { id: "standard", title: "Standard Shipping", detail: "Estimated 5 to 7 business days", price: 0 },
  { id: "express", title: "Express Shipping", detail: "Estimated 2 to 3 business days", price: STANDARD_SHIPPING },
  { id: "pickup", title: "Pickup in Store", detail: "Pick up at one of our stores", price: 0 },
] as const;

export default function CheckoutPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<(typeof deliveryMethods)[number]["id"]>("standard");
  const [sameBilling, setSameBilling] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = checkoutDeliverySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitted(true);
    // Real submission (POST /orders via apiClient) lands in Fase 18.
  }

  function handleApplyCoupon() {
    setCouponMessage(coupon.trim() ? "Invalid or expired coupon." : "Enter a coupon code.");
  }

  return (
    <Wrap>
      <Title>Checkout</Title>
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/carrinho" }, { label: "Checkout" }]}
      />

      <Steps>
        <Step>
          <StepCircle $active>1</StepCircle>
          Delivery
        </Step>
        <StepLine />
        <Step>
          <StepCircle $active={false}>2</StepCircle>
          Payment
        </Step>
        <StepLine />
        <Step>
          <StepCircle $active={false}>3</StepCircle>
          Confirmation
        </Step>
      </Steps>

      <Layout>
        <form onSubmit={handleSubmit} noValidate>
          <SectionTitle>Delivery Details</SectionTitle>

          <Grid2>
            <FormField label="Full Name" htmlFor="fullName" error={errors.fullName}>
              <Input id="fullName" name="fullName" placeholder="Enter your full name" $invalid={!!errors.fullName} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email}>
              <Input id="email" name="email" type="email" placeholder="your@email.com" $invalid={!!errors.email} />
            </FormField>
          </Grid2>

          <Grid2>
            <FormField label="CPF" htmlFor="cpf" error={errors.cpf}>
              <Input id="cpf" name="cpf" placeholder="000.000.000-00" $invalid={!!errors.cpf} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone}>
              <Input id="phone" name="phone" placeholder="(00) 00000-0000" $invalid={!!errors.phone} />
            </FormField>
          </Grid2>

          <Grid3>
            <FormField label="ZIP Code" htmlFor="cep" error={errors.cep}>
              <Input id="cep" name="cep" placeholder="00000-000" $invalid={!!errors.cep} />
            </FormField>
            <FormField label="Address" htmlFor="address" error={errors.address}>
              <Input id="address" name="address" placeholder="Street, Avenue" $invalid={!!errors.address} />
            </FormField>
            <FormField label="Number" htmlFor="number" error={errors.number}>
              <Input id="number" name="number" placeholder="123" $invalid={!!errors.number} />
            </FormField>
          </Grid3>

          <Grid2>
            <FormField label="Complement (optional)" htmlFor="complement">
              <Input id="complement" name="complement" placeholder="Apt, Block, Floor, etc." />
            </FormField>
            <FormField label="Neighborhood" htmlFor="neighborhood" error={errors.neighborhood}>
              <Input id="neighborhood" name="neighborhood" placeholder="Your neighborhood" $invalid={!!errors.neighborhood} />
            </FormField>
          </Grid2>

          <Grid2>
            <FormField label="City" htmlFor="city" error={errors.city}>
              <Input id="city" name="city" placeholder="Your city" $invalid={!!errors.city} />
            </FormField>
            <FormField label="State" htmlFor="state" error={errors.state}>
              <Select id="state" name="state" defaultValue="" $invalid={!!errors.state}>
                <option value="" disabled>
                  UF
                </option>
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                <option value="Other">Other</option>
              </Select>
            </FormField>
          </Grid2>

          <SectionTitle>Delivery Method</SectionTitle>
          <DeliveryMethods role="radiogroup" aria-label="Delivery method">
            {deliveryMethods.map((method) => (
              <DeliveryOption key={method.id} $active={deliveryMethod === method.id}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method.id}
                  checked={deliveryMethod === method.id}
                  onChange={() => setDeliveryMethod(method.id)}
                  style={{ display: "none" }}
                />
                <TruckIcon />
                <DeliveryInfo>
                  <strong>{method.title}</strong>
                  <span>{method.detail}</span>
                </DeliveryInfo>
                <DeliveryPrice>{method.price === 0 ? "Free" : formatPrice(method.price)}</DeliveryPrice>
              </DeliveryOption>
            ))}
          </DeliveryMethods>

          <SectionTitle>Billing Details</SectionTitle>
          <CheckboxRow>
            <input
              type="checkbox"
              checked={sameBilling}
              onChange={() => setSameBilling(true)}
            />
            Use the same delivery address
          </CheckboxRow>
          <CheckboxRow>
            <input
              type="checkbox"
              checked={!sameBilling}
              onChange={() => setSameBilling(false)}
            />
            Use a different billing address
          </CheckboxRow>

          <SectionTitle>Discount Coupon</SectionTitle>
          <CouponRow>
            <Input
              placeholder="Enter your coupon"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              aria-label="Discount coupon"
            />
            <ApplyButton type="button" onClick={handleApplyCoupon}>
              Apply
            </ApplyButton>
          </CouponRow>
          {couponMessage && <FormFeedback role="status">{couponMessage}</FormFeedback>}

          {submitted && (
            <FormFeedback role="status">Details validated (real integration lands in Fase 18).</FormFeedback>
          )}

          <ContinueButton type="submit">
            Continue to Payment
            <ArrowRightIcon />
          </ContinueButton>
          <SecureNote>
            <ShieldIcon />
            100% secure environment. Your data is protected.
          </SecureNote>
        </form>

        <OrderSummary showItems>
          <InfoList>
            <InfoItem>
              <ShieldIcon />
              <span>
                <strong>100% Secure Purchase</strong>
                Your data is protected with SSL encryption.
              </span>
            </InfoItem>
            <InfoItem>
              <CraftIcon />
              <span>
                <strong>Easy &amp; Free Exchanges</strong>
                Up to 7 days after delivery.
              </span>
            </InfoItem>
            <InfoItem>
              <StarIcon />
              <span>
                <strong>Exclusive Support</strong>
                Dedicated assistance for you.
              </span>
            </InfoItem>
            <InfoItem>
              <LeafIcon />
              <span>
                <strong>Premium Packaging</strong>
                Perfect for gifting.
              </span>
            </InfoItem>
          </InfoList>
        </OrderSummary>
      </Layout>

      <TrustBar />
    </Wrap>
  );
}
