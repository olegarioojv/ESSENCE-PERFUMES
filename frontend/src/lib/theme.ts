/**
 * Design tokens for the Essence Perfumes storefront.
 *
 * Palette: warm neutrals (cream/ivory backgrounds), deep black for contrast,
 * and a muted gold accent — evocative of luxury perfumery packaging.
 * Typography: a serif display face for headings (evokes print/label
 * typography used by fragrance houses) paired with a clean sans-serif
 * for body copy and UI chrome.
 *
 * This is a starting point for Fase 17 scaffolding — palette/scale values
 * can be refined once real pages are designed.
 */

export const theme = {
  colors: {
    background: "#FAF7F2",
    surface: "#FFFFFF",
    surfaceAlt: "#F1EAE0",
    black: "#0E0D0C",
    ink: "#1A1816",
    gold: "#B08D57",
    goldLight: "#D4B98C",
    goldDark: "#8A6A3B",
    border: "#E4DCCB",
    muted: "#8A8377",
    danger: "#B3261E",
    success: "#2E5339",
    white: "#FFFFFF",
  },
  fonts: {
    heading: "var(--font-heading), 'Playfair Display', Georgia, serif",
    body: "var(--font-body), 'Inter', Helvetica, Arial, sans-serif",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.75rem",
    xxl: "2.5rem",
    display: "3.5rem",
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  spacing: {
    xxs: "0.25rem",
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2.5rem",
    xxl: "4rem",
  },
  radii: {
    sm: "2px",
    md: "4px",
    lg: "8px",
    pill: "999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(14, 13, 12, 0.06)",
    md: "0 4px 12px rgba(14, 13, 12, 0.08)",
    lg: "0 12px 32px rgba(14, 13, 12, 0.12)",
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  zIndices: {
    header: 100,
    overlay: 200,
    modal: 300,
    toast: 400,
  },
} as const;

export type AppTheme = typeof theme;
