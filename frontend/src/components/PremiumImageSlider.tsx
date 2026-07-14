"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shield, Globe, Cpu } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        image: "/assets/slider/s1.png",
        title: "CYBER COMMAND_CENTER",
        subtitle: "Real-time threat monitoring and response execution.",
        icon: Shield,
        color: "text-p-400"
    },
    {
        id: 2,
        image: "/assets/slider/s2.png",
        title: "GLOBAL THREAT_MAP",
        subtitle: "Visualizing digital warfare vectors across the globe.",
        icon: Globe,
        color: "text-danger"
    },
    {
        id: 3,
        image: "/assets/slider/s3.png",
        title: "SENTINEL_AI CORE",
        subtitle: "Autonomous defense algorithms active. System Secure.",
        icon: Cpu,
        color: "text-success"
    }
];

export function PremiumImageSlider() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % SLIDES.length);
        }, 5000); // Auto-advance every 5s
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setIndex((prev) => (prev + 1) % SLIDES.length);
    const prevSlide = () => setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    const Icon = SLIDES[index].icon;

    return (
        <div className="relative w-full h-[400px] md:h-[600px] rounded-[40px] overflow-hidden border border-border-1 bg-bg-0 shadow-2xl group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${SLIDES[index].image})` }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-0 via-bg-0/60 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
                <motion.div
                    key={`content-${index}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-3xl space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 ${SLIDES[index].color}`}>
                            {Icon && <Icon className="w-6 h-6" />}
                        </div>
                        <span className={`text-xs font-black uppercase tracking-[0.3em] ${SLIDES[index].color}`}>
                            System Status :: Active
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        {SLIDES[index].title}
                    </h2>

                    <p className="text-lg text-text-3 font-medium max-w-xl border-l-2 border-p-500/50 pl-4">
                        {SLIDES[index].subtitle}
                    </p>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-12 right-12 z-20 flex items-center gap-4">
                <button
                    onClick={prevSlide}
                    className="p-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group/btn"
                >
                    <ChevronLeft className="w-6 h-6 text-white group-hover/btn:-translate-x-1 transition-transform" />
                </button>
                <div className="flex gap-2">
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-p-500' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={nextSlide}
                    className="p-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group/btn"
                >
                    <ChevronRight className="w-6 h-6 text-white group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
