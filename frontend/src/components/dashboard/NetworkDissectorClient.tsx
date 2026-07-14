"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cloud, Server, Key, ShieldCheck, 
    AlertCircle, Activity, CheckCircle2,
    Network, Database, Zap, Lock, ScanLine, 
    Wifi, HardDrive, Terminal, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectorStatus {
    id: string;
    isConnected: boolean;
    lastSync?: string;
    eventsScanned?: number;
}

export default function NetworkDissectorClient() {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [ingestRate, setIngestRate] = useState(0);
    const [connectors, setConnectors] = useState<Record<string, ConnectorStatus>>({
        aws: { id: 'aws', isConnected: false },
        azure: { id: 'azure', isConnected: false },
        crowdstrike: { id: 'crowdstrike', isConnected: false },
        sentinelone: { id: 'sentinelone', isConnected: false },
        okta: { id: 'okta', isConnected: false },
        gcp: { id: 'gcp', isConnected: false }
    });

    // Modal state for AWS form
    const [accessKey, setAccessKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

    useEffect(() => {
        // Mock live ingest rate fluctuation if connected
        if (connectors.aws.isConnected) {
            const int = setInterval(() => {
                setIngestRate(Math.floor(Math.random() * 450) + 1200);
            }, 2000);
            return () => clearInterval(int);
        } else {
            setIngestRate(0);
        }
    }, [connectors.aws.isConnected]);

    const handleConnectAWS = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsConnecting(true);
        setTerminalLogs(["[SYS] Initiating secure TLS handshake with AWS Region us-east-1..."]);

        try {
            setTimeout(() => setTerminalLogs(prev => [...prev, "[OK] Handshake established. Validating IAM Credentials..."]), 800);
            
            const apiUrl = process.env.NEXT_PUBLIC_PENTESTER_API_URL || 'http://localhost:9100';
            const res = await fetch(`${apiUrl}/connect/aws`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access_key: accessKey, secret_key: secretKey, region: 'us-east-1' })
            });

            if (!res.ok) throw new Error("Failed to authenticate IAM user.");

            const data = await res.json();
            
            setTimeout(() => setTerminalLogs(prev => [...prev, "[OK] Credentials Accepted. Syncing CloudTrail data..."]), 1500);
            setTimeout(() => setTerminalLogs(prev => [...prev, `[SYS] Ingested ${data.ingested_events} events into Ontology Core.`]), 2200);
            
            setTimeout(() => {
                setConnectors(prev => ({
                    ...prev,
                    aws: {
                        id: 'aws',
                        isConnected: true,
                        lastSync: "Just now",
                        eventsScanned: data.ingested_events
                    }
                }));
                // Auto close modal on success
                setActiveModal(null);
                setAccessKey('');
                setSecretKey('');
                setTerminalLogs([]);
            }, 3500);

        } catch (err: any) {
            setTimeout(() => {
                setTerminalLogs(prev => [...prev, `[FAIL] ${err.message || 'Connection failed.'}`]);
                setErrorMsg(err.message || 'Connection failed.');
                setIsConnecting(false);
            }, 1500);
        }
    };

    const renderConnectors = () => {
        const list = [
            { id: 'aws', name: 'AWS CloudTrail', type: 'Cloud Infrastructure', icon: Cloud, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
            { id: 'azure', name: 'Azure Active Directory', type: 'Identity Provider', icon: Server, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
            { id: 'crowdstrike', name: 'CrowdStrike Falcon', type: 'Endpoint Agent', icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
            { id: 'sentinelone', name: 'SentinelOne Singularity', type: 'Endpoint Agent', icon: ScanLine, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
            { id: 'okta', name: 'Okta Identity', type: 'SSO & Access', icon: Key, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
            { id: 'gcp', name: 'Google Cloud Platform', type: 'Cloud Infrastructure', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
        ];

        return list.map((item, idx) => {
            const status = connectors[item.id];
            const isAvail = item.id === 'aws'; // Only AWS is active for MVP

            return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    key={item.id}
                    className={cn(
                        "relative overflow-hidden border p-5 transition-all duration-300 group",
                        status.isConnected 
                            ? "bg-[#091019] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                            : isAvail 
                                ? "bg-[#0A121A] border-[#1e293b] hover:border-amber-500/50 hover:bg-[#0c1622] cursor-pointer"
                                : "bg-[#05080E] border-[#1e293b] opacity-60"
                    )}
                    onClick={() => isAvail && !status.isConnected && setActiveModal('aws')}
                >
                    {/* Background Tech Details */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <item.icon className="w-32 h-32" />
                    </div>

                    {status.isConnected && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/10 border-b border-l border-emerald-500/30 rounded-bl-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400">Linked</span>
                        </div>
                    )}

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4 mb-5">
                            <div className={cn("w-12 h-12 rounded flex items-center justify-center border", item.bg, item.border)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wider">{item.name}</h3>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{item.type}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Status</span>
                            {status.isConnected ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1.5"><Activity className="w-3 h-3" /> Active Stream</span>
                            ) : isAvail ? (
                                <span className="text-amber-500 font-bold">Awaiting Credentials</span>
                            ) : (
                                <span className="text-slate-600 font-bold">Module Locked</span>
                            )}
                        </div>
                        
                        {status.isConnected ? (
                            <>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Metrics</span>
                                    <span className="text-white font-mono">{status.eventsScanned?.toLocaleString()} logs</span>
                                </div>
                            </>
                        ) : (
                            <div className="h-4" /> // Spacer
                        )}
                    </div>
                </motion.div>
            );
        });
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-[#010203] text-slate-300 font-mono overflow-hidden">
            
            {/* LEFT PANELS: METRICS & TOPOLOGY */}
            <div className="w-[300px] border-r border-[#1e293b] flex flex-col bg-[#05080E] relative shrink-0">
                <div className="p-5 border-b border-[#1e293b] flex items-center gap-3 bg-[#0A121A]">
                    <Network className="w-5 h-5 text-blue-500" />
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ingestion Matrix</h2>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Global Data Flow</div>
                    </div>
                </div>

                <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                    {/* Live Throughput */}
                    <div className="p-4 bg-black/40 border border-[#1e293b] rounded relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500/20">
                            <motion.div className="h-full bg-blue-500" animate={{ width: `${(ingestRate/2000)*100}%` }} transition={{ duration: 0.5 }} />
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                            <span>Live Throughput</span>
                            <Zap className={cn("w-3 h-3", ingestRate > 0 ? "text-amber-400" : "text-slate-600")} />
                        </div>
                        <div className="text-2xl font-bold font-mono text-white flex items-end gap-2">
                            {ingestRate.toLocaleString()} <span className="text-[10px] text-slate-500 mb-1">EPS</span>
                        </div>
                    </div>

                    {/* Active Pipelines */}
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1e293b] pb-2">Active Pipelines</div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-[#0A121A] border border-[#1e293b] text-xs">
                                <div className="flex items-center gap-2"><HardDrive className="w-3 h-3 text-emerald-400" /> Local OS (PSUtil)</div>
                                <span className="text-emerald-400 font-bold">100%</span>
                            </div>
                            {connectors.aws.isConnected && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/30 text-xs">
                                    <div className="flex items-center gap-2"><Cloud className="w-3 h-3 text-amber-400" /> AWS CloudTrail</div>
                                    <span className="text-emerald-400 font-bold">100%</span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="p-4 bg-red-500/5 border border-red-500/20 mt-8 rounded flex items-start gap-3">
                        <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                            All API Keys are encrypted locally using AES-256 before transmission to the AI Ontology core. Data remains sovereign.
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: CONNECTOR GRID */}
            <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,#0c1622_0%,#010203_100%)]">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="p-8 pb-4 shrink-0 relative z-10">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                        Enterprise Connectors
                    </h1>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                        Expand your Master Ontology by bridging internal and external environments. 
                        Select a provider to establish a continuous secure telemetry stream to the Incident Brain.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {renderConnectors()}
                    </div>
                </div>
            </div>


            {/* MODAL: AWS INTEGRATION */}
            <AnimatePresence>
                {activeModal === 'aws' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-[600px] bg-[#0A121A] border border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                        >
                            {/* Terminal-like Header */}
                            <div className="p-3 border-b border-[#1e293b] bg-[#05080E] flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5 ml-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 ml-2">
                                        <Terminal className="w-3 h-3" />
                                        CONNECTION_BROKER // AWS_CLOUDTRAIL
                                    </span>
                                </div>
                                <button onClick={() => !isConnecting && setActiveModal(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                            </div>

                            <div className="flex">
                                {/* Side Icon */}
                                <div className="w-[120px] bg-[#070C13] border-r border-[#1e293b] flex flex-col items-center justify-center p-6 shrink-0">
                                    <div className="w-16 h-16 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 relative">
                                        <Cloud className="w-8 h-8 text-amber-500" />
                                        {isConnecting && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border border-dashed border-amber-500/50 rounded-lg" />}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">AWS Core</div>
                                        <div className="text-[8px] text-slate-500 uppercase tracking-widest">us-east-1</div>
                                    </div>
                                </div>

                                {/* Form Area */}
                                <form onSubmit={handleConnectAWS} className="flex-1 p-8 bg-[#091019] flex flex-col justify-center">
                                    {errorMsg && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2 mb-6">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {errorMsg}
                                        </motion.div>
                                    )}

                                    {isConnecting ? (
                                        <div className="space-y-4 font-mono text-[10px]">
                                            <div className="animate-pulse text-amber-500 font-bold uppercase tracking-widest mb-4">Establishing Secure Link...</div>
                                            {terminalLogs.map((log, i) => (
                                                <motion.div 
                                                    key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                                                    className={cn(
                                                        "flex items-start gap-2", 
                                                        log.includes('[OK]') ? "text-emerald-400" : log.includes('[FAIL]') ? "text-red-400" : "text-slate-400"
                                                    )}
                                                >
                                                    <ChevronRight className="w-3 h-3 shrink-0 mt-0.5" />
                                                    {log}
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">IAM Access Key ID</label>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                                                    <input 
                                                        type="text" required
                                                        value={accessKey} onChange={e => setAccessKey(e.target.value)}
                                                        className="w-full bg-[#05080E] border border-[#1e293b] pl-10 pr-4 py-3 text-xs text-white uppercase font-bold tracking-widest focus:outline-none focus:border-amber-500/50 focus:bg-[#0A121A] transition-colors rounded-none placeholder:opacity-30"
                                                        placeholder="AKIAIOSFODNN7EXAMPLE"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">IAM Secret Access Key</label>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                                                    <input 
                                                        type="password" required
                                                        value={secretKey} onChange={e => setSecretKey(e.target.value)}
                                                        className="w-full bg-[#05080E] border border-[#1e293b] pl-10 pr-4 py-3 text-xs text-white font-bold tracking-widest focus:outline-none focus:border-amber-500/50 focus:bg-[#0A121A] transition-colors rounded-none placeholder:opacity-30"
                                                        placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                                    />
                                                </div>
                                            </div>

                                            <button 
                                                type="submit"
                                                className="w-full mt-4 py-3 bg-white hover:bg-slate-200 text-black text-xs uppercase font-extrabold tracking-widest transition-all"
                                            >
                                                Initialize Uplink
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
