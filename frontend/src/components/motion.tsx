import { motion, useReducedMotion, type MotionProps, type Variants } from "framer-motion";
import type { ComponentProps } from "react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Wrapper that fades/rises in when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function MDiv(props: ComponentProps<typeof motion.div>) {
  return <motion.div {...props} />;
}
