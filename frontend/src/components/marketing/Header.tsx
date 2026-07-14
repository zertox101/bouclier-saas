"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Product", href: "/product" },
    { name: "Academic Labs", href: "/pricing" },
    { name: "Security", href: "/security" },
    { name: "Docs", href: "/docs" },
];

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-7xl transition-all duration-500",
                scrolled ? "top-4" : "top-8"
            )}
        >
            <div className="nokod-glass rounded-full px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nokod-black">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-nokod-black uppercase">BOUCLIER</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "text-sm font-semibold px-4 py-2 rounded-full transition-all hover:bg-slate-100",
                                pathname === link.href ? "text-nokod-purple" : "text-slate-600"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="hidden sm:block text-sm font-bold text-slate-500 hover:text-nokod-black transition-colors px-4"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/overview"
                        className="rounded-full bg-nokod-black px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
                    >
                        Go to App
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="mt-4 mx-2 nokod-glass rounded-3xl p-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-bold text-slate-900 hover:text-nokod-purple"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/overview"
                            className="mt-2 w-full rounded-2xl bg-nokod-black px-5 py-4 text-center font-bold text-white"
                        >
                            Launch Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
