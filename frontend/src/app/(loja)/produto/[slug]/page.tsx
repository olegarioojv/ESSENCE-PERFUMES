import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import { findProductBySlug, relatedProducts } from "@/lib/data/mockProducts";

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  return {
    title: product?.name ?? "Produto",
    description: product?.description ?? `Detalhes do produto na Essence Perfumes.`,
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} related={relatedProducts(slug)} />;
}
