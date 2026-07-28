/**
 * Mock catalog data for the storefront.
 *
 * Placeholder until Fase 18 (Integração) wires these sections up to the real
 * `/products` endpoint. `swatch` is the gradient fallback used where no real
 * product photo exists yet; `image` (public/ path) takes priority when set.
 */

export interface OlfactoryNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface HomeProduct {
  /** Real backend UUID — only present for products fetched from the API
   * (Fase 18); mock catalog entries don't have one since they were never
   * persisted anywhere. Cart operations need this, not the slug. */
  id?: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  volumeMl: number;
  rating?: number;
  reviewCount?: number;
  swatch: [string, string];
  image?: string;
  collection?: string;
  concentration?: string;
  family?: string;
  fixation?: string;
  sizes?: number[];
  notes?: OlfactoryNotes;
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
    collection: "Timeless Collection",
    concentration: "Eau de Parfum",
    family: "Woody Floral",
    fixation: "High longevity",
    sizes: [50, 100, 200],
    notes: {
      top: ["Bergamot", "Pink Pepper", "Cardamom"],
      heart: ["Jasmine", "Lavender", "Iris"],
      base: ["Amber", "Patchouli", "Sandalwood", "Musk"],
    },
  },
  {
    slug: "essence-botanical",
    name: "Essence Botanical",
    description: "A celebration of nature's purest notes.",
    price: 195,
    volumeMl: 100,
    swatch: ["#2E3B36", "#0E0D0C"],
    image: "/card2.jpeg",
    collection: "Botanical Collection",
    concentration: "Eau de Parfum",
    family: "Green Floral",
    fixation: "Moderate longevity",
    sizes: [50, 100, 200],
    notes: {
      top: ["Green Leaves", "Bergamot", "Mint"],
      heart: ["Lily of the Valley", "Jasmine", "Violet"],
      base: ["Vetiver", "Musk", "Cedar"],
    },
  },
  {
    slug: "essence-rose",
    name: "Essence Rose",
    description: "A romantic bouquet for the unforgettable moments.",
    price: 185,
    volumeMl: 100,
    swatch: ["#F2D9DD", "#B97C88"],
    image: "/card3.jpeg",
    collection: "Rose Collection",
    concentration: "Eau de Parfum",
    family: "Floral",
    fixation: "Moderate longevity",
    sizes: [50, 100, 200],
    notes: {
      top: ["Pink Pepper", "Bergamot", "Litchi"],
      heart: ["Rose", "Peony", "Lily of the Valley"],
      base: ["Musk", "Cedar", "Amber"],
    },
  },
];

export const bestSellers: HomeProduct[] = [
  {
    slug: "essence-legacy",
    name: "Essence Legacy",
    price: 195,
    volumeMl: 100,
    rating: 5,
    reviewCount: 142,
    swatch: ["#D9B98C", "#8A6A3B"],
    image: "/legacy.png",
    collection: "Timeless Collection",
    concentration: "Eau de Parfum",
    family: "Woody Floral",
    fixation: "High longevity",
    sizes: [50, 100, 200],
    notes: {
      top: ["Bergamot", "Pink Pepper", "Cardamom"],
      heart: ["Jasmine", "Lavender", "Iris"],
      base: ["Amber", "Patchouli", "Sandalwood", "Musk"],
    },
  },
  {
    slug: "essence-midnight",
    name: "Essence Midnight",
    price: 195,
    volumeMl: 100,
    rating: 5,
    reviewCount: 118,
    swatch: ["#1A1816", "#0E0D0C"],
    image: "/midnight.png",
    collection: "Midnight Collection",
    concentration: "Eau de Parfum",
    family: "Oriental Woody",
    fixation: "High longevity",
    sizes: [50, 100, 200],
    notes: {
      top: ["Black Pepper", "Bergamot", "Saffron"],
      heart: ["Oud", "Rose", "Leather"],
      base: ["Amber", "Vanilla", "Sandalwood"],
    },
  },
  {
    slug: "essence-vetiver",
    name: "Essence Vetiver",
    price: 195,
    volumeMl: 100,
    rating: 4,
    reviewCount: 68,
    swatch: ["#5B5A2E", "#2A2A18"],
    image: "/vetiver.png",
    collection: "Vetiver Collection",
    concentration: "Eau de Parfum",
    family: "Woody Aromatic",
    fixation: "High longevity",
    sizes: [50, 100, 200],
    notes: {
      top: ["Bergamot", "Grapefruit", "Petitgrain"],
      heart: ["Vetiver", "Geranium", "Pepper"],
      base: ["Cedar", "Oakmoss", "Musk"],
    },
  },
  {
    slug: "essence-aura",
    name: "Essence Aura",
    price: 205,
    volumeMl: 100,
    rating: 5,
    reviewCount: 52,
    swatch: ["#E9E6F0", "#B9AFC9"],
    image: "/aura.png",
    collection: "Aura Collection",
    concentration: "Eau de Parfum",
    family: "Musky Floral",
    fixation: "High longevity",
    sizes: [50, 100, 200],
    notes: {
      top: ["Pear", "Pink Pepper", "Mandarin"],
      heart: ["White Musk", "Jasmine", "Iris"],
      base: ["Ambrette", "Sandalwood", "Vanilla"],
    },
  },
];

export const allProducts: HomeProduct[] = [...essenceCollection, ...bestSellers];

export function findProductBySlug(slug: string): HomeProduct | undefined {
  return allProducts.find((product) => product.slug === slug);
}

export function relatedProducts(slug: string, count = 4): HomeProduct[] {
  return allProducts.filter((product) => product.slug !== slug).slice(0, count);
}

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

/**
 * Mock account data for the "Minha Conta" page — stands in for the real
 * `/users/me`, `/orders`, `/addresses` etc. endpoints until Fase 18.
 */
export interface MockOrder {
  id: string;
  date: string;
  itemCount: number;
  status: "delivered" | "shipping" | "processing";
  total: number;
}

export const mockUser = {
  name: "João Victor",
  email: "joaovictor@email.com",
  phone: "(35) 99999-9999",
  birthDate: "1999-07-15",
  cpf: "000.000.000-00",
  gender: "Masculino",
};

export const mockOrders: MockOrder[] = [
  { id: "#12345", date: "2026-07-27", itemCount: 4, status: "delivered", total: 1259.64 },
  { id: "#12320", date: "2026-07-10", itemCount: 2, status: "shipping", total: 699.8 },
  { id: "#12288", date: "2026-07-01", itemCount: 3, status: "processing", total: 1049.7 },
  { id: "#12210", date: "2026-06-15", itemCount: 1, status: "delivered", total: 349.9 },
];

export const mockAddress = {
  label: "Principal",
  street: "Rua das Flores, 123",
  complement: "Apto 45 — Centro",
  city: "Extrema, MG — 37640-000",
  country: "Brasil",
  phone: "(35) 99999-9999",
};

export const mockPaymentMethods = [
  { brand: "Visa", last4: "4242", expiry: "04/2028", isDefault: true },
  { brand: "Mastercard", last4: "8888", expiry: "09/2027", isDefault: false },
];

export const mockFavorites: HomeProduct[] = [essenceCollection[0], essenceCollection[2]];
