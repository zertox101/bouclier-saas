"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full bg-border-subtle animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--blue-400)] transition-all overflow-hidden focus:outline-none"
      title="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : -90,
          scale: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="absolute"
      >
        <Moon size={18} />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: theme === "light" ? 0 : 90,
          scale: theme === "light" ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="absolute text-warning"
      >
        <Sun size={18} />
      </motion.div>
    </button>
  );
}
