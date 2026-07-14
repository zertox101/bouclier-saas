import type { Metadata } from "next";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "CyberDetect | Next-Gen SOC Platform",
    description: "SOC Platform + Purple Team + Security Tools. Detect threats in real-time with enterprise-grade security operations.",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={cn("min-h-screen bg-[#020205] text-[#e0e0e0] font-sans flex flex-col", fontSans.className)}>
            <PublicNavbar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}

