"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TrafficMap() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px]" />

            {/* Pulsing Nodes */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 80 + 10}%`,
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.path
                    d="M 50 50 Q 150 50 250 100" // Simple placeholder path
                    stroke="rgba(6,182,212,0.2)"
                    strokeWidth="1"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest">
                    Traffic Network Map
                </div>
            </div>
        </div>
    );
}
