"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Radio, Wifi, Bluetooth, Signal, Search, Activity, 
  Shield, Zap, Power, Server, HardDrive, Cpu,
  Target, Globe, Filter, List, Smartphone, Info,
  ExternalLink, Maximize2, Trash2, Database, WifiOff,
  Radar, Fingerprint, Network, Terminal, Settings,
  ChevronRight, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactECharts from 'echarts-for-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA & TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AccessPoint {
  id: string;
  ssid: string;
  bssid: string;
  channel: number;
  frequency: string;
  signal: number;
  encryption: 'WPA2' | 'WPA3' | 'OWE' | 'OPEN';
  clients: number;
  vendor: string;
}

const INTERFACES = [
  { id: 'wlan1mon', chip: 'Alfa AWUS036ACM', mode: 'Monitor', power: '30dBm', type: 'External' },
  { id: 'wlan0', chip: 'Intel Wi-Fi 6 AX201', mode: 'Managed', power: '20dBm', type: 'Internal' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function WireTapperPro() {
  const [activeInterface, setActiveInterface] = useState(INTERFACES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [isJamming, setIsJamming] = useState(false);
  const [jamType, setJamType] = useState<'wifi' | 'bt'>('wifi');
  const [jamIntensity, setJamIntensity] = useState(50);
  const [selectedAP, setSelectedAP] = useState<AccessPoint | null>(null);
  const [aps, setAps] = useState<AccessPoint[]>([]);
  const [noiseFloor, setNoiseFloor] = useState(-98);
  const [logs, setLogs] = useState<string[]>([]);
  const [btDevices, setBtDevices] = useState<any[]>([]);
  
  const logRef = useRef<HTMLDivElement>(null);

  // --- API INTEGRATION ---
  const fetchSIGINT = useCallback(async () => {
    if (!isScanning) return;
    try {
        // Fetch WiFi Scan
        const wifiRes = await fetch('http://localhost:8081/api/sigint/scan');
        if (wifiRes.ok) {
            const data = await wifiRes.json();
            setAps(data.aps);
        }
        // Fetch BT Scan
        const btRes = await fetch('http://localhost:8081/api/sigint/bluetooth');
        if (btRes.ok) {
            const data = await btRes.json();
            setBtDevices(data.devices);
        }
    } catch (e) {
        addLog("[ERROR] SIGINT Service unreachable (Port 8081).");
    }
  }, [isScanning]);

  useEffect(() => {
    const interval = setInterval(fetchSIGINT, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchSIGINT]);

  const toggleJamming = async () => {
    const action = isJamming ? 'stop' : 'start';
    try {
        const res = await fetch('http://localhost:8081/api/sigint/jam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action, 
                bssid: selectedAP?.bssid || 'ALL', 
                intensity: jamIntensity 
            })
        });
        if (res.ok) {
            setIsJamming(!isJamming);
            addLog(`[ACTION] Jamming ${action === 'start' ? 'INITIATED' : 'TERMINATED'}`);
        }
    } catch (e) {
        addLog("[ERROR] Could not send Jamming command.");
    }
  };

  const toggleScan = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
        addLog(`[SYSTEM] Interface ${activeInterface.id} switched to MONITOR MODE.`);
        addLog(`[SIGINT] Scanning 2.4GHz / 5GHz spectrum...`);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const getWaterfallOption = () => ({
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      data: Array.from({ length: 40 }, () => Math.random() * 80 + 20),
      type: 'bar',
      itemStyle: {
        color: (params: any) => {
           if (params.value > 70) return '#ef4444';
           if (params.value > 40) return '#3b82f6';
           return '#10b981';
        },
        borderRadius: [2, 2, 0, 0]
      },
      barWidth: '70%',
      animationDuration: 100,
    }]
  });

  return (
    <div className="flex h-screen bg-[#050505] text-slate-400 font-mono overflow-hidden p-6 gap-6">
      
      {/* ── LEFT: Hardware & Interface HUD ── */}
      <div className="w-[420px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          
          {/* Adapter Status */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden group shrink-0">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                <Wifi className="w-48 h-48" />
             </div>
             
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl">
                      <Cpu className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 italic">Wireless_Adapter</h2>
                      <p className="text-xl font-black text-white italic tracking-tighter uppercase">{activeInterface.id}</p>
                   </div>
                </div>
                <button 
                   onClick={toggleScan}
                   className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl",
                    isScanning ? "bg-red-600 text-white animate-pulse" : "bg-white/5 text-slate-500 hover:text-white"
                   )}
                >
                   <Power className="w-6 h-6" />
                </button>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 font-mono">
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Chipset</p>
                   <p className="text-[10px] font-black text-slate-300">{activeInterface.chip}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">TX_Power</p>
                   <p className="text-[10px] font-black text-blue-500">{activeInterface.power}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Mode</p>
                   <p className="text-[10px] font-black text-emerald-500">{activeInterface.mode}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Noise_Floor</p>
                   <p className="text-[10px] font-black text-orange-500">{noiseFloor} dBm</p>
                </div>
             </div>
          </div>

          {/* Interface Selector Panel */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden group shrink-0">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic flex items-center gap-3 mb-2">
                <Settings className="w-4 h-4 text-blue-500" /> Interface_Selection
             </h3>
             <div className="space-y-3">
                {INTERFACES.map(iface => (
                   <button 
                      key={iface.id}
                      onClick={() => {
                        setActiveInterface(iface);
                        addLog(`[SYSTEM] Switched to interface: ${iface.id} (${iface.chip})`);
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl flex items-center justify-between border transition-all group/iface",
                        activeInterface.id === iface.id ? "bg-blue-600/10 border-blue-500/40" : "bg-white/[0.02] border-white/5 hover:border-white/20"
                      )}
                   >
                      <div className="flex items-center gap-4">
                         <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            activeInterface.id === iface.id ? "bg-blue-600 text-white shadow-lg" : "bg-black/40 text-slate-700 group-hover/iface:text-slate-400"
                         )}>
                            <Network className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                            <p className="text-[11px] font-black text-white uppercase italic leading-none mb-1">{iface.id}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{iface.mode}</p>
                               <span className={cn(
                                  "text-[7px] px-1 py-0.5 rounded bg-white/5 font-black uppercase tracking-tighter",
                                  iface.type === 'External' ? "text-blue-500" : "text-slate-700"
                               )}>{iface.type}</span>
                            </div>
                         </div>
                      </div>
                      {activeInterface.id === iface.id && (
                         <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                      )}
                   </button>
                ))}
             </div>
          </div>

          {/* Multi-Technology Tactical Scanner */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden group shrink-0">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic flex items-center gap-3">
                <Radar className="w-4 h-4 text-emerald-500" /> Tactical_Protocol_Scanner
             </h3>
             <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'wifi', icon: Wifi, label: 'WiFi_802.11', color: 'text-blue-500' },
                  { id: 'bt', icon: Bluetooth, label: 'BT_LE_5.2', color: 'text-purple-500' },
                  { id: 'zigbee', icon: Cpu, label: 'Zigbee_IoT', color: 'text-orange-500' },
                  { id: 'cellular', icon: Signal, label: '4G/5G_IMS', color: 'text-emerald-500' }
                ].map(tech => (
                   <button 
                    key={tech.id}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:border-white/20 transition-all group/tech"
                   >
                      <tech.icon className={cn("w-5 h-5", tech.color)} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 group-tech:text-slate-300">{tech.label}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* Zero-Click Exploitation HUD */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden group shrink-0">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                   <Fingerprint className="w-4 h-4 text-red-500" /> Zero_Click_Exploitation
                </h3>
             </div>
             
             <div className="space-y-6">
                {/* AI Advisor Integration */}
                <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-4">
                      <Cpu className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Sentinel_AI_Advisor</span>
                   </div>
                   <p className="text-[10px] font-mono text-slate-400 italic leading-relaxed">
                      {selectedAP 
                        ? `Target [${selectedAP.ssid}] detected with ${selectedAP.encryption} encryption. Based on chipset heuristics, I recommend a 'Silent Over-the-Air' buffer overflow via management frames.`
                        : "Select a target to receive AI-driven infiltration strategy."
                      }
                   </p>
                </div>

                <div className="p-6 bg-red-600/5 border border-red-500/20 rounded-3xl relative overflow-hidden group/exploit">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] italic">Payload_Status</span>
                      <span className="text-[9px] font-mono text-slate-600">v4.0_SILENT</span>
                   </div>
                   <p className="text-[11px] font-black text-slate-300 uppercase leading-relaxed">Attempting Buffer Overflow via Beacon Management Frames...</p>
                   <div className="mt-6 flex items-center gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div 
                          key={i} 
                          className="h-6 flex-1 bg-red-600/20 rounded-sm"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                        />
                      ))}
                   </div>
                   <button 
                     onClick={() => addLog(`[EXPLOIT] Zero-Click payload generated by Sentinel-AI for BSSID: ${selectedAP?.bssid || 'GLOBAL'}`)}
                     className="w-full mt-6 py-4 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-xl shadow-xl shadow-red-600/20 hover:scale-105 transition-all"
                   >
                     EXECUTE_AI_INFILTRATION
                   </button>
                </div>
             </div>
          </div>

          {/* Electronic Warfare: JAMMING HUD */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden group shrink-0">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                   <WifiOff className="w-4 h-4 text-red-500" /> Electronic_Warfare
                </h3>
                {isJamming && <span className="text-[9px] font-black text-red-500 animate-pulse uppercase tracking-widest">Active_Interference</span>}
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                   <JamButton active={jamType === 'wifi'} onClick={() => setJamType('wifi')} label="2.4GHz WiFi" />
                   <JamButton active={jamType === 'bt'} onClick={() => setJamType('bt')} label="Bluetooth" />
                </div>
                
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Jamming_Intensity</span>
                      <span className="text-[10px] font-black text-red-500 italic">{jamIntensity}%</span>
                   </div>
                   <input 
                      type="range" min="0" max="100" value={jamIntensity} 
                      onChange={e => setJamIntensity(parseInt(e.target.value))}
                      className="w-full accent-red-600 h-1 bg-white/5 rounded-full outline-none" 
                   />
                </div>

                <button 
                   onClick={toggleJamming}
                   className={cn(
                      "w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-2xl",
                      isJamming ? "bg-red-600 text-white shadow-red-600/20" : "bg-white/5 text-slate-500 border border-white/10 hover:text-white"
                   )}
                >
                   <Zap className={cn("w-5 h-5", isJamming && "animate-spin")} /> {isJamming ? "CEASE_FIRE" : "INITIATE_JAMMING"}
                </button>
             </div>
          </div>

          {/* Bluetooth Intel HUD */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden group shrink-0">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                   <Bluetooth className="w-4 h-4 text-purple-500" /> Bluetooth_SIGINT
                </h3>
             </div>
             
             <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {btDevices.length === 0 ? (
                  <p className="text-[10px] text-slate-700 italic">No devices in range...</p>
                ) : (
                  btDevices.map((dev, i) => (
                    <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group/bt hover:border-purple-500/30 transition-all">
                       <div>
                          <p className="text-[11px] font-black text-slate-300 uppercase italic">{dev.name || "Unknown"}</p>
                          <p className="text-[8px] font-mono text-slate-600 mt-1 uppercase tracking-tighter">{dev.addr}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-purple-500 italic">{dev.rssi} dBm</p>
                          <p className="text-[7px] font-black text-slate-700 uppercase mt-1">{dev.type}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Spectral Analyzer (Waterfall) */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 flex-1 flex flex-col shadow-2xl overflow-hidden relative group min-h-[300px]">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                   <Activity className="w-4 h-4 text-emerald-500" /> Spectral_Cascade
                </h3>
                <span className="text-[9px] text-slate-600 font-mono">2.4GHz - 5.8GHz</span>
             </div>
             
             <div className="flex-1 flex flex-col gap-1 relative overflow-hidden bg-black/40 rounded-2xl p-4 border border-white/5">
                <div className={cn("absolute inset-0 opacity-20", isJamming && "animate-pulse")}>
                    <ReactECharts option={getWaterfallOption()} style={{ height: '100%', width: '100%' }} />
                </div>
                <div className="flex flex-col-reverse gap-1 h-full overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div 
                          key={i} 
                          className={cn(
                            "h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent",
                            isJamming && "via-red-500/50 scale-y-[4]"
                          )}
                          animate={{ 
                            x: isScanning ? [0, 50, -50, 0] : 0,
                            opacity: isJamming ? [0.2, 0.8, 0.2] : 1 - (i * 0.03)
                          }}
                          transition={{ repeat: Infinity, duration: isJamming ? 0.5 : 4, ease: "linear", delay: i * 0.1 }}
                        />
                    ))}
                </div>
             </div>
          </div>
      </div>

      {/* ── CENTER: BSSID Scanner & Signal Intel ── */}
      <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-[#0a0a0f] border border-white/5 rounded-[48px] p-10 flex-1 shadow-2xl flex flex-col overflow-hidden relative">
             <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8 shrink-0">
                <div className="flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[14px] font-black uppercase tracking-[0.3em] text-white italic leading-none">BSSID_INTERCEPTOR</span>
                      <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                         <div className={cn("w-1.5 h-1.5 rounded-full bg-blue-500", isScanning && "animate-ping")} /> {isScanning ? "Scanning_Active" : "Telemetry_Standby"}
                      </span>
                   </div>
                   <div className="w-px h-10 bg-white/10" />
                   <div className="flex gap-4">
                      <StatPill label="Detected" value={aps.length} />
                      <StatPill label="Handshakes" value="2" highlight />
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all"><Filter className="w-5 h-5" /></button>
                   <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all"><Settings className="w-5 h-5" /></button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-4">
                {aps.map((ap, idx) => (
                   <motion.div 
                     key={ap.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     onClick={() => setSelectedAP(ap)}
                     className={cn(
                        "p-6 rounded-[32px] cursor-pointer transition-all border group relative overflow-hidden flex items-center justify-between",
                        selectedAP?.id === ap.id ? "bg-blue-600/10 border-blue-500/40 shadow-2xl" : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                     )}
                   >
                      <div className="flex items-center gap-8">
                         <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                            ap.signal > -50 ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-500" : 
                            ap.signal > -70 ? "bg-blue-600/10 border-blue-500/20 text-blue-500" :
                            "bg-orange-600/10 border-orange-500/20 text-orange-500"
                         )}>
                            <Wifi className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="flex items-center gap-4">
                               <span className="text-sm font-black text-white italic uppercase tracking-tight">{ap.ssid || "<HIDDEN>"}</span>
                               <span className="text-[10px] font-mono text-slate-600">[{ap.bssid}]</span>
                            </div>
                            <div className="flex items-center gap-6 mt-2">
                               <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  <Signal className="w-3 h-3" /> {ap.signal} dBm
                               </div>
                               <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  <HardDrive className="w-3 h-3" /> CH: {ap.channel} ({ap.frequency})
                               </div>
                               <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest italic font-bold">
                                  <Lock className="w-3 h-3" /> {ap.encryption}
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{ap.vendor}</span>
                         <ChevronRight className="w-4 h-4 text-slate-800" />
                      </div>
                   </motion.div>
                ))}
             </div>

             {/* Live Terminal Log */}
             <div className="h-40 mt-10 bg-black border border-white/5 rounded-[32px] p-8 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                {logs.length === 0 ? (
                    <p className="text-slate-800 italic uppercase font-bold tracking-widest animate-pulse">Awaiting SIGINT initialization...</p>
                ) : (
                    logs.map((log, i) => <p key={i} className="text-blue-500/60 mb-1">{log}</p>)
                )}
                <div ref={logRef} />
             </div>
          </div>
      </div>

      {/* ── RIGHT: Tactical Actions Panel ── */}
      <AnimatePresence>
        {selectedAP && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                className="w-[400px] bg-[#0a0a0f] border border-white/5 rounded-[48px] p-12 shadow-2xl flex flex-col overflow-hidden relative z-50"
            >
                <div className="flex flex-col items-center text-center mb-12">
                   <div className="w-24 h-24 rounded-[32px] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6 shadow-2xl">
                      <Radar className="w-10 h-10 animate-spin-slow" />
                   </div>
                   <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">{selectedAP.ssid}</h2>
                   <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">{selectedAP.vendor} // ID:{selectedAP.id}</p>
                </div>

                <div className="space-y-8 flex-1">
                   <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">Tactical_Intelligence</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <ActionStat label="Clients" value={selectedAP.clients} />
                         <ActionStat label="Uptime" value="14d 2h" />
                         <ActionStat label="Security" value={selectedAP.encryption} highlight />
                         <ActionStat label="Integrity" value="98%" />
                      </div>
                   </div>

                   <div className="space-y-4 pt-10">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Response_Sequences</h4>
                      <div className="space-y-4">
                         <ResponseBtn 
                            icon={WifiOff} 
                            label="Deauth_Attack" 
                            sub="Force Client Disconnect" 
                            color="bg-red-600" 
                            onClick={() => addLog(`[ATTACK] Initiating DEAUTH on BSSID: ${selectedAP.bssid}`)}
                         />
                         <ResponseBtn 
                            icon={Zap} 
                            label="Capture_Handshake" 
                            sub="Sniff WPA2/3 4-Way Auth" 
                            color="bg-blue-600" 
                            onClick={() => addLog(`[SIGINT] Sniffer mode active on Channel ${selectedAP.channel}...`)}
                         />
                         <ResponseBtn 
                            icon={Radar} 
                            label="Beacon_Flood" 
                            sub="Saturate Signal Noise" 
                            color="bg-orange-600" 
                            onClick={() => addLog(`[TACTICAL] Flooding ESSIDs in vicinity...`)}
                         />
                      </div>
                   </div>
                </div>

                <button 
                   onClick={() => setSelectedAP(null)}
                   className="mt-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                >
                   Close_Tactical_View
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.1); border-radius: 10px; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── COMPONENT HELPERS ──

function JamButton({ active, onClick, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                active ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20" : "bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400"
            )}
        >
            {label}
        </button>
    );
}

function StatPill({ label, value, highlight }: any) {
    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{label}</span>
           <span className={cn("text-[11px] font-black italic", highlight ? "text-blue-500" : "text-white")}>{value}</span>
        </div>
    );
}

function ActionStat({ label, value, highlight }: any) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
           <p className="text-[8px] font-black text-slate-700 uppercase mb-1 tracking-widest">{label}</p>
           <p className={cn("text-xs font-black italic", highlight ? "text-blue-500" : "text-slate-300")}>{value}</p>
        </div>
    );
}

function ResponseBtn({ icon: Icon, label, sub, color, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className="w-full p-6 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center gap-6 hover:bg-white/[0.05] transition-all group"
        >
           <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform", color)}>
              <Icon className="w-6 h-6" />
           </div>
           <div className="text-left">
              <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">{label}</p>
              <p className="text-[9px] font-bold text-slate-700 uppercase italic tracking-tighter">{sub}</p>
           </div>
        </button>
    );
}
