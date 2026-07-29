import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import { fetchProductBySlug, fetchProducts } from "@/lib/api/products";

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  return {
    title: product?.name ?? "Produto",
    description: product?.description ?? `Detalhes do produto na Essence Perfumes.`,
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await fetchProducts();
  const related = allProducts.filter((item) => item.slug !== slug).slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
