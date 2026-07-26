import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import StyledComponentsRegistry from "@/lib/registry";
import Providers from "@/components/providers/Providers";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  ),
  title: {
    default: "Essence Perfumes",
    template: "%s | Essence Perfumes",
  },
  description:
    "Essence Perfumes — perfumaria de luxo com curadoria de fragrâncias importadas e nacionais.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfairDisplay.variable} ${inter.variable}`}
    >
      <body>
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
