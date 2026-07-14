"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { apiClient } from '@/lib/api-client';

const HexMap = ({ val, color }: { val: number, color: string }) => {
  const isHigh = val > 70;
  const isMed = val > 40 && val <= 70;
  return (
    <div className="flex flex-col">
      <span className={`text-3xl font-bold ${color}`}>{val}</span>
      <svg width="80" height="60" viewBox="0 0 100 80" className="mt-2 opacity-80">
        {/* Just draw some hexes manually */}
        <g stroke="#ffffff20" strokeWidth="1">
          <path d="M 20 10 L 30 10 L 35 18 L 30 27 L 20 27 L 15 18 Z" fill={isHigh ? "#ef4444" : "#4c1d95"} />
          <path d="M 32 10 L 42 10 L 47 18 L 42 27 L 32 27 L 27 18 Z" fill={isMed ? "#d946ef" : "#1e1b4b"} />
          <path d="M 14 20 L 24 20 L 29 28 L 24 37 L 14 37 L 9 28 Z" fill="#312e81" />
          <path d="M 26 20 L 36 20 L 41 28 L 36 37 L 26 37 L 21 28 Z" fill={color} />
          <path d="M 38 20 L 48 20 L 53 28 L 48 37 L 38 37 L 33 28 Z" fill="#4c1d95" />
          <path d="M 20 30 L 30 30 L 35 38 L 30 47 L 20 47 L 15 38 Z" fill={isHigh ? "#f43f5e" : "#1e1b4b"} />
          <path d="M 32 30 L 42 30 L 47 38 L 42 47 L 32 47 L 27 38 Z" fill="#312e81" />
        </g>
      </svg>
    </div>
  );
};

