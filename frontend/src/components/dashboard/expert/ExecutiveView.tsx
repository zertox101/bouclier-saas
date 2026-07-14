"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { Shield, TrendingUp, AlertCircle, Activity, Globe, Users, Briefcase, Zap } from "lucide-react";
import { apiClient } from '@/lib/api-client';

export default function ExecutiveView() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const json = await apiClient('/api/soc-expert/summary');
        setData(json);
      } catch (e) { console.error("Executive data fetch error"); }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const riskScore = data?.risk_score || 0;
  
  return (
    <div className="h-full flex flex-col gap-6 font-sans text-slate-200">
      {/* ── Header ── */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Executive Security Brief</h2>
          <p className="text-slate-400 text-sm">High-level posture & strategic risk assessment</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Activity className="w-4 h-4" /> System Nominal
          </div>
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold flex items-center gap-2">
            SLA: {data?.sla_percent || 99.9}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1">
        
        {/* ── Global Risk Score (The main gauge) ── */}
        <div className="col-span-4 bg-[#13101d] rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
           <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-8">Overall Risk Posture</h3>
           
           <div className="relative w-64 h-64">
             <ReactECharts
                option={{
                  series: [{
                    type: 'gauge',
                    startAngle: 210,
                    endAngle: -30,
                    min: 0, max: 100,
                    splitNumber: 10,
                    itemStyle: { color: riskScore > 70 ? '#ef4444' : riskScore > 40 ? '#f59e0b' : '#3b82f6' },
                    progress: { show: true, width: 12 },
                    pointer: { show: false },
                    axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(255,255,255,0.05)']] } },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    detail: { show: false },
                    data: [{ value: riskScore }]
                  }]
                }}
                style={{ height: '100%', width: '100%' }}
             />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white">{riskScore}</span>
                <span className="text-xs font-bold text-slate-500 uppercase">Risk Index</span>
             </div>
           </div>

           <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-white/5 rounded-2xl text-center">
                 <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Weekly Trend</p>
                 <p className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                   <TrendingUp className="w-3 h-3 rotate-180" /> -12.4%
                 </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl text-center">
                 <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Threat Level</p>
                 <p className={riskScore > 70 ? "text-red-500 font-bold" : "text-blue-400 font-bold"}>
                   {riskScore > 70 ? "ELEVATED" : "MODERATE"}
                 </p>
              </div>
           </div>
        </div>

        {/* ── Tactical Summary ── */}
        <div className="col-span-8 flex flex-col gap-6">
           
           {/* Row of quick stats */}
           <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase">Active Nodes</span>
                 </div>
                 <p className="text-2xl font-black text-white">4,151</p>
              </div>
              <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-bold uppercase">Open Incidents</span>
                 </div>
                 <p className="text-2xl font-black text-white">{data?.active_incidents?.Critical || 0}</p>
              </div>
              <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-bold uppercase">Geo Origins</span>
                 </div>
                 <p className="text-2xl font-black text-white">{data?.top_countries?.length || 0}</p>
              </div>
              <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase">AI Accuracy</span>
                 </div>
                 <p className="text-2xl font-black text-white">{data?.ai_metrics?.accuracy || 98.4}%</p>
              </div>
           </div>

           {/* Sector & Industry Breakdown */}
           <div className="flex-1 grid grid-cols-2 gap-6">
              <div className="bg-[#13101d] rounded-3xl border border-white/5 p-6 flex flex-col">
                 <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Briefcase className="w-3 h-3" /> Industry Targeting
                 </h3>
                 <div className="flex-1 space-y-4">
                    {data?.industry_stats?.map((s: any, i: number) => (
                       <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold uppercase">
                             <span>{s.icon} {s.label}</span>
                             <span>{((s.val / data.total_alerts_24h) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-blue-500" 
                               style={{ width: `${(s.val / data.total_alerts_24h) * 100}%` }}
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-[#13101d] rounded-3xl border border-white/5 p-6 flex flex-col">
                 <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Users className="w-3 h-3" /> Personnel Compliance
                 </h3>
                 <div className="flex-1 flex flex-col justify-center gap-6">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center font-black text-lg">
                         84%
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white uppercase">Security Training</p>
                          <p className="text-[10px] text-slate-500">Q2 Target: 95%</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-black text-lg">
                         92%
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white uppercase">MFA Adoption</p>
                          <p className="text-[10px] text-slate-500">Global Coverage</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
