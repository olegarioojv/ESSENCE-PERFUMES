"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import ProductSwatch from "@/components/product/ProductSwatch";
import RelatedProducts from "@/components/product/RelatedProducts";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { BagIcon, CraftIcon, LeafIcon, ShieldIcon, StarIcon, TruckIcon } from "@/components/icons/Icons";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/cart";
import type { HomeProduct } from "@/lib/data/mockProducts";

const Wrap = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Top = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Gallery = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Thumbs = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 72px;
  flex-shrink: 0;
`;

const Thumb = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0;
  overflow: hidden;
  background: transparent;
`;

const MainImage = styled.div`
  flex: 1;
`;

const Info = styled.div``;

const Collection = styled.p`
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Name = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;

const Concentration = styled.p`
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Rule = styled.div`
  width: 48px;
  height: 2px;
  background: ${({ theme }) => theme.colors.gold};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  max-width: 36rem;
`;

const Badges = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Badge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  letter-spacing: 0.04em;

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const SizeLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Sizes = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SizeButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $active }) => ($active ? theme.colors.gold : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.ink)};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

const Price = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-family: ${({ theme }) => theme.fonts.heading};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AddToCart = styled.button<{ $added: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  background: ${({ theme, $added }) => ($added ? theme.colors.success : theme.colors.black)};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme, $added }) => ($added ? theme.colors.success : theme.colors.ink)};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const BuyNow = styled.button`
  display: block;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.ink};
  background: transparent;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const ShippingNote = styled.p`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const Details = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.xl} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const SectionEyebrow = styled.p`
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NoteGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.ink};
    margin-bottom: ${({ theme }) => theme.spacing.xxs};
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const FeatureStrip = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Feature = styled.div`
  h3 {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-bottom: ${({ theme }) => theme.spacing.xxs};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

export default function ProductDetail({
  product,
  related,
}: {
  product: HomeProduct;
  related: HomeProduct[];
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const sizes = product.sizes ?? [product.volumeMl];
  const [activeSize, setActiveSize] = useState(product.volumeMl);
  const [activeThumb, setActiveThumb] = useState(0);
  const [added, setAdded] = useState(false);

  const gallery = [product.image, product.image, product.image].filter(Boolean) as string[];

  function handleAddToCart() {
    addItem({ productId: product.id ?? product.slug, name: product.name, price: product.price, quantity: 1 }).catch(
      () => {},
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  async function handleBuyNow() {
    await addItem({ productId: product.id ?? product.slug, name: product.name, price: product.price, quantity: 1 }).catch(
      () => {},
    );
    router.push("/checkout");
  }

  return (
    <Wrap>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Catalog", href: "/catalogo" },
          { label: product.name },
        ]}
      />

      <Top>
        <Gallery>
          {gallery.length > 1 && (
            <Thumbs>
              {gallery.map((image, index) => (
                <Thumb
                  key={image + index}
                  type="button"
                  $active={index === activeThumb}
                  onClick={() => setActiveThumb(index)}
                  aria-label={`Ver imagem ${index + 1} de ${product.name}`}
                  aria-pressed={index === activeThumb}
                >
                  <ProductSwatch from={product.swatch[0]} to={product.swatch[1]} image={image} alt="" />
                </Thumb>
              ))}
            </Thumbs>
          )}
          <MainImage>
            <ProductSwatch
              from={product.swatch[0]}
              to={product.swatch[1]}
              image={gallery[activeThumb] ?? product.image}
              alt={product.name}
            />
          </MainImage>
        </Gallery>

        <Info>
          {product.collection && <Collection>{product.collection}</Collection>}
          <Name>{product.name}</Name>
          <Concentration>{product.concentration ?? "Eau de Parfum"}</Concentration>
          <Rule />
          {product.description && <Description>{product.description}</Description>}

          <Badges>
            <Badge>
              <StarIcon />
              High Longevity
            </Badge>
            <Badge>
              <CraftIcon />
              Sophisticated Scent
            </Badge>
            <Badge>
              <LeafIcon />
              Premium Quality
            </Badge>
            <Badge>
              <ShieldIcon />
              Cruelty Free
            </Badge>
          </Badges>

          <SizeLabel>Size</SizeLabel>
          <Sizes>
            {sizes.map((size) => (
              <SizeButton
                key={size}
                type="button"
                $active={size === activeSize}
                aria-pressed={size === activeSize}
                onClick={() => setActiveSize(size)}
              >
                {size}ml
              </SizeButton>
            ))}
          </Sizes>

          <Price>{formatPrice(product.price)}</Price>

          <AddToCart type="button" $added={added} onClick={handleAddToCart}>
            {added ? "Added to Bag" : "Add to Bag"}
            <BagIcon />
          </AddToCart>
          <BuyNow type="button" onClick={handleBuyNow}>
            Buy Now
          </BuyNow>

          <ShippingNote>
            <TruckIcon />
            Free shipping on orders over $299
          </ShippingNote>
        </Info>
      </Top>

      {product.notes && (
        <Details>
          <div>
            <SectionEyebrow>About the Fragrance</SectionEyebrow>
            <SectionTitle>The Essence of {product.name.split(" ").slice(-1)[0]}</SectionTitle>
            {product.description && <Description>{product.description}</Description>}
          </div>

          <div>
            <SectionEyebrow>Olfactory Notes</SectionEyebrow>
            <NoteGroup>
              <h4>Top Notes</h4>
              <p>{product.notes.top.join(", ")}</p>
            </NoteGroup>
            <NoteGroup>
              <h4>Heart Notes</h4>
              <p>{product.notes.heart.join(", ")}</p>
            </NoteGroup>
            <NoteGroup>
              <h4>Base Notes</h4>
              <p>{product.notes.base.join(", ")}</p>
            </NoteGroup>
          </div>
        </Details>
      )}

      <FeatureStrip>
        <Feature>
          <h3>
            <CraftIcon />
            Concentration
          </h3>
          <p>{product.concentration ?? "Eau de Parfum"}</p>
        </Feature>
        <Feature>
          <h3>
            <LeafIcon />
            Olfactory Family
          </h3>
          <p>{product.family ?? "Woody Floral"}</p>
        </Feature>
        <Feature>
          <h3>
            <StarIcon />
            Longevity
          </h3>
          <p>{product.fixation ?? "High longevity"}</p>
        </Feature>
        <Feature>
          <h3>
            <ShieldIcon />
            Occasion
          </h3>
          <p>Day and night</p>
        </Feature>
      </FeatureStrip>

      <RelatedProducts products={related} />
    </Wrap>
  );
}
