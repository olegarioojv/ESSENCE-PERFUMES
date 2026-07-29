import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import type { Product } from "./types";

/**
 * Fallback catalog used while the NestJS backend is not reachable from the
 * sandbox preview. When VITE_API_URL is set and reachable, GET /products
 * responses replace these entirely.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "elysian-noir",
    name: "Elysian Noir",
    brand: "Maison Essence",
    price: 1290,
    compareAtPrice: 1490,
    image: p1,
    gallery: [p1, p2, p3],
    rating: 4.9,
    reviewCount: 218,
    badges: ["bestseller"],
    gender: "unissex",
    family: "Amadeirado Oriental",
    size: "100ml",
    volumes: [
      { ml: 30, price: 590 },
      { ml: 50, price: 890 },
      { ml: 100, price: 1290 },
    ],
    notes: {
      top: ["Bergamota da Calábria", "Cardamomo", "Pimenta Rosa"],
      heart: ["Rosa Búlgara", "Íris", "Jasmim Sambac"],
      base: ["Oud", "Âmbar", "Baunilha de Madagascar"],
    },
    description:
      "Uma composição sombria e sensual que traduz sofisticação em cada nota — envolvente, magnética, atemporal.",
  },
  {
    id: "2",
    slug: "rose-imperiale",
    name: "Rose Impériale",
    brand: "Haute Parfumerie",
    price: 980,
    image: p2,
    rating: 4.8,
    reviewCount: 142,
    badges: ["new"],
    gender: "feminino",
    family: "Floral Chipre",
    size: "75ml",
    notes: {
      top: ["Pêra", "Cassis", "Néroli"],
      heart: ["Rosa Damascena", "Peônia", "Magnólia"],
      base: ["Patchouli", "Musk Branco", "Sândalo"],
    },
    description:
      "Um buquê imperial de rosas damascenas destiladas ao amanhecer.",
  },
  {
    id: "3",
    slug: "blanc-mystique",
    name: "Blanc Mystique",
    brand: "Atelier Privé",
    price: 1450,
    image: p3,
    rating: 4.9,
    reviewCount: 87,
    badges: ["limited"],
    gender: "unissex",
    family: "Amadeirado Aromático",
    size: "100ml",
    notes: {
      top: ["Sálvia Branca", "Limão Siciliano"],
      heart: ["Íris Florentina", "Violeta"],
      base: ["Cedro do Atlas", "Vetiver", "Almíscar"],
    },
  },
  {
    id: "4",
    slug: "foret-obscure",
    name: "Forêt Obscure",
    brand: "Maison Essence",
    price: 1690,
    image: p4,
    rating: 4.7,
    reviewCount: 63,
    badges: ["new"],
    gender: "masculino",
    family: "Amadeirado Verde",
    size: "100ml",
    notes: {
      top: ["Pinho", "Zimbro", "Cipreste"],
      heart: ["Vetiver", "Sálvia", "Musgo de Carvalho"],
      base: ["Âmbar", "Couro", "Guaiac"],
    },
  },
  {
    id: "5",
    slug: "ambre-vintage",
    name: "Ambre Vintage 1907",
    brand: "Rare Editions",
    price: 2190,
    image: p5,
    rating: 5.0,
    reviewCount: 34,
    badges: ["limited"],
    gender: "unissex",
    family: "Oriental Âmbar",
    size: "50ml",
    notes: {
      top: ["Tangerina", "Elemi"],
      heart: ["Incenso", "Mirra", "Labdanum"],
      base: ["Âmbar Cinzento", "Baunilha Bourbon", "Benjoim"],
    },
  },
  {
    id: "6",
    slug: "or-liquide",
    name: "Or Liquide",
    brand: "Haute Parfumerie",
    price: 1590,
    compareAtPrice: 1890,
    image: p6,
    rating: 4.8,
    reviewCount: 156,
    badges: ["sale", "bestseller"],
    gender: "feminino",
    family: "Floral Gourmand",
    size: "75ml",
    notes: {
      top: ["Bergamota", "Flor de Laranjeira"],
      heart: ["Tuberosa", "Ylang-Ylang", "Mel"],
      base: ["Baunilha", "Sândalo", "Tonka"],
    },
  },
];

export function findMockProduct(slug: string) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}
