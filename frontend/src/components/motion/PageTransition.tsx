"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Reusable fade/slide-in wrapper for page-level content, built on Framer
 * Motion. Used by the (loja) and (admin) layouts so every page gets a
 * consistent, subtle entrance transition without each page needing to know
 * about animation.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
