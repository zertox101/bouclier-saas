import os

file_path = r"c:\Users\ASUS\Desktop\cyberattack\bouclier-saas\frontend\src\components\dashboard\ThreatMapProClient.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Update sidebars (lines 273-319 approx)
sidebar_start = -1
sidebar_end = -1
for i, line in enumerate(lines):
    if '{/* HUD OVERLAYS */}' in line:
        sidebar_start = i
    if 'Neural Correlation' in line:
        # Find the end of this div block
        for j in range(i, len(lines)):
            if '</div>' in lines[j] and '</div>' in lines[j+1] and '</div>' in lines[j+2]:
                sidebar_end = j + 3
                break
        break

if sidebar_start != -1 and sidebar_end != -1:
    new_sidebar = """                    {/* HUD OVERLAYS - LEFT: LIVE SIGNAL ARRAY */}
                    <div className="absolute left-6 top-6 w-80 space-y-4">
                        <div className="bg-[#0d1520]/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <ActivityIcon className="w-4 h-4 text-blue-500" /> LIVE INTERCEPT ARRAY
                                </h3>
                                <span className="text-[9px] font-mono text-blue-500/50 animate-pulse">STREAMING_LIVE</span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-hidden relative">
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0d1520] to-transparent z-10" />
                                {events.slice(0, 8).map((ev, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={i} 
                                        className="flex flex-col gap-1 border-l-2 border-white/5 pl-3 hover:border-blue-500/40 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-mono text-slate-500">{ev.details.timestamp}</span>
                                                <span className="text-[10px] font-black text-white">{ev.source.ip}</span>
                                            </div>
                                            <span className={cn("text-[8px] font-black uppercase px-1 rounded", ev.details.threat_level === 'Critical' ? "text-red-400 bg-red-400/10" : "text-blue-400 bg-blue-400/10")}>{ev.details.threat_level}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 group-hover:text-blue-300">
                                            <span className="truncate w-32">{ev.details.isp} // {ev.source.city}</span>
                                            <span>{ev.details.protocol}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* SATELLITE CONTROLS */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex justify-between gap-2">
                             {['VECTOR', 'SAT', 'TOPO'].map(mode => (
                                <button key={mode} className="flex-1 py-2 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                                    {mode}
                                </button>
                             ))}
                        </div>
                    </div>

                    {/* HUD OVERLAYS - RIGHT: EXPERT FORENSICS */}
                    <div className="absolute right-6 top-6 w-80 space-y-4">
                        <div className="bg-[#0d1520]/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Database className="w-4 h-4 text-purple-400" /> THREAT ATTRIBUTION
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                                   <div className="flex justify-between items-center mb-2">
                                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">APT CLUSTER ALPHA</span>
                                      <span className="text-[8px] text-slate-500">CORRELATION: 0.94</span>
                                   </div>
                                   <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                                      Detected multi-stage intrusion attempt via SQLi vector. Signatures match "Lazarus-Variant" infrastructure.
                                   </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                   <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                      <span className="text-[8px] text-slate-500 uppercase block mb-1">Payload Entropy</span>
                                      <span className="text-[14px] font-black text-white font-mono">7.84 <span className="text-[8px] text-red-500 underline">CRIT</span></span>
                                   </div>
                                   <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                      <span className="text-[8px] text-slate-500 uppercase block mb-1">Traffic Vol</span>
                                      <span className="text-[14px] font-black text-white font-mono">412 GB/s</span>
                                   </div>
                                </div>
                            </div>
                        </div>

                        {/* TACTICAL ACTIONS */}
                        <div className="bg-[#0d1520]/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                             <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Tactical Response</h4>
                             <div className="space-y-2">
                                <button className="w-full py-3 bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                   <ZapOff className="w-3.5 h-3.5" /> Isolate Targeted Sector
                                </button>
                                <button className="w-full py-3 bg-blue-600/10 border border-blue-600/30 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                   <ShieldCheck className="w-3.5 h-3.5" /> Deploy AI Filters
                                </button>
                             </div>
                        </div>
                    </div>
"""
    lines[sidebar_start:sidebar_end] = [new_sidebar + "\n"]

# 2. Update Table (lines 321-407 approx)
table_start = -1
for i, line in enumerate(lines):
    if '{/* SIGNAL TABLE (High Detail) */}' in line:
        table_start = i
        break

