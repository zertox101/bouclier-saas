"use client";
import React, { useState, useEffect } from "react";
import { 
  Database, Search, Filter, Download, 
  ExternalLink, Shield, Activity, Lock, 
  Globe, Cpu, Zap, Bug, Share2, Info,
  Brain, Server, HardDrive, Network, 
  Biohazard, Factory, ShieldAlert, CheckCircle, ShieldCheck,
  EyeOff, MailWarning, Layers, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// ── Data Categories ──────────────────────────────────────────────────────────
const DATASETS = [
  {
    category: "IoT Datasets",
    description: "Security evaluation for connected devices & Industrial IoT.",
    icon: <Cpu className="w-5 h-5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    items: [
      { name: "CIC-YNU-IoTMal 2026", year: 2026, type: "Malware/IoT", status: "New" },
      { name: "Datasense IIoT (IoT) 2025", year: 2025, type: "Industrial IoT", status: "Premium" },
      { name: "APT IIoT 2024", year: 2024, type: "APT/IoT" },
      { name: "CIC-BCCC-NRC Tabular IoT Attack 2024", year: 2024, type: "Tabular/Attack" },
      { name: "CICIoMT2024 (Medical IoT)", year: 2024, type: "IoMT" },
      { name: "CICIoV2024 (Vehicular IoT)", year: 2024, type: "IoV" },
      { name: "IoT-DIAD 2024", year: 2024, type: "Attack Detection" },
      { name: "IoV dataset 2024", year: 2024, type: "Vehicular" },
      { name: "EVSE (Electric Vehicle) 2024", year: 2024, type: "Charging Infrastructure" },
      { name: "CIC IoT Attack Dataset 2023", year: 2023, type: "Attack" },
      { name: "CIC IoT Profiling Dataset 2022", year: 2022, type: "Profiling" },
    ]
  },
  {
    category: "IDS & Network Traffic",
    description: "Core intrusion detection and packet-level telemetry.",
    icon: <Activity className="w-5 h-5" />,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    items: [
      { name: "UNSW-NB15 2024", year: 2024, type: "Intrusion Detection", status: "Popular" },
      { name: "DDoS Attack Dataset (CICEV 2023)", year: 2023, type: "DDoS" },
      { name: "DDoS Evaluation Dataset (CIC-DDoS 2019)", year: 2019, type: "DDoS" },
      { name: "IPS/IDS dataset on AWS (CSE-CIC-IDS 2018)", year: 2018, type: "AWS Traffic" },
      { name: "CIC-IDS 2017", year: 2017, type: "Classic", status: "Core" }
    ]
  },
  {
    category: "AI & Large Language Models",
    description: "Adversarial benchmarks for LLMs and AI security.",
    icon: <Brain className="w-5 h-5" />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    items: [
      { name: "SBAN datasets 2025", year: 2025, type: "LLM Security", status: "New" },
      { name: "Triple-R 2024", year: 2024, type: "LLM Robustness" }
    ]
  },
  {
    category: "Malware Analysis",
    description: "Memory forensics, obfuscation, and Android threats.",
    icon: <Biohazard className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    items: [
      { name: "CIC MalMem 2022", year: 2022, type: "Memory Forensics" },
      { name: "Evasive-PDF Mal 2022", year: 2022, type: "PDF Malware" },
      { name: "CCCS-CIC-AndMal2020", year: 2020, type: "Android Malware" },
      { name: "CICMalDroid 2020", year: 2020, type: "Android Malware" },
      { name: "Android Malware Dataset (CIC-AndMal2017)", year: 2017, type: "Android" },
    ]
  },
  {
    category: "Dark Web & Encryption",
    description: "Traffic classification for Darknet, Tor, and VPNs.",
    icon: <EyeOff className="w-5 h-5" />,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    items: [
      { name: "Darknet 2020", year: 2020, type: "Darknet Traffic" },
      { name: "Tor-nonTor dataset (ISCXTor2016)", year: 2016, type: "Tor Traffic" },
      { name: "VPN-nonVPN traffic dataset (ISCXVPN2016)", year: 2016, type: "VPN Traffic" },
    ]
  },
  {
    category: "DNS & Phishing",
    description: "Malicious URLs and DNS exfiltration patterns.",
    icon: <MailWarning className="w-5 h-5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    items: [
      { name: "CIC-Trap4Phish 2025", year: 2025, type: "Trap Analysis", status: "New" },
      { name: "CIC Bell DNS EXF 2021", year: 2021, type: "Exfiltration" },
      { name: "DNS over HTTPS (CIRA-CIC-DoHBrw2020)", year: 2020, type: "DoH" },
      { name: "URL dataset (ISCX-URL2016)", year: 2016, type: "URL Classification" },
    ]
  },
  {
    category: "Operational Tech (OT)",
    description: "SCADA, Modbus, and industrial control systems.",
    icon: <Factory className="w-5 h-5" />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    items: [
      { name: "Modbus 2023", year: 2023, type: "SCADA/ICS" }
    ]
  },
  {
    category: "Graph Learning",
    description: "Network topology and relational attack patterns.",
    icon: <Network className="w-5 h-5" />,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    items: [
      { name: "CIC-DGG 2025", year: 2025, type: "Dynamic Graph", status: "New" },
      { name: "CIC-SGG 2024", year: 2024, type: "Static Graph" }
    ]
  }
];

