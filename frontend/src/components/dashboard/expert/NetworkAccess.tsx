"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { Network, Server, Lock, ShieldCheck, Wifi, ExternalLink, Activity, HardDrive, Globe } from "lucide-react";
import { apiClient } from '@/lib/api-client';

export default function NetworkAccess() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const json = await apiClient('/api/soc-expert/summary');
        setData(json);
      } catch (e) { console.error("Network Access data fetch error"); }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 font-sans text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">Network Access Controller</h2>
          <p className="text-slate-400 text-xs font-medium">Monitoring perimeter security & internal data flows</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
           <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Firewall: FortiCore-V5</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* ── Left Column: Network Topology & Status ── */}
        <div className="col-span-8 flex flex-col gap-6">
           
           <div className="flex-1 bg-[#13101d] rounded-3xl border border-white/5 p-6 relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Network className="w-4 h-4" /> Transit & Access Nodes
                 </h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Authorized
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Blocked
                    </div>
                 </div>
              </div>

              <div className="flex-1 relative flex items-center justify-center">
                 <svg className="w-full h-full max-h-[300px]" viewBox="0 0 800 400">
                    {/* Simplified topology lines */}
                    <path d="M 100 200 L 300 200 M 500 200 L 700 200 M 400 100 L 400 300" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />
                    
                    {/* Internet Edge */}
                    <g transform="translate(100, 200)">
                       <circle r="40" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" />
                       <Globe className="w-8 h-8 text-blue-400 -translate-x-4 -translate-y-4" />
                       <text y="60" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold uppercase">Internet Edge</text>
                    </g>

                    {/* Core Firewall */}
                    <g transform="translate(400, 200)">
                       <rect x="-50" y="-30" width="100" height="60" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                       <Lock className="w-8 h-8 text-indigo-400 -translate-x-4 -translate-y-4" />
                       <text y="50" textAnchor="middle" className="fill-white text-[11px] font-black uppercase">Core Gateway</text>
                    </g>

                    {/* Internal Segments */}
                    <g transform="translate(700, 100)">
                       <circle r="30" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1" />
                       <Server className="w-6 h-6 text-emerald-400 -translate-x-3 -translate-y-3" />
                       <text x="45" y="5" className="fill-slate-400 text-[10px] font-bold">VLAN-10 (Prod)</text>
                    </g>
                    <g transform="translate(700, 300)">
                       <circle r="30" fill="rgba(168, 85, 247, 0.1)" stroke="#a855f7" strokeWidth="1" />
                       <Wifi className="w-6 h-6 text-purple-400 -translate-x-3 -translate-y-3" />
                       <text x="45" y="5" className="fill-slate-400 text-[10px] font-bold">VLAN-20 (Wifi)</text>
                    </g>

                    {/* Data flow particles (simulated) */}
                    <circle r="3" fill="#3b82f6" className="animate-ping">
                       <animateMotion path="M 100 200 L 400 200" dur="2s" repeatCount="indefinite" />
                    </circle>
                 </svg>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Activity className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Throughput</p>
                    <p className="text-xl font-black text-white">2.4 Gbps</p>
                 </div>
              </div>
              <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <HardDrive className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Active Conn.</p>
                    <p className="text-xl font-black text-white">45,102</p>
                 </div>
              </div>
              <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Drops/Sec</p>
                    <p className="text-xl font-black text-white">128</p>
                 </div>
              </div>
           </div>
        </div>

        {/* ── Right Column: Traffic Logs & Protocol Analysis ── */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
           
           <div className="bg-[#13101d] rounded-3xl border border-white/5 p-6 h-[250px] flex flex-col">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Protocol Distribution</h3>
              <div className="flex-1">
                 <ReactECharts
                    option={{
                      series: [{
                        type: 'pie', radius: ['50%', '80%'], avoidLabelOverlap: false,
                        label: { show: false },
                        data: [
                          { value: 65, name: 'HTTPS', itemStyle: { color: '#3b82f6' } },
                          { value: 15, name: 'SSH', itemStyle: { color: '#a855f7' } },
                          { value: 10, name: 'DNS', itemStyle: { color: '#10b981' } },
                          { value: 10, name: 'Other', itemStyle: { color: '#64748b' } }
                        ]
                      }]
                    }}
                    style={{ height: '100%', width: '100%' }}
                 />
              </div>
           </div>

           <div className="flex-1 bg-[#13101d] rounded-3xl border border-white/5 p-6 flex flex-col overflow-hidden">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Ingress/Egress Logs</h3>
              <div className="flex-1 overflow-auto custom-scrollbar">
                 <div className="space-y-3">
                    {data?.latest_alerts?.slice(0, 15).map((alert: any, i: number) => (
                       <div key={i} className="flex items-center justify-between text-[10px] border-b border-white/[0.03] pb-2">
                          <div className="flex flex-col">
                             <span className="text-blue-400 font-mono font-bold">{alert.src_ip}</span>
                             <span className="text-slate-500">{alert.time}</span>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className={`font-black uppercase px-1.5 py-0.5 rounded ${alert.severity === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                               {alert.severity === 'Critical' ? 'BLOCKED' : 'PASS'}
                             </span>
                             <span className="text-slate-600 mt-0.5 flex items-center gap-1">
                               TCP/443 <ExternalLink className="w-2 h-2" />
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
