"use client";

import React from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "@/lib/theme";
import { GlobalStyle } from "@/lib/GlobalStyle";

/**
 * Client-side providers wrapper: styled-components ThemeProvider + the
 * global reset/base styles. Kept separate from the styled-components SSR
 * registry (`lib/registry.tsx`) so each concern stays isolated.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
