import Link from "next/link";
import { Shield, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
    Product: [
        { name: "Features", href: "/product" },
        { name: "Security", href: "/security" },
        { name: "Pricing", href: "/pricing" },
    ],
    Company: [
        { name: "About", href: "/" },
        { name: "Contact", href: "/contact" },
    ],
    Legal: [
        { name: "Terms", href: "/terms" },
        { name: "Privacy", href: "/privacy" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-white py-12 md:py-24 border-t border-slate-100">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-nokod-black flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-nokod-black tracking-tighter uppercase">BOUCLIER</span>
                        </Link>
                        <p className="mt-6 max-w-xs text-sm text-slate-500 leading-relaxed font-medium">
                            Enterprise-grade security framework designed for next-generation Blue Teams. Real-time monitoring, AI-driven analysis, and automated response.
                        </p>
                        <div className="mt-8 flex gap-6">
                            <Twitter className="h-5 w-5 text-slate-400 hover:text-nokod-black cursor-pointer transition-colors" />
                            <Github className="h-5 w-5 text-slate-400 hover:text-nokod-black cursor-pointer transition-colors" />
                            <Linkedin className="h-5 w-5 text-slate-400 hover:text-nokod-black cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="text-sm font-black text-nokod-black uppercase tracking-widest">{category}</h3>
                            <ul className="mt-6 space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm font-medium text-slate-500 hover:text-nokod-purple transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-20 border-t border-slate-100 pt-10 text-center md:text-left md:flex md:justify-between items-center text-slate-400">
                    <p className="text-xs font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Bouclier Security Corp.
                    </p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <span className="text-xs font-bold uppercase tracking-widest">Privacy Policy</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