export default function NetworkHub() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const json = await apiClient('/api/soc-expert/summary');
        setData(json);
      } catch (e) { console.error("Expert data fetch error"); }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const riskScore = data?.risk_score || 72;
  const criticalAlerts = data?.priority?.critical || 0;
  const highAlerts = data?.priority?.high || 0;
  const mediumAlerts = data?.priority?.medium || 0;

  return (
    <div className="h-full flex flex-col font-sans text-slate-200">
      <h2 className="text-2xl font-bold text-white mb-6">Europe Network Hub</h2>
      
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Area (Hex Maps) */}
        <div className="col-span-3 flex flex-col justify-between h-full py-10 pl-6">
          <div className="bg-[#13101d] border border-white/5 p-4 rounded-2xl shadow-lg w-48 relative z-10">
            <h3 className="text-[11px] font-semibold text-slate-400 mb-2 uppercase">Critical Impact</h3>
            <HexMap val={criticalAlerts} color="text-red-500" />
          </div>
          
          <div className="bg-[#13101d] border border-white/5 p-4 rounded-2xl shadow-lg w-48 ml-12 relative z-10">
            <h3 className="text-[11px] font-semibold text-slate-400 mb-2 uppercase">High Threats</h3>
            <HexMap val={highAlerts} color="text-purple-400" />
          </div>

          <div className="bg-[#13101d] border border-white/5 p-4 rounded-2xl shadow-lg w-48 relative z-10">
            <h3 className="text-[11px] font-semibold text-slate-400 mb-2 uppercase">Medium Noise</h3>
            <HexMap val={mediumAlerts} color="text-emerald-400" />
          </div>
        </div>

        {/* Center Area (SVG Topology) */}
        <div className="col-span-5 relative flex items-center justify-center">
          {/* Center Area (SVG Topology) */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/4e/Europe_satellite_orthographic.jpg')] bg-cover bg-center rounded-2xl mix-blend-screen grayscale" />
          
          <svg className="w-full h-full relative z-10" viewBox="0 0 500 600">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id="g3" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* City regions */}
            <circle cx="150" cy="150" r="100" fill="none" stroke="#ffffff10" strokeWidth="1" />
            <circle cx="350" cy="150" r="100" fill="none" stroke="#ffffff10" strokeWidth="1" />
            <circle cx="250" cy="450" r="100" fill="none" stroke="#ffffff10" strokeWidth="1" />

            <text x="150" y="40" fill="#fff" fontSize="20" fontWeight="bold" textAnchor="middle">London</text>
            <text x="350" y="40" fill="#fff" fontSize="20" fontWeight="bold" textAnchor="middle">Paris</text>
            <text x="250" y="580" fill="#fff" fontSize="20" fontWeight="bold" textAnchor="middle">Barcelona</text>

            {/* Links */}
            <path d="M 150 150 Q 250 150 250 300" fill="none" stroke="url(#g1)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 350 150 Q 250 150 250 300" fill="none" stroke="url(#g3)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 250 450 Q 250 350 250 300" fill="none" stroke="url(#g2)" strokeWidth="12" strokeLinecap="round" />
            
            <path d="M 120 180 Q 200 300 200 400" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
            <path d="M 380 180 Q 300 300 300 400" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
            <path d="M 150 150 L 350 150 L 250 450 Z" fill="none" stroke="#2563eb40" strokeWidth="20" strokeLinejoin="round" />

            {/* Nodes */}
            <g transform="translate(150, 150)">
               <rect x="-30" y="-15" width="60" height="30" rx="4" fill="#1e1b4b" stroke="#ef4444" strokeWidth="2" />
               <text x="0" y="5" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">LAYER 3</text>
            </g>
            <g transform="translate(350, 150)">
               <rect x="-30" y="-15" width="60" height="30" rx="4" fill="#1e1b4b" stroke="#d946ef" strokeWidth="2" />
               <text x="0" y="5" fill="#d946ef" fontSize="12" fontWeight="bold" textAnchor="middle">LAYER 3</text>
            </g>
            <g transform="translate(250, 450)">
               <rect x="-30" y="-15" width="60" height="30" rx="4" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="2" />
               <text x="0" y="5" fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">LAYER 2</text>
            </g>
            
            {/* PSTN Center */}
            <g transform="translate(250, 280)">
               <rect x="-40" y="-20" width="80" height="40" rx="20" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
               <text x="0" y="5" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">PSTN</text>
            </g>
          </svg>
        </div>

        {/* Right Area (Metrics) */}
        <div className="col-span-4 flex flex-col gap-4 py-4 pr-6">
          <div className="bg-[#13101d] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
            <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase">Overall System Risk Index</h3>
            <div className="relative h-6 w-full bg-slate-800 rounded-full overflow-hidden flex">
               <div className="h-full bg-blue-600" style={{ width: `${Math.min(riskScore, 40)}%` }}></div>
               <div className="h-full bg-purple-600" style={{ width: `${Math.max(0, Math.min(riskScore - 40, 30))}%` }}></div>
               <div className="h-full bg-red-500" style={{ width: `${Math.max(0, riskScore - 70)}%` }}></div>
            </div>
            <div className="relative w-full h-4 mt-1">
               {/* Slider thumb */}
               <div className="absolute top-[-24px] bg-white text-black font-bold text-xs px-2 py-1 rounded shadow-md" style={{ left: `${riskScore}%`, transform: 'translateX(-50%)' }}>
                 {riskScore}
               </div>
               <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                 <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
               <h3 className="text-[10px] text-slate-400 font-bold uppercase mb-2">Total Alerts</h3>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-red-500">{data?.total_alerts_24h || 0}</span>
                 <span className="text-xs font-bold text-emerald-400">↑ LIVE</span>
               </div>
            </div>
            <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
               <h3 className="text-[10px] text-slate-400 font-bold uppercase mb-2">AI Accuracy</h3>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-white">{data?.ai_metrics?.accuracy || 98.4}%</span>
               </div>
            </div>
            <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
               <h3 className="text-[10px] text-slate-400 font-bold uppercase mb-2">SLA Status</h3>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-white">{data?.sla_percent || 99.9}%</span>
               </div>
            </div>
            <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
               <h3 className="text-[10px] text-slate-400 font-bold uppercase mb-2">Inference</h3>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-white">{data?.ai_metrics?.inference_ms || 1.2}ms</span>
               </div>
            </div>
          </div>

          <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5 flex-1 flex flex-col">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase mb-2">Sector Threat Distribution</h3>
            <div className="h-24 w-full flex items-center justify-center -mt-4 mb-2">
               <ReactECharts
                option={{
                  series: [{
                    type: 'pie', radius: ['60%', '80%'], avoidLabelOverlap: false,
                    label: { show: false },
                    data: data?.industry_stats?.map((s: any, i: number) => ({
                      value: s.val,
                      name: s.label,
                      itemStyle: { color: i === 0 ? '#ef4444' : i === 1 ? '#3b82f6' : i === 2 ? '#8b5cf6' : '#d946ef' }
                    })) || []
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
               />
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-[9px] text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-white/10 uppercase font-bold">
                    <th className="pb-1">Time</th>
                    <th className="pb-1">Source</th>
                    <th className="pb-1">Event</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300 font-mono">
                  {data?.latest_alerts?.slice(0, 10).map((alert: any, i: number) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-1.5">{alert.time}</td>
                      <td className="py-1.5">{alert.source_country}</td>
                      <td className="py-1.5 text-blue-400 truncate max-w-[120px]">{alert.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
