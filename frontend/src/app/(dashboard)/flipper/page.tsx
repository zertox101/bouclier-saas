"use client";

import { useState, useEffect, useRef } from "react";
import {
    Wifi, Rss, Zap, Smartphone, Radio, Cpu, Activity, Terminal,
    Play, Square, RefreshCw, Shield, Lock, Eye, Database,
    FileCode, Settings, Globe, Monitor, HardDrive, Download,
    AlertTriangle, Flame, Binary, Layers, ChevronRight, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// --- Types ---

interface LogEntry {
    id: string;
    timestamp: string;
    level: "info" | "success" | "warning" | "error" | "debug";
    module: string;
    message: string;
}

interface WiFiNetwork {
    ssid: string;
    bssid: string;
    channel: number;
    signal: number;
    security: "OPEN" | "WPA2" | "WPA3" | "WEP";
}

interface Payload {
    id: string;
    name: string;
    description: string;
    category: "Exfiltration" | "Credential" | "System" | "Prank";
    os: "Windows" | "Linux" | "Mac" | "Android";
}

// --- Constants ---

const PAYLOAD_LIBRARY: Payload[] = [
    { id: "1", name: "PassGrabber", description: "Collects WiFi passwords and browser credentials.", category: "Credential", os: "Windows" },
    { id: "2", name: "ReverseShell", description: "Establishes a persistent reverse connection to C2 server.", category: "Exfiltration", os: "Linux" },
    { id: "3", name: "Exfil_Docs", description: "Zips and uploads .docx and .pdf files from Document folder.", category: "Exfiltration", os: "Windows" },
    { id: "4", name: "DefeatAMSI", description: "Bypasses AMSI and disables Windows Defender temporarily.", category: "System", os: "Windows" },
    { id: "5", name: "RickRoll", description: "Opens YouTube and plays the classic Never Gonna Give You Up.", category: "Prank", os: "Windows" },
];

import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function FlipperDashboard() {
    const apiBase = process.env.NEXT_PUBLIC_TOOLS_API_BASE || 'http://localhost:8100';
    const [activeTab, setActiveTab] = useState<"emulation" | "wifi" | "payloads" | "scripts" | "traffic" | "docker">("emulation");
    const [platformMode] = useLocalStorage<"simulator" | "emulation">("platform-mode", "emulation");

    const [isFlipperConnected, setIsFlipperConnected] = useState(false);
    const [isAlfaConnected, setIsAlfaConnected] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [cpuUsage, setCpuUsage] = useState(1.2);
    const [isRunning, setIsRunning] = useState(false);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [stats, setStats] = useState<any[]>([
        { label: "Docker CPU", value: "1.2%", color: "text-cyan-400" },
        { label: "Memory", value: "256MB", color: "text-purple-400" },
        { label: "Active Containers", value: "2", color: "text-emerald-400" },
        { label: "Detected Signals", value: "12", color: "text-amber-400" },
        { label: "WiFi Range", value: "45m", color: "text-blue-400" },
    ]);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        apiClient("/api/flipper/stats").then((d: any) => {
            if (d) setStats([
                { label: "Active Sessions", value: String(d.active_sessions), color: "text-cyan-400" },
                { label: "Payloads", value: String(d.total_payloads), color: "text-purple-400" },
                { label: "Deployments Today", value: String(d.deployments_today), color: "text-emerald-400" },
                { label: "Success Rate", value: d.success_rate, color: "text-blue-400" },
            ]);
        }).catch(() => {});
    }, []);

    // --- Functions ---

    const addLog = (message: string, level: LogEntry["level"] = "info", module: string = "SYSTEM") => {
        const newLog: LogEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            level,
            module: module.toUpperCase(),
            message,
        };
        setLogs((prev) => [...prev.slice(-49), newLog]);
    };

    const runTool = async (toolId: string, input: any = {}) => {
        if (isRunning) {
            addLog("An operation is already running. Please wait or terminate it.", "warning");
            return;
        }

        try {
            const res = await fetch(`${apiBase}/tools/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool_id: toolId, input }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Execution failed");
            }

            const data = await res.json();
            setActiveJobId(data.job_id);
            setIsRunning(true);
            addLog(`Started tool: ${toolId}`, "info", "API");

            // Start polling
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${apiBase}/tools/jobs/${data.job_id}`);
                    const statusData = await statusRes.json();

                    // Update logs
                    if (statusData.logs && statusData.logs.length > logs.length) {
                        const newLogs = statusData.logs.map((L: any, i: number) => ({
                            id: `job-${data.job_id}-${i}`,
                            timestamp: new Date(L.timestamp * 1000).toLocaleTimeString([], { hour12: false }),
                            level: L.level,
                            module: "DOCKER",
                            message: L.message
                        }));
                        setLogs(newLogs);
                    }

                    if (statusData.status !== "running") {
                        setIsRunning(false);
                        setActiveJobId(null);
                        if (pollRef.current) clearInterval(pollRef.current);
                        addLog(`Job ${toolId} completed with status: ${statusData.status}`, statusData.status === "completed" ? "success" : "error", "API");
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 1000);

        } catch (err: any) {
            addLog(`Error: ${err.message}`, "error", "API");
        }
    };

    const toggleFlipper = () => {
        if (!isFlipperConnected) {
            addLog("Initializing Flipper Zero Bridge...", "info");
            setTimeout(() => {
                setIsFlipperConnected(true);
                addLog("Flipper Zero connected over USB successfully.", "success", "USB");
                addLog("Firmware: Unleashed v1.2.4 detected.", "info", "FIRMWARE");
            }, 800);
        } else {
            setIsFlipperConnected(false);
            addLog("Flipper Zero disconnected.", "warning", "USB");
        }
    };

    const toggleAlfa = () => {
        if (!isAlfaConnected) {
            addLog("Initializing Alfa WiFi Adapter (AR9271)...", "info");
            setTimeout(() => {
                setIsAlfaConnected(true);
                addLog("Alfa Card connected & Monitor Mode enabled.", "success", "WIFI-DEV");
            }, 1000);
        } else {
            setIsAlfaConnected(false);
            addLog("Alfa Card stopped.", "warning", "WIFI-DEV");
        }
    };

    // --- Hooks ---

    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage((prev) => {
                const next = prev + (Math.random() - 0.5) * 0.5;
                return Math.max(0.1, Math.min(next, 5.0));
            });
        }, 2000);
        return () => {
            clearInterval(interval);
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    // --- Sub-components ---

    const StatPanel = ({ label, value, color }: { label: string; value: string; color: string }) => (
        <div className="cyber-panel p-4 flex flex-col justify-between border-white/5 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <Activity className="h-8 w-8" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={cn("text-xl font-black mt-1", color)}>{value}</span>
            <div className="mt-2 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    className={cn("h-full", color.replace('text', 'bg'))}
                />
            </div>
        </div>
    );

    const EmulationCard = ({
        title,
        icon: Icon,
        frequency,
        status,
        onStart
    }: {
        title: string;
        icon: any;
        frequency?: string;
        status: "idle" | "capturing" | "emulating";
        onStart: () => void;
    }) => (
        <div className="cyber-panel p-6 border-white/5 group hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden">
            {status !== "idle" && <div className="scanline" />}
            <div className="flex items-start justify-between mb-6">
                <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all",
                    status === "idle" ? "bg-slate-900 border-white/5 text-slate-500" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 cyber-glow-cyan"
                )}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Signal_ID</span>
                    <span className="text-[12px] font-bold text-white font-mono">{frequency || "---"}</span>
                </div>
            </div>

            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-[10px] text-slate-500 font-medium mb-6 uppercase tracking-tight">Status: {status}</p>

            <div className="flex gap-2">
                <button
                    onClick={onStart}
                    className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                        status === "idle" ? "bg-slate-900 text-slate-400 hover:bg-slate-800" : "bg-cyan-500 text-black shadow-xl"
                    )}
                >
                    {status === "idle" ? <Play className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                    {status === "idle" ? "Initialize" : "Running"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="container p-8 max-w-7xl mx-auto space-y-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 cyber-panel p-8 border-cyan-500/10">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className={cn(
                            "absolute -inset-2 rounded-full blur-xl opacity-20 transition-all duration-1000",
                            isFlipperConnected ? "bg-cyan-500" : "bg-slate-800"
                        )}></div>
                        <div className={cn(
                            "relative h-16 w-16 rounded-2xl flex items-center justify-center border transition-all duration-500",
                            isFlipperConnected ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-slate-900 border-white/5 text-slate-700"
                        )}>
                            <Smartphone className="h-8 w-8" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Flipper Command Center</h1>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                isFlipperConnected ? "bg-emerald-400/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/10 border-white/5 text-slate-600"
                            )}>
                                {isFlipperConnected ? "Synced_Ready" : "Offline"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                                Model: ZERO-X // Link: {isFlipperConnected ? "USB-C Realtime" : "None"}
                            </span>
                            <div className="h-4 w-px bg-white/5" />
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "h-1.5 w-1.5 rounded-full animate-pulse",
                                    platformMode === "emulation" ? "bg-success" : "bg-amber-400"
                                )} />
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    platformMode === "emulation" ? "text-success" : "text-amber-400"
                                )}>
                                    C2 Simulator: {platformMode === "emulation" ? "Active" : "Standby"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleFlipper}
                        className={cn(
                            "px-6 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                            isFlipperConnected ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-cyan-500 text-black"
                        )}
                    >
                        {isFlipperConnected ? "Terminate Connection" : "Connect Device"}
                    </button>
                    <button
                        onClick={toggleAlfa}
                        className={cn(
                            "px-6 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                            isAlfaConnected ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-slate-900 border-white/5 text-slate-400"
                        )}
                    >
                        {isAlfaConnected ? "Stop Alfa Card" : "Initialize Alfa"}
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.map((s, i) => (
                    <StatPanel key={i} label={s.label} value={s.value} color={s.color} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Navigation & Controls */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-slate-950/50 rounded-2xl border border-white/5 backdrop-blur-xl">
                        {[
                            { id: "emulation", label: "Emulation", icon: Rss },
                            { id: "wifi", label: "WiFi Scanner", icon: Wifi },
                            { id: "payloads", label: "Payloads", icon: Zap },
                            { id: "scripts", label: "Scripts", icon: FileCode },
                            { id: "traffic", label: "Traffic", icon: Activity },
                            { id: "docker", label: "Docker", icon: Layers },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-xl"
                                        : "text-slate-600 hover:text-white"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Render */}
                    <div className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {activeTab === "emulation" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <EmulationCard
                                        title="RFID [125 kHz]"
                                        icon={Cpu}
                                        frequency="125 kHz"
                                        status="idle"
                                        onStart={() => addLog("RFID Reader initialized. Waiting for badge...", "info", "RFID")}
                                    />
                                    <EmulationCard
                                        title="NFC [13.56 MHz]"
                                        icon={Rss}
                                        frequency="13.56 MHz"
                                        status="idle"
                                        onStart={() => addLog("NFC Dictionary attack starting...", "warning", "NFC")}
                                    />
                                    <EmulationCard
                                        title="Sub-GHz"
                                        icon={Radio}
                                        frequency="433.92 MHz"
                                        status="idle"
                                        onStart={() => addLog("Scanning Sub-GHz spectrum...", "info", "RF-SCAN")}
                                    />
                                    <EmulationCard
                                        title="Bad USB"
                                        icon={Usb}
                                        status="idle"
                                        onStart={() => addLog("Injecting keystrokes: HID_READY", "success", "BAD-USB")}
                                    />
                                    <EmulationCard
                                        title="Infrared"
                                        icon={Monitor}
                                        status="idle"
                                        onStart={() => addLog("IR Universal Remote library loaded.", "info", "IR-TV")}
                                    />
                                    <div className="cyber-panel p-6 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-700 hover:text-cyan-500/50 transition-colors cursor-pointer group">
                                        <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Add Custom Protocol</span>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "wifi" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="cyber-panel p-6 border-white/5"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-widest">WiFi Spectrum Analysis</h2>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Using Alfa Network Adapter AR9271</p>
                                        </div>
                                        <button
                                            onClick={() => addLog("Starting spectrum scan on channels 1-14...", "info", "WIFI")}
                                            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-500/20"
                                        >
                                            Scan Spectrum
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/5 text-left">
                                                    <th className="py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">SSID</th>
                                                    <th className="py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">BSSID</th>
                                                    <th className="py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">CH</th>
                                                    <th className="py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Signal</th>
                                                    <th className="py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Security</th>
                                                    <th className="py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {[
                                                    { ssid: "Corporate_HQ", bssid: "00:1E:C9:44:B1", ch: 6, sig: -42, sec: "WPA2-EAP" },
                                                    { ssid: "Guest_WiFi", bssid: "00:1E:C9:44:B2", ch: 11, sig: -65, sec: "OPEN" },
                                                    { ssid: "Secret_IOT", bssid: "F4:BD:9E:12:33", ch: 1, sig: -82, sec: "WPA3" },
                                                ].map((net, idx) => (
                                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                                        <td className="py-4 text-[11px] font-black text-white font-mono">{net.ssid}</td>
                                                        <td className="py-4 text-[10px] font-bold text-slate-500 font-mono">{net.bssid}</td>
                                                        <td className="py-4 text-[11px] font-bold text-slate-400">{net.ch}</td>
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold text-emerald-400 font-mono">{net.sig}dBm</span>
                                                                <div className="flex gap-0.5">
                                                                    {[1, 2, 3, 4].map((bar) => (
                                                                        <div
                                                                            key={bar}
                                                                            className={cn(
                                                                                "w-1 h-3 rounded-full",
                                                                                bar <= (net.sig > -50 ? 4 : net.sig > -70 ? 3 : 2) ? "bg-emerald-400" : "bg-slate-800"
                                                                            )}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={cn(
                                                                "text-[9px] px-2 py-0.5 rounded font-black uppercase",
                                                                net.sec === "OPEN" ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"
                                                            )}>
                                                                {net.sec}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex gap-2">
                                                                <button className="p-1.5 hover:text-red-400 transition-colors" title="Deauth client">
                                                                    <Shield className="h-4 w-4" />
                                                                </button>
                                                                <button className="p-1.5 hover:text-cyan-400 transition-colors" title="Crack WPA">
                                                                    <Binary className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "payloads" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {PAYLOAD_LIBRARY.map((p) => (
                                        <div key={p.id} className="cyber-panel p-6 border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Zap className="h-10 w-10 text-purple-400" />
                                            </div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 bg-slate-900 px-2 py-0.5 rounded mb-2 inline-block">
                                                        {p.category}
                                                    </span>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{p.name}</h3>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-900 border border-white/5 rounded-lg px-2 py-1">
                                                    <Monitor className="h-3 w-3 text-slate-500" />
                                                    <span className="text-[9px] font-black text-slate-400">{p.os}</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mb-6 leading-relaxed uppercase tracking-tight line-clamp-2">
                                                {p.description}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => runTool("flipper_build")}
                                                    className="flex-1 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-widest hover:bg-purple-500/20"
                                                >
                                                    Build Script
                                                </button>
                                                <button
                                                    onClick={() => runTool("flipper_flash")}
                                                    className="flex-1 py-2 rounded-lg bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    Flash to Device
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === "docker" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="cyber-panel p-8 border-white/5">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                                    <Container className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Docker Builder Instance</h2>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Isolated build environment for custom firmware</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => runTool("flipper_init")}
                                                    className="px-3 py-1 bg-cyan-500 text-black text-[9px] font-black uppercase rounded hover:scale-105 transition-transform"
                                                >
                                                    Initialize Environment
                                                </button>
                                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">
                                                    <div className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse" />
                                                    Container_Running
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                            {[
                                                { label: "Image Size", val: "1.42 GB", icon: HardDrive },
                                                { label: "Last Build", val: "14m ago", icon: RefreshCw },
                                                { label: "Uptime", val: "2d 4h", icon: Activity },
                                            ].map((m, i) => (
                                                <div key={i} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                                    <m.icon className="h-5 w-5 text-slate-500" />
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{m.label}</p>
                                                        <p className="text-[12px] font-black text-white font-mono">{m.val}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <button
                                                onClick={() => runTool("flipper_build")}
                                                className="flex-1 h-14 rounded-xl bg-cyan-500 text-black font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all"
                                            >
                                                <Settings className="h-4 w-4" />
                                                Build Firmware (fbt)
                                            </button>
                                            <button
                                                onClick={() => runTool("flipper_update")}
                                                className="flex-1 h-14 rounded-xl bg-slate-900 border border-white/5 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Pull Latest Repo
                                            </button>
                                            <button
                                                onClick={() => runTool("flipper_flash")}
                                                className="flex-1 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-500/20 transition-all"
                                            >
                                                <Usb className="h-4 w-4" />
                                                Flash via USB
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cyber-panel p-6 border-white/5">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Docker Compose Configuration</h3>
                                        <div className="bg-slate-950 p-6 rounded-xl border border-white/5 font-mono text-[10px] leading-relaxed text-slate-400 relative group">
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <button className="p-2 hover:text-white transition-colors"><Shield className="h-4 w-4" /></button>
                                                <button className="p-2 hover:text-white transition-colors" onClick={() => addLog("Dockerfile configuration copied to clipboard.", "info")}><Database className="h-4 w-4" /></button>
                                            </div>
                                            <pre>
                                                {`services:
  flipper-builder:
    build: .
    privileged: true
    volumes:
      - /dev/bus/usb:/dev/bus/usb
      - ./firmware:/flipper
      - ./output:/output
    working_dir: /flipper
    command: /bin/bash`}
                                            </pre>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "traffic" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cyber-panel p-8 border-white/5 min-h-[500px] relative overflow-hidden flex flex-col items-center justify-center">
                                    <div className="absolute inset-0 cyber-grid opacity-20" />
                                    <Globe className="h-40 w-40 text-cyan-500/10 absolute animate-pulse" />

                                    <div className="relative text-center space-y-4">
                                        <div className="h-16 w-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 mx-auto animate-bounce">
                                            <Activity className="h-8 w-8" />
                                        </div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Realtime Traffic Stream</h2>
                                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto uppercase tracking-tighter">Initializing packet inspection engine... Waiting for Alfa card to start sniffing.</p>

                                        <div className="flex gap-2 justify-center">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-2 w-8 bg-cyan-500/20 rounded-full overflow-hidden">
                                                    <motion.div
                                                        animate={{ x: [-32, 32] }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear", delay: i * 0.2 }}
                                                        className="h-full w-4 bg-cyan-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "scripts" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cyber-panel border-white/5 overflow-hidden">
                                    <div className="bg-slate-900/50 p-4 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-2 hover:text-white cursor-pointer"><Globe className="h-3 w-3" /> /SD_CARD</span>
                                            <ChevronRight className="h-3 w-3" />
                                            <span className="flex items-center gap-2 hover:text-white cursor-pointer"><HardDrive className="h-3 w-3" /> /BAD_USB</span>
                                        </div>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-black text-[9px] font-black uppercase rounded">
                                            <Plus className="h-3 w-3" /> New Script
                                        </button>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {[
                                            { name: "wifi_stealer.txt", size: "1.2kb", date: "2023-11-20" },
                                            { name: "reverse_shell.sh", size: "4.5kb", date: "2023-11-18" },
                                            { name: "rickroll.txt", size: "0.8kb", date: "2023-11-15" },
                                            { name: "payload_v2.bin", size: "42kb", date: "2023-11-10" },
                                        ].map((file, idx) => (
                                            <div key={idx} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <FileCode className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                                    <div>
                                                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{file.name}</p>
                                                        <p className="text-[9px] text-slate-600 font-mono italic">{file.size} // {file.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 hover:text-cyan-400 transition-colors"><Download className="h-4 w-4" /></button>
                                                    <button className="p-2 hover:text-red-400 transition-colors"><AlertTriangle className="h-4 w-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Live Terminal Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Quick Actions Panel */}
                    <div className="cyber-panel p-6 border-white/5 bg-slate-900/20">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Security Context</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-400/10 text-red-400 rounded-lg">
                                        <Flame className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase">Breach Mode</span>
                                </div>
                                <div className="h-4 w-8 bg-slate-800 rounded-full cursor-not-allowed" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-400/10 text-emerald-400 rounded-lg">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase">OpSec Stealth</span>
                                </div>
                                <div className="h-4 w-8 bg-emerald-400 rounded-full relative">
                                    <div className="absolute top-0.5 right-0.5 h-3 w-3 bg-white rounded-full shadow-lg" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                                        <Eye className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase">Packet Log</span>
                                </div>
                                <div className="h-4 w-8 bg-slate-800 rounded-full relative cursor-pointer" onClick={() => addLog("Packet logging enabled.", "info")}>
                                    <div className="absolute top-0.5 left-0.5 h-3 w-3 bg-slate-400 rounded-full shadow-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terminal */}
                    <div className="cyber-panel border-white/5 bg-[#030712] flex flex-col h-[500px]">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <Terminal className="h-4 w-4 text-cyan-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Link Station</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-red-500/30" />
                                <div className="h-2 w-2 rounded-full bg-amber-500/30" />
                                <div className="h-2 w-2 rounded-full bg-emerald-500/30" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar font-mono">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                                    <Binary className="h-12 w-12" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Uplink...</p>
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="group animate-in slide-in-from-left-2 duration-300">
                                        <div className="flex items-start gap-3">
                                            <span className="text-[9px] text-slate-700 shrink-0 mt-1 font-mono">[{log.timestamp}]</span>
                                            <span className={cn(
                                                "text-[9px] font-black px-1.5 rounded uppercase tracking-tighter shrink-0 mt-0.5",
                                                log.level === "success" ? "bg-emerald-400/10 text-emerald-400" :
                                                    log.level === "warning" ? "bg-amber-400/10 text-amber-400" :
                                                        log.level === "error" ? "bg-red-400/10 text-red-400" :
                                                            log.level === "debug" ? "bg-purple-400/10 text-purple-400" :
                                                                "bg-cyan-400/10 text-cyan-400"
                                            )}>
                                                {log.module}
                                            </span>
                                            <p className={cn(
                                                "text-[11px] leading-relaxed break-all",
                                                log.level === "error" ? "text-red-400" :
                                                    log.level === "warning" ? "text-amber-200" :
                                                        "text-slate-300"
                                            )}>
                                                {log.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={terminalEndRef} />
                        </div>

                        <div className="p-3 bg-slate-900/50 border-t border-white/5">
                            <div className="flex items-center gap-3 bg-slate-950 rounded-lg border border-white/5 px-3 py-2">
                                <ChevronRight className="h-3 w-3 text-cyan-500" />
                                <input
                                    type="text"
                                    placeholder="EXECUTE REMOTE COMMAND..."
                                    className="bg-transparent border-none outline-none text-[10px] font-black text-cyan-400 placeholder-slate-800 uppercase tracking-widest w-full"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const val = (e.target as HTMLInputElement).value;
                                            if (val) {
                                                addLog(`User executed: ${val}`, "debug", "USER");
                                                (e.target as HTMLInputElement).value = "";
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
