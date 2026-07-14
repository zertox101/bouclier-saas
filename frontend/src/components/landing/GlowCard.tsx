"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
}

export function GlowCard({
  children,
  className,
  glowColor = "rgba(99, 102, 241, 0.15)",
  delay = 0,
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        "relative group rounded-2xl border border-white/[0.08] bg-[#0A0A0F] overflow-hidden transition-all duration-500",
        className
      )}
    >
      {/* Glow effect */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
        style={{ background: glowColor }}
      />

      {/* Top edge glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