if table_start != -1:
    new_table = """                {/* SIGNAL TABLE (High Detail) */}
                <div className="h-[300px] bg-[#0d1520]/98 backdrop-blur-3xl border-t border-white/10 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                    <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-5 bg-blue-600 rounded-full" />
                              <h2 className="text-[12px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-blue-500" /> GLOBAL INTERCEPT ARRAY v2.0
                              </h2>
                           </div>
                           <div className="w-px h-6 bg-white/10" />
                           <div className="flex gap-6">
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-slate-600 uppercase">Total Ingress</span>
                                 <span className="text-[12px] font-mono text-white font-black">1.28 PB</span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-slate-600 uppercase">Active Vectors</span>
                                 <span className="text-[12px] font-mono text-blue-400 font-black">{events.length}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <button className="h-9 px-4 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5" /> Forensics Export
                           </button>
                           <button className="h-9 px-4 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2">
                              <Compass className="w-3.5 h-3.5" /> Deploy Countermeasures
                           </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40">
                        <table className="w-full text-left table-fixed">
                            <thead className="sticky top-0 z-10 bg-[#0d1520] shadow-md">
                                <tr className="border-b border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="px-8 py-4 w-32">Intercept Time</th>
                                    <th className="px-4 py-4 w-44">Geographic Origin</th>
                                    <th className="px-4 py-4 w-52">ASN / Provider</th>
                                    <th className="px-4 py-4 w-64">Vulnerability Vector</th>
                                    <th className="px-4 py-4">Internal Impact Zone</th>
                                    <th className="px-4 py-4 text-center w-28">Risk Score</th>
                                    <th className="px-8 py-4 text-right w-36">Tactical State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04] text-[11px] font-mono">
                                {events.map((ev) => (
                                    <React.Fragment key={ev.id}>
                                    <tr className="hover:bg-blue-600/[0.03] transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
                                        <td className="px-8 py-4 text-slate-500 font-bold">{ev.details.timestamp}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{getFlagEmoji(ev.source.country_code)}</span>
                                                <div className="flex flex-col">
                                                   <span className="text-[10px] font-black text-slate-300 group-hover:text-white uppercase leading-none">{ev.source.name}</span>
                                                   <span className="text-[8px] text-slate-600 uppercase font-black tracking-tighter mt-1">{ev.source.city}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                           <div className="flex flex-col">
                                              <span className="text-blue-400 font-black leading-none">{ev.source.ip}</span>
                                              <span className="text-[8px] text-slate-600 font-black mt-1 uppercase truncate">{ev.source.org}</span>
                                           </div>
                                        </td>
                                        <td className="px-4 py-4">
                                           <div className="flex flex-col gap-1.5">
                                              <div className="flex items-center gap-2">
                                                 <div className={cn("w-1.5 h-1.5 rounded-full", ev.details.threat_level === 'Critical' ? "bg-red-500" : "bg-blue-500")} />
                                                 <span className="text-slate-200 font-black uppercase tracking-tight text-[10px]">{ev.details.method}</span>
                                              </div>
                                              <div className="flex gap-2">
                                                 <span className="text-[7px] px-1 bg-white/5 border border-white/10 rounded text-slate-500">CVE-2024-8192</span>
                                                 <span className="text-[7px] px-1 bg-white/5 border border-white/10 rounded text-slate-500">{ev.details.protocol}</span>
                                              </div>
                                           </div>
                                        </td>
                                        <td className="px-4 py-4">
                                           <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded bg-white/5 border border-white/5 flex items-center justify-center">
                                                 <Server className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                              </div>
                                              <div className="flex flex-col">
                                                 <span className="text-[9px] font-black text-white uppercase tracking-widest">{ev.target.zone}</span>
                                                 <span className="text-[7px] text-slate-600 font-black uppercase mt-0.5">Asset: WEB_FRONTEND_01</span>
                                              </div>
                                           </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                           <div className="flex flex-col items-center gap-1.5">
                                              <span className={cn("font-black text-[12px]", ev.ai_analysis!.risk_score > 85 ? "text-red-500" : "text-white")}>{ev.ai_analysis?.risk_score}%</span>
                                              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                 <div className={cn("h-full", ev.ai_analysis!.risk_score > 80 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-blue-500")} style={{ width: `${ev.ai_analysis?.risk_score}%` }} />
                                              </div>
                                           </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                           <div className="flex flex-col items-end gap-1">
                                              <span className={cn(
                                                  "text-[9px] font-black uppercase px-2 py-0.5 rounded border", 
                                                  ev.details.threat_level === 'Critical' ? "text-red-500 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "text-blue-400 bg-blue-400/10 border-blue-400/30"
                                              )}>
                                                 {ev.details.threat_level === 'Critical' ? "SHUNTED" : "FILTERED"}
                                              </span>
                                              <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">Lat: 14ms // P99</span>
                                           </div>
                                        </td>
                                    </tr>
                                {ev.details.threat_level === 'Critical' && (
                                   <tr key={`${ev.id}-intel`} className="bg-red-500/[0.02]">
                                      <td colSpan={7} className="px-8 py-2 border-b border-red-500/10">
                                         <div className="flex items-center gap-3 text-[8px] font-black text-red-400 uppercase tracking-widest">
                                            <AlertCircle className="w-3 h-3" />
                                            AI ADVISORY: Coordinated exploit attempt detected from high-entropy payload. Recommending immediate egress filtering for ASN: {ev.source.org.split(' ')[0]}.
                                         </div>
                                      </td>
                                   </tr>
                                )}
                                </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
"""
    lines[table_start:] = [new_table + "            </div>\n\n            <style jsx global>{`\n                .custom-scrollbar::-webkit-scrollbar { width: 4px; }\n                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }\n            `}</style>\n        </div>\n    );\n}\n"]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Expert Map Upgrade Complete.")
