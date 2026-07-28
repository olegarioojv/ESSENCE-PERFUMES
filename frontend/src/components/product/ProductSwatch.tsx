import Image from "next/image";
import styled from "styled-components";

/**
 * Product visual: renders a real photo when `image` is provided, otherwise
 * falls back to a soft gradient + bottle silhouette placeholder (used while
 * a product still has no photography — see src/lib/data/mockProducts.ts).
 */
const Wrap = styled.div<{ $from: string; $to: string }>`
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(160deg, ${({ $from }) => $from} 0%, ${({ $to }) => $to} 100%);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const Bottle = styled.div`
  width: 34%;
  height: 46%;
  margin-bottom: 12%;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(1px);

  &::before {
    content: "";
    display: block;
    width: 40%;
    height: 16%;
    margin: -14% auto 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm} 0 0;
  }
`;

export default function ProductSwatch({
  from,
  to,
  image,
  alt = "",
}: {
  from: string;
  to: string;
  image?: string;
  alt?: string;
}) {
  if (image) {
    return (
      <Wrap $from={from} $to={to}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      </Wrap>
    );
  }

  return (
    <Wrap $from={from} $to={to} aria-hidden="true">
      <Bottle />
    </Wrap>
  );
}
