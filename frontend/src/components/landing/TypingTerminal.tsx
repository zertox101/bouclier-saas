"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypingTerminalProps {
  lines: string[];
  speed?: number;
  lineDelay?: number;
  className?: string;
}

export function TypingTerminal({
  lines,
  speed = 30,
  lineDelay = 800,
  className,
}: TypingTerminalProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  useEffect(() => {
    if (currentLine >= lines.length) {
      const timer = setTimeout(() => {
        setCurrentLine(0);
        setCurrentChar(0);
        setDisplayedLines([]);
      }, 3000);
      return () => clearTimeout(timer);
    }

    const line = lines[currentLine];
    if (currentChar < line.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const newLines = [...prev];
          newLines[currentLine] = line.substring(0, currentChar + 1);
          return newLines;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, lineDelay);
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, lines, speed, lineDelay]);

  return (
    <div className={`font-mono text-[12px] leading-relaxed ${className || ""}`}>
      <AnimatePresence>
        {displayedLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={
              line?.includes("✓") || line?.includes("ok") || line?.includes("granted")
                ? "text-emerald-400"
                : line?.includes("ALERT") || line?.includes("CRITICAL") || line?.includes("detected")
                  ? "text-red-400"
                  : "text-slate-400"
            }
          >
            {line}
            {i === currentLine && currentLine < lines.length && (
              <span className="inline-block w-2 h-4 bg-white/50 ml-0.5 animate-pulse" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
