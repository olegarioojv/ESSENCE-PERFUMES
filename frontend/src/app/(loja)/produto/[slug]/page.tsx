import type { Metadata } from "next";

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Demonstrates the dynamic-metadata pattern (Metadata API) for the Fase 17
 * scaffolding stage: real data fetching from the backend `/products/:slug`
 * endpoint happens once the Produto page is actually implemented.
 */
export async function generateMetadata({
  params,
}: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: name,
    description: `Detalhes do produto ${name} na Essence Perfumes.`,
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;

  return (
    <section style={{ padding: "3rem 2rem" }}>
      <h1>Produto: {slug} (em construção)</h1>
    </section>
  );
}
