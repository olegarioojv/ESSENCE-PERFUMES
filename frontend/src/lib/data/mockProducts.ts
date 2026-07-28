/**
 * Mock catalog data for the storefront home page.
 *
 * Placeholder until Fase 18 (Integração) wires these sections up to the real
 * `/products` endpoint. `swatch` is the gradient fallback used where no real
 * product photo exists yet; `image` (public/ path) takes priority when set.
 */

export interface HomeProduct {
  slug: string;
  name: string;
  description?: string;
  price: number;
  volumeMl: number;
  rating?: number;
  reviewCount?: number;
  swatch: [string, string];
  image?: string;
}

export const essenceCollection: HomeProduct[] = [
  {
    slug: "essence-legacy",
    name: "Essence Legacy",
    description: "Timeless elegance for those who leave a mark.",
    price: 195,
    volumeMl: 100,
    swatch: ["#D9B98C", "#8A6A3B"],
    image: "/card1.jpeg",
  },
  {
    slug: "essence-botanical",
    name: "Essence Botanical",
    description: "A celebration of nature's purest notes.",
    price: 195,
    volumeMl: 100,
    swatch: ["#2E3B36", "#0E0D0C"],
    image: "/card3.jpeg",
  },
  {
    slug: "essence-midnight",
    name: "Essence Midnight",
    description: "Mysterious and captivating. Made for the unforgettable.",
    price: 195,
    volumeMl: 100,
    swatch: ["#1A1816", "#0E0D0C"],
    image: "/card2.jpeg",
  },
];

export const bestSellers: HomeProduct[] = [
  {
    slug: "essence-intense",
    name: "Essence Intense",
    price: 195,
    volumeMl: 100,
    rating: 5,
    reviewCount: 128,
    swatch: ["#1A1816", "#0E0D0C"],
  },
  {
    slug: "velvet-noir",
    name: "Velvet Noir",
    price: 185,
    volumeMl: 100,
    rating: 5,
    reviewCount: 95,
    swatch: ["#5A1A24", "#1A0A0D"],
    image: "/best1.png",
  },
  {
    slug: "lumiere",
    name: "Lumière",
    price: 195,
    volumeMl: 100,
    rating: 4,
    reviewCount: 87,
    swatch: ["#EDE3D0", "#B08D57"],
  },
  {
    slug: "oud-supreme",
    name: "Oud Suprême",
    price: 195,
    volumeMl: 100,
    rating: 4,
    reviewCount: 73,
    swatch: ["#5B5A4E", "#2A2A22"],
  },
];

export interface Testimonial {
  name: string;
  quote: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Sophia L.",
    quote:
      "Essence Perfumes has completely elevated my everyday. The quality, the packaging, the scent — absolutely unmatched.",
    rating: 5,
  },
  {
    name: "James R.",
    quote:
      "Every fragrance tells a story. Essence is not just a perfume, it's an experience.",
    rating: 5,
  },
  {
    name: "Olivia M.",
    quote:
      "I've never received so many compliments. Essence is truly in a league of its own.",
    rating: 5,
  },
];
