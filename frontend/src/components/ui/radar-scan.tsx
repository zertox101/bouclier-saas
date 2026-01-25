'use client';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Types for dynamic blips
interface Blip {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
}

export const RadarScan = () => {
    const [blips, setBlips] = useState<Blip[]>([]);

    // Generate random blips periodically
    useEffect(() => {
        // Initial blips
        setBlips(generateBlips(3));

        const interval = setInterval(() => {
            setBlips(generateBlips(Math.floor(Math.random() * 4) + 1));
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const generateBlips = (count: number) => {
        return Array.from({ length: count }).map((_, i) => ({
            id: Math.random(),
            x: Math.random() * 60 + 20, // Keep within inner circle loosely (20-80%)
            y: Math.random() * 60 + 20,
            size: Math.random() * 3 + 2,
            color: Math.random() > 0.5 ? 'bg-red-500' : 'bg-amber-400',
            delay: Math.random() * 2
        }));
    };

    return (
        <div className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] flex items-center justify-center font-mono">

            {/* --- HUD RINGS --- */}

            {/* Outer Ring with Dashes */}
            <div className="absolute inset-0 border border-slate-700/50 rounded-full flex items-center justify-center">
                <div className="w-[98%] h-[98%] border border-dashed border-cyan-900/40 rounded-full animate-[spin_60s_linear_infinite]" />
            </div>

            {/* Main Glow Ring */}
            <div className="absolute w-[85%] h-[85%] border-[1px] border-cyan-500/30 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center">
                {/* Inner detail marks */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <div
                        key={deg}
                        className="absolute w-1 h-3 bg-cyan-700/50"
                        style={{ transform: `rotate(${deg}deg) translateY(-165px)` }}
                    />
                ))}
            </div>

            {/* Mid Ring */}
            <div className="absolute w-[60%] h-[60%] border border-cyan-800/20 rounded-full"></div>

            {/* Core Ring */}
            <div className="absolute w-[20%] h-[20%] border border-cyan-500/40 rounded-full bg-cyan-500/5 flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </div>

            {/* --- CROSSHAIRS & GRID --- */}
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent top-1/2"></div>
            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-900/50 to-transparent left-1/2"></div>

            {/* Diagonals */}
            <div className="absolute w-full h-[1px] bg-cyan-900/20 top-1/2 rotate-45 transform"></div>
            <div className="absolute w-full h-[1px] bg-cyan-900/20 top-1/2 -rotate-45 transform"></div>

            {/* --- THE SCANNING BEAM (Simplified & Perfected) --- */}
            <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
                {/* Precise Cone Gradient covering full circle but transparent mostly */}
                <div
                    className="w-full h-full rounded-full"
                    style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(6, 182, 212, 0.1) 320deg, rgba(6, 182, 212, 0.5) 360deg)',
                    }}
                />

                {/* Leading Edge Line (at 0/360 degrees, pointing UP) */}
                <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-gradient-to-b from-cyan-400 to-transparent origin-bottom shadow-[0_0_8px_cyan]" />
            </motion.div>

            {/* --- BLIPS (Targets) --- */}
            {blips.map((blip) => (
                <TargetBlip key={blip.id} {...blip} />
            ))}

            {/* --- HUD DECORATION --- */}
            <div className="absolute top-4 right-10 text-[10px] text-cyan-700 font-bold tracking-widest">
                RANGE: 200KM
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/40 backdrop-blur border border-cyan-900/50 rounded text-[9px] text-cyan-400 animate-pulse tracking-widest uppercase">
                Tracking Active
            </div>
        </div>
    );
};

// Separate component for Blips
const TargetBlip = ({ x, y, size, color, delay }: Blip) => {
    return (
        <motion.div
            className={`absolute rounded-full shadow-lg ${color} blur-[1px]`}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size * 3,
                height: size * 3,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5]
            }}
            transition={{
                duration: 2,
                times: [0, 0.1, 1],
                repeat: Infinity,
                delay: delay,
                repeatDelay: 2
            }}
        >
            <div className="w-[30%] h-[30%] bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
    );
}

export default RadarScan;
