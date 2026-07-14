"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Database, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const Datasets = dynamic(
  () => import("@/components/dashboard/Datasets"),
  { ssr: false }
);

const CICIDSLiveStream = dynamic(
  () => import("@/components/dashboard/CICIDSLiveStream"),
  { ssr: false }
);

export default function DatasetsPage() {
  const [activeTab, setActiveTab] = useState<"registry" | "live">("registry");

  return (
    <main className="h-full">
      {/* Tab switcher */}
      <div className="flex items-center gap-2 px-8 pt-6 pb-0 border-b border-white/5 bg-[#050b14]">
        <button
          onClick={() => setActiveTab("registry")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
            activeTab === "registry"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <Database className="w-3.5 h-3.5" />
          Dataset Registry
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
            activeTab === "live"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <Radio className="w-3.5 h-3.5" />
          Live Stream
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] text-cyan-400">NEW</span>
        </button>
      </div>

      {activeTab === "registry" ? <Datasets /> : <CICIDSLiveStream />}
    </main>
  );
}
