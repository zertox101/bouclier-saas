"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Power, Globe, Wifi } from "lucide-react";
import TerminalShell from "./TerminalShell";

export default function TerminalKaliPage() {
    const router = useRouter();
    const [connected, setConnected] = useState(false);

    return (
        <div className="fixed inset-0 bg-[#050505] text-slate-200 font-sans overflow-hidden z-[100]">
            <header className="absolute top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-8 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-tighter">
                            Kali Linux Interactive Shell
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                {connected ? "CONNECTED — root@tools-api" : "OFFLINE — waiting for backend"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 px-6 border-x border-white/5">
                        <div className="flex items-center gap-2 text-[9px] text-slate-500">
                            <Globe className="w-3 h-3" /> Kali Rolling
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-slate-500">
                            <Wifi className="w-3 h-3" /> tools-api:8100
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/arsenal")}
                        className="flex items-center gap-3 px-5 py-2.5 bg-red-600/10 border border-red-500/30 rounded-xl text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                        <Power className="w-3.5 h-3.5" /> EXIT
                    </button>
                </div>
            </header>

            <main className="pt-16 w-full h-full">
                <div className="w-full h-full p-4">
                    <TerminalShell
                        visible={true}
                        wsUrl={typeof window !== "undefined" ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:8100/ws/shell` : "ws://localhost:8100/ws/shell"}
                        title="Kali Linux — root@bouclier"
                        onConnectionChange={setConnected}
                    />
                </div>
            </main>
        </div>
    );
}
