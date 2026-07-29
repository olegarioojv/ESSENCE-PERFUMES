import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

/**
 * Static/basic sitemap for the Fase 17 scaffolding stage. Once the catalog
 * is wired to the backend (Fase 18), this should be extended to also list
 * dynamic product routes (`/produto/[slug]`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/catalogo", "/carrinho", "/checkout", "/login", "/conta"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
