"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sessionId, setSessionId] = React.useState<string>("");

    React.useEffect(() => {
        setSessionId(Math.random().toString(36).substring(7).toUpperCase());
    }, []);

    return (
        <div className={cn(
            "min-h-screen",
            fontSans.className
        )}>
            <Sidebar />

            <div className="flex min-h-screen flex-col transition-all duration-300 md:pl-20">
                <TopNavBar />

                <header className="hidden lg:flex items-center justify-between px-10 py-2.5 text-[8px] font-black uppercase tracking-[0.4em] text-text-3 border-b border-border-1 bg-bg-1/40 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="opacity-40">SESSION_ID</span>
                            <span className="text-p-400 font-mono tracking-normal text-[10px]">BOUCLIER_{sessionId || "INITIALIZING..."}</span>
                        </div>
                        <div className="h-2 w-px bg-border-1" />
                        <div className="flex items-center gap-2">
                            <span className="opacity-40">UPLINK</span>
                            <span className="text-success flex items-center gap-1.5">
                                <div className="h-1 w-1 rounded-full bg-success animate-pulse shadow-[0_0_5px_var(--success)]" />
                                ENCRYPTED_SSL
                            </span>
                        </div>
                    </div>
                    <nav className="flex items-center gap-8 text-text-3">
                        <span className="hover:text-p-400 transition-colors cursor-help">Fleet Intelligence</span>
                        <span className="hover:text-p-400 transition-colors cursor-help">OpSec Guidelines</span>
                        <span className="hover:text-p-400 transition-colors cursor-help">v{process.env.NEXT_PUBLIC_APP_VERSION || '2.4.0'}</span>
                    </nav>
                </header>

                <main className="flex-1 p-6 lg:p-10 no-scrollbar overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
