"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { NeonButton } from "@/components/ui/NeonButton"
import Link from "next/link"

interface Slide {
    id: number
    title: string
    subtitle: string
    image: string
    cta?: string
}

const slides: Slide[] = [
    {
        id: 1,
        title: "PREDICTIVE SIGNAL INTELLIGENCE",
        subtitle: "Intercept threats before they breach your perimeter with autonomous AI nodes.",
        image: "/slides/cyber-1.webp",
        cta: "Start Free Trial"
    },
    {
        id: 2,
        title: "QUANTUM-RESISTANT OPS CENTER",
        subtitle: "A unified command interface for global telemetry monitoring and remediation.",
        image: "/slides/cyber-2.webp",
        cta: "Watch Demo"
    },
    {
        id: 3,
        title: "PURPLE TEAM AUTOMATION",
        subtitle: "Continuous security validation against the latest 0-day exploits.",
        image: "/slides/cyber-3.webp"
    },
    {
        id: 4,
        title: "GOVERNANCE AT SCALE",
        subtitle: "Audit-ready reports and compliance monitoring for enterprise infrastructures.",
        image: "/slides/cyber-4.webp"
    },
    {
        id: 5,
        title: "REAL-TIME ADVERSARY TRACKING",
        subtitle: "Watch the execution tree of every signal with nanosecond precision.",
        image: "/slides/cyber-5.webp"
    },
    {
        id: 6,
        title: "THE ULTIMATE DIGITAL SHIELD",
        subtitle: "Self-hosted, Docker-first, and secured by default architecture.",
        image: "/slides/cyber-6.webp"
    }
]

export function HeroSlider() {
    const [current, setCurrent] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, [])

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }

    useEffect(() => {
        if (isHovered) return
        const timer = setInterval(nextSlide, 6000)
        return () => clearInterval(timer)
    }, [nextSlide, isHovered])

    return (
        <div
            className="relative w-full h-[500px] md:h-[700px] overflow-hidden rounded-3xl border border-white/10 glass"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {/* Background Image Placeholder or Real Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform ease-linear scale-110"
                        style={{
                            transitionDuration: '10000ms',
                            backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 1)), url(${slides[current].image})`,
                            backgroundColor: '#020617'
                        }}
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-7xl font-black text-white tracking-widest mb-4 neon-glow uppercase">
                                {slides[current].title}
                            </h2>
                            <p className="max-w-2xl text-slate-400 text-lg md:text-xl font-medium mb-8 uppercase tracking-widest">
                                {slides[current].subtitle}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/login">
                                    <NeonButton size="lg">Access Platform</NeonButton>
                                </Link>
                                <Link href="/security">
                                    <NeonButton variant="outline" size="lg">Infrastructure</NeonButton>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute bottom-10 left-10 flex items-center gap-4 z-30">
                <button
                    onClick={prevSlide}
                    className="p-3 rounded-full glass border border-white/5 hover:bg-white/10 transition-colors text-white"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={cn(
                                "w-12 h-1.5 rounded-full transition-all duration-500",
                                current === i ? "bg-violet-600 neon-border shadow-violet-500/50" : "bg-white/10 hover:bg-white/20"
                            )}
                        />
                    ))}
                </div>
                <button
                    onClick={nextSlide}
                    className="p-3 rounded-full glass border border-white/5 hover:bg-white/10 transition-colors text-white"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Decorative Scanline */}
            <div className="scanline" />
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