// ── Components ────────────────────────────────────────────────────────────────
function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-500",
      hover && "hover:border-white/10 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]",
      className
    )}>
      {children}
    </div>
  );
}

function SectionTitle({ title, icon, color }: { title: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-lg", color)}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">{title}</h2>
        <div className={cn("h-0.5 w-12 rounded-full", color.replace("text-", "bg-"))} />
      </div>
    </div>
  );
}

export default function Datasets() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(DATASETS[0].category);
  const [backendDatasets, setBackendDatasets] = useState<any[]>([]);
  const [integrating, setIntegrating] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await apiClient("/api/datasets");
        if (Array.isArray(data)) setBackendDatasets(data);
      } catch (err) {
        console.error("Dataset Fetch Error:", err);
      }
    };
    fetchDatasets();
  }, []);

  const handleIntegrate = async (name: string) => {
    setIntegrating(name);
    try {
      const data = await apiClient(`/api/datasets/integrate/${encodeURIComponent(name)}`, { method: "POST" });
      // Use a more tactical notification if possible, but alert is fine for now
      alert(`SYSTEM: Integration established for ${name}.\n${data.tasks.map((t:string) => `>> ${t}`).join("\n")}`);
    } catch (e) {
      alert("CRITICAL: Integration service unavailable.");
    } finally {
      setIntegrating(null);
    }
  };

  const currentCategory = DATASETS.find(c => c.category === activeTab) || DATASETS[0];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-300 font-sans selection:bg-blue-500/30">
      
      {/* ── TOP HUD ── */}
      <div className="relative border-b border-white/5 bg-[#0a121d]/50 backdrop-blur-md px-8 py-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#3b82f6 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between gap-10 relative z-10">
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Data Repository</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Intelligence Sync</span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter mb-4">
                TACTICAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 italic">ARSENAL</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                Centralized Command for Cybersecurity Datasets. Train, validate, and simulate 
                adversarial scenarios using high-fidelity network telemetry from the 
                Canadian Institute for Cybersecurity (CIC).
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4 min-w-[320px]">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="IDENTIFY DATA VECTORS..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white tracking-widest placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3">
                <Shield className="w-4 h-4" /> Global Access Token
              </button>
              <button className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                <Layers className="w-4 h-4" /> Index
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        <div className="grid grid-cols-12 gap-10">
          
          {/* NAVIGATION HUD */}
          <div className="col-span-12 xl:col-span-3 space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 mb-4">Classifications</p>
              <div className="flex flex-col gap-2">
                {DATASETS.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setActiveTab(cat.category)}
                    className={cn(
                      "group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 text-left border",
                      activeTab === cat.category 
                        ? "bg-white/[0.03] border-white/10 text-white shadow-xl" 
                        : "bg-transparent border-transparent text-slate-500 hover:bg-white/[0.02] hover:text-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border",
                      activeTab === cat.category ? cat.bg + " " + cat.border + " " + cat.color : "bg-white/5 border-white/5 text-slate-600 group-hover:text-slate-400"
                    )}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black truncate uppercase tracking-widest">{cat.category}</p>
                      <p className="text-[8px] text-slate-600 font-bold uppercase truncate">{cat.items.length} Vector Logs</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <GlassCard className="p-6 border-blue-500/20 bg-blue-500/[0.02]">
               <div className="flex items-center gap-3 mb-4">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">SIGINT Console</span>
               </div>
               <div className="space-y-4 font-mono text-[9px] text-slate-500">
                  <p className="flex justify-between"><span>[STATUS]</span> <span className="text-emerald-500">CONNECTED</span></p>
                  <p className="flex justify-between"><span>[ENCRYPTION]</span> <span>AES-256-GCM</span></p>
                  <p className="flex justify-between"><span>[NODES]</span> <span>42/42 ACTIVE</span></p>
                  <div className="pt-2 border-t border-white/5">
                     <p className="text-blue-400/60 leading-relaxed">
                        Ready to inject synthetic or real-world adversarial packets into training matrix.
                     </p>
                  </div>
               </div>
            </GlassCard>
          </div>

          {/* ASSET GRID */}
          <div className="col-span-12 xl:col-span-9">
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <SectionTitle title={currentCategory.category} icon={currentCategory.icon} color={currentCategory.color} />
                       <p className="text-slate-500 text-sm max-w-xl -mt-4">{currentCategory.description}</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Class</p>
                          <p className="text-xl font-black text-white">{currentCategory.items.length}</p>
                       </div>
                       <div className="w-px h-10 bg-white/5" />
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Reliability</p>
                          <p className="text-xl font-black text-emerald-400">99.8%</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentCategory.items
                      .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
                      .map((item, idx) => {
                        const backendInfo = Array.isArray(backendDatasets) ? backendDatasets.find(bd => bd.name === item.name) : null;
                        const mergedItem = backendInfo ? { ...item, ...backendInfo } : item;

                        return (
                          <GlassCard key={idx} className="p-6 group relative overflow-hidden">
                            {/* Decorative Corner */}
                            <div className={cn("absolute top-0 right-0 w-16 h-16 opacity-10 blur-2xl rounded-full -mr-8 -mt-8", currentCategory.color.replace("text-", "bg-"))} />
                            
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-1.5 h-1.5 rounded-full", currentCategory.color.replace("text-", "bg-"))} />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{mergedItem.year || "LATEST"}</span>
                                {mergedItem.integrated && (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Ready</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {mergedItem.status && (
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                    mergedItem.status === "New" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                    mergedItem.status === "Premium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  )}>
                                    {mergedItem.status}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                   {mergedItem.size || "VARIES"}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-lg font-black text-white mb-2 group-hover:text-blue-400 transition-colors tracking-tight">
                              {mergedItem.name}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed mb-8 line-clamp-2">
                              {mergedItem.description || `Specialized intelligence for ${mergedItem.type} identification and behavioral classification in heterogeneous networks.`}
                            </p>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                              <button 
                                onClick={() => handleIntegrate(mergedItem.name)}
                                disabled={integrating === mergedItem.name || mergedItem.integrated}
                                className={cn(
                                  "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50",
                                  mergedItem.integrated 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : integrating === mergedItem.name 
                                      ? "bg-white/5 text-slate-400" 
                                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                                )}
                              >
                                {integrating === mergedItem.name ? (
                                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                ) : mergedItem.integrated ? (
                                  <ShieldCheck className="w-4 h-4" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                {integrating === mergedItem.name 
                                  ? "TRANSMITTING..." 
                                  : mergedItem.integrated 
                                    ? "System Synced" 
                                    : "Integrate Engine"}
                              </button>
                              <button 
                                onClick={() => mergedItem.download_url && window.open(mergedItem.download_url, "_blank")}
                                className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/20 transition-all"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Progress Overlay (Mock) */}
                            {integrating === mergedItem.name && (
                               <div className="absolute bottom-0 left-0 h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
                            )}
                          </GlassCard>
                        );
                      })}
                  </div>
                </motion.div>
             </AnimatePresence>
          </div>

        </div>

      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
