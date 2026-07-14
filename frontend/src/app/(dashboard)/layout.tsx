"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNavBar from "@/components/layout/TopNavBar";
import { LockdownSystem } from "@/components/shared/LockdownSystem";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function DashboardLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const searchParams = useSearchParams();
    const isStandalone = searchParams.get('standalone') === 'true';
    const { data: session, status } = useSession();
    const [sessionId, setSessionId] = React.useState<string>("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);
    const [isAuthorized, setIsAuthorized] = React.useState(false);

    React.useEffect(() => {
        if (status === "authenticated" || isStandalone) {
            setIsAuthorized(true);
            setSessionId(new Date().toISOString().slice(0,10).replace(/-/g,'') + "-S" + Math.floor(Date.now() / 1000).toString().slice(-4));
            
            if (session?.user?.accessToken) {
                localStorage.setItem('auth_token', session.user.accessToken);
                localStorage.setItem('auth_user', JSON.stringify(session.user));
                localStorage.setItem('auth_org_id', session.user.orgId ?? '');
            }
        } else if (status === "unauthenticated") {
            setIsAuthorized(true);
            setSessionId("GUEST-" + new Date().toISOString().slice(0,10).replace(/-/g,''));
        }
    }, [status, isStandalone]);



    if (isStandalone) {
        return (
            <div className={cn("min-h-screen text-slate-100 overflow-hidden bg-[#080C12]", fontSans.className)}>
                <LockdownSystem />
                <main className="w-full h-screen overflow-hidden">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div
            className={cn("min-h-screen text-slate-100 overflow-x-hidden", fontSans.className)}
            style={{ background: '#080C12' }}
        >
            <div className="print:hidden">
                <LockdownSystem />
                <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
            </div>

            <div className={cn(
                "flex min-h-screen flex-col transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "md:pl-[68px]" : "md:pl-[240px]",
                "print:pl-0"
            )}>
                <div className="print:hidden">
                    <TopNavBar />
                </div>

                {/* ── Slim status ribbon ── */}
                <div
                    className="hidden lg:flex items-center justify-between px-6 py-2 text-[10px] font-medium print:hidden"
                    style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background:   'rgba(8,12,18,0.6)',
                        color:        '#475569',
                    }}
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span>SESSION</span>
                            <span className="text-blue-400 font-mono text-[11px]">
                                BOUCLIER://{sessionId || "INIT"}
                            </span>
                        </div>
                        <div className="w-px h-3 bg-white/5" />
                        <div className="flex items-center gap-2">
                            <span>ENCRYPTION</span>
                            <span className="text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
                                AES-256-GCM
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="hover:text-slate-300 transition-colors cursor-default">Rules of Engagement</span>
                        <span className="text-white/10">v2.5.0</span>
                    </div>
                </div>

                {/* ── Page content ── */}
                <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            <React.Suspense fallback={<div className="min-h-screen w-full bg-[#080C12] flex items-center justify-center font-mono text-slate-500 uppercase tracking-widest text-xs">Initializing Tactical Interface...</div>}>
                <DashboardLayoutInner>{children}</DashboardLayoutInner>
            </React.Suspense>
        </NotificationProvider>
    );
}
