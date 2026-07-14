import { Zap, Shield, Mic, Activity, Users, Lock, Server, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const API_BASE = "http://localhost:8000/api/v1";

interface TriggeredAlert {
    id: string;
    timestamp: string;
    severity: string;
    source: string;
    description: string;
    status: string;
    title?: string; // Optional for mapped display
}

interface VoiceSession {
    id: string;
    status: string;
    channel: string;
    encoding: string;
    risk: string;
    flags?: string[];
}

export default function SignalGuardDashboard() {
    const [alerts, setAlerts] = useState<TriggeredAlert[]>([]);
    const [sessions, setSessions] = useState<VoiceSession[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const alertsRes = await fetch(`${API_BASE}/blueops/alerts`);
            const alertsData = await alertsRes.json();
            const sessionsRes = await fetch(`${API_BASE}/voice/sessions`);
            const sessionsData = await sessionsRes.json();

            setAlerts(alertsData || []);
            setSessions(sessionsData || []);
        } catch (error) {
            console.error("Failed to fetch SignalGuard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleTerminate = async (sessionId: string) => {
        if (!confirm(`Are you sure you want to TERMINATE session ${sessionId}?`)) return;

        try {
            const res = await fetch(`${API_BASE}/voice/session/${sessionId}/terminate`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#05040B] text-white p-12 overflow-y-auto scrollbar-hide cyberg-grid">
            <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* Tactical Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 bg-white/[0.01] p-10 rounded-[40px] border border-white/5 backdrop-blur-3xl">
                    <div className="space-y-4">
                        <div className="section-label">0x11 // Psycho-Acoustic Defense</div>
                        <h1 className="display-title italic">Signal<span className="text-indigo-400">Guard</span> Intelligence.</h1>
                        <p className="text-text-2 text-sm max-w-xl leading-relaxed">
                            Socio-technical monitoring and real-time voice channel authentication.
                            Protecting the human layer from advanced cognitive engineering and neural exploitation.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="px-10 py-5 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center gap-6 backdrop-blur-3xl shadow-2xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex flex-col text-right z-10">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 whitespace-nowrap">Interface Status</span>
                                <span className="text-[12px] font-black text-indigo-400 uppercase tracking-widest leading-none flex items-center gap-3 justify-end italic">
                                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818cf8]" />
                                    Synchronized
                                </span>
                            </div>
                            <div className="h-14 w-14 rounded-[22px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 z-10 shadow-inner">
                                <Mic className="h-7 w-7" />
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-[60vh] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-8">
                            <div className="h-20 w-20 border-b-2 border-indigo-500 rounded-full animate-spin shadow-[0_0_40px_rgba(79,70,229,0.3)]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-600 animate-pulse italic">Accessing Neural Interface...</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                        {/* High-Risk Voice Channels */}
                        <div className="xl:col-span-8 space-y-12">
                            <div className="flex items-center justify-between bg-white/[0.01] p-6 rounded-[24px] border border-white/5">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 border-l-2 border-indigo-500 pl-8">Active Spectrum Monitoring</h2>
                                <span className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                                    {sessions.length} Channels Verified
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {sessions.length > 0 ? sessions.map((session) => (
                                    <div key={session.id} className="premium-card p-12 group !bg-white/[0.015] hover:!bg-white/[0.04] transition-all duration-700 shadow-xl hover:shadow-indigo-500/5">
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-8">
                                                <div className="h-16 w-16 rounded-[24px] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                                                    <Mic className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Channel Signature</div>
                                                    <div className="text-sm font-black italic text-white font-mono tracking-tight">{session.id.toUpperCase()}</div>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "h-4 w-4 rounded-full animate-pulse shadow-[0_0_15px_currentColor]",
                                                session.risk === 'high' ? 'text-rose-500 bg-rose-500 shadow-rose-500/40' : 'text-emerald-500 bg-emerald-500 shadow-emerald-500/40'
                                            )} />
                                        </div>

                                        <div className="space-y-8 mb-12">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Encryption Tier</span>
                                                <span className="text-white font-mono">{session.encoding}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={cn("h-full transition-all duration-1000", session.risk === 'high' ? 'bg-rose-500 w-[85%]' : 'bg-emerald-500 w-[15%]')}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Cognitive Entropy Index</span>
                                                <span className={cn("font-black italic text-[11px]", session.risk === 'high' ? 'text-rose-400' : 'text-emerald-400')}>
                                                    {session.risk === 'high' ? 'Critical Delta (0.89)' : 'Optimal State (0.12)'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleTerminate(session.id)}
                                            className="w-full py-5 bg-white/[0.03] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-red-500 transition-all duration-500 shadow-sm"
                                        >
                                            Terminate Communication Link
                                        </button>
                                    </div>
                                )) : (
                                    <div className="col-span-2 premium-card p-32 flex flex-center items-center justify-center flex-col text-center border-dashed border-white/5 bg-transparent">
                                        <div className="h-24 w-24 bg-white/[0.02] rounded-full flex items-center justify-center mb-10 shadow-inner">
                                            <Zap className="h-10 w-10 text-slate-800" />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-700 italic">Static Environment: No Active Telemetry Detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Socio-Technical Alerts */}
                        <div className="xl:col-span-4 space-y-12">
                            <div className="p-6 bg-white/[0.01] rounded-[24px] border border-white/5">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 border-l-2 border-rose-500 pl-8">Anomaly Buffer</h2>
                            </div>

                            <div className="space-y-8 max-h-[1000px] overflow-y-auto scrollbar-hide pr-2">
                                {alerts.length > 0 ? alerts.map((alert, idx) => (
                                    <div key={alert.id} className="premium-card p-10 !bg-white/[0.01] hover:!bg-white/[0.03] transition-all duration-500 border-r-rose-500/30 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                            <Shield className="h-16 w-16 text-rose-500" />
                                        </div>
                                        <div className="flex items-center gap-6 mb-8 relative z-10">
                                            <div className="h-14 w-14 rounded-[20px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)] shadow-inner">
                                                <Shield className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1.5">{alert.source}</div>
                                                <div className="text-sm font-black text-white italic leading-tight">{alert.title || "Phishing Attempt Detected"}</div>
                                            </div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium mb-10 relative z-10">
                                            {alert.description}
                                        </p>
                                        <div className="flex items-center justify-between border-t border-white/5 pt-8 relative z-10">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">{new Date(alert.timestamp).toLocaleTimeString()} UTC</span>
                                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-4 py-2 bg-rose-400/10 rounded-xl border border-rose-400/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] italic">{alert.severity}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="premium-card p-20 text-center opacity-10 italic text-[11px] tracking-[0.4em] uppercase font-black">
                                        Buffer Clear. No anomalies Detected in Spectrum.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tactical Footer Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-16 border-t border-white/5 pb-20">
                    {[
                        { label: "Neural Cluster Load", value: "12%", icon: Cpu, color: "text-indigo-400" },
                        { label: "Cognitive Latency", value: "4ms", icon: Activity, color: "text-emerald-400" },
                        { label: "Secure Interfaces", value: "1,240", icon: Users, color: "text-cyan-400" },
                        { label: "Interface Uptime", value: "99.98%", icon: Server, color: "text-indigo-400" },
                    ].map((m, i) => (
                        <div key={i} className="flex flex-col gap-6 group">
                            <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] group-hover:text-slate-500 transition-colors">{m.label}</div>
                            <div className="flex items-center gap-6">
                                <div className={cn("h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all shadow-inner", m.color)}>
                                    <m.icon className="h-6 w-6" />
                                </div>
                                <span className="text-xl font-black text-white tracking-widest italic">{m.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

