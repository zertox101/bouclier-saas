"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionHeaderProps {
  badge?: { icon: ReactNode; label: string };
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        "mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-6">
          {badge.icon}
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">
            {badge.label}
          </span>
        </div>
      )}

      <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-6 leading-tight">
        {title}
      </h2>

      {description && (
        <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  );
}
