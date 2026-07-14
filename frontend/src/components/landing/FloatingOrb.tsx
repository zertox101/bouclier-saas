"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingOrbProps {
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FloatingOrb({
  size = 300,
  color = "rgba(99, 102, 241, 0.15)",
  delay = 0,
  duration = 8,
  className,
}: FloatingOrbProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        scale: [0.8, 1.2, 0.9, 1.1, 0.8],
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn("absolute rounded-full blur-3xl pointer-events-none", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
    />
  );
}
