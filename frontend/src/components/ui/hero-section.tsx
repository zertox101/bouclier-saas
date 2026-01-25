
'use client';
import { motion } from "framer-motion";
import Link from 'next/link';
import { cn } from "../../lib/utils";

export const HeroSection = () => {
    return (
        <div className="h-[40rem] w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden rounded-md relative">
            <div className="absolute inset-0 w-full h-full bg-slate-950 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

            <div className="md:text-7xl text-3xl font-bold text-center text-white relative z-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8"
                >
                    SHIELD <br /> <span className="text-4xl md:text-6xl text-blue-500">Cyber Intelligence</span>
                </motion.h1>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto z-20"
            >
                Enterprise-grade security platform powered by AI and Post-Quantum Cryptography.
                Detects 0-days in <span className="text-emerald-400 font-bold">12ms</span>.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex gap-4 z-20"
            >
                <Link href="/overview">
                    <button className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition duration-200 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                        Explore Dashboard
                    </button>
                </Link>
                <Link href="/login">
                    <button className="px-8 py-3 rounded-full border border-neutral-700 bg-black hover:bg-neutral-900 text-white transition duration-200">
                        Secure Login
                    </button>
                </Link>
            </motion.div>

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-grid-slate-800/[0.2] -z-10" />
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        </div>
    );
};
