"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
}

const directionMap: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  scale: { scale: 0.9 },
};

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
}: ScrollRevealProps) {
  const initial = directionMap[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...initial }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
