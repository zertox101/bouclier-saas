"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Laptop, Database, Globe } from "lucide-react";

// Tiny sparkline card
const StatCard = ({ title, value, trend, trendVal, chartColor, data }: any) => (
  <div className="bg-[#13101d] border border-white/5 p-3 rounded-2xl flex flex-col justify-between overflow-hidden relative">
    <h3 className="text-[10px] font-bold text-slate-400 mb-1 z-10">{title}</h3>
    <div className="flex items-baseline gap-2 z-10">
      <span className="text-3xl font-black text-white">{value}</span>
      <span className="text-xs font-bold text-slate-400 flex items-center">{trend} {trendVal}</span>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-10 opacity-70">
      <ReactECharts
        option={{
          grid: { top: 0, bottom: 0, left: 0, right: 0 },
          xAxis: { type: 'category', show: false, data: data.map((_: any, i: number) => i) },
          yAxis: { type: 'value', show: false, min: 'dataMin' },
          series: [{
            data,
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { color: chartColor, width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${chartColor}40` },
                { offset: 1, color: `${chartColor}00` }
              ])
            }
          }]
        }}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  </div>
);

// Map Pie Chart Marker
const MapPie = ({ x, y, size, c1, c2, c3 }: any) => (
  <div 
    className="absolute rounded-full border border-[#13101d] overflow-hidden"
    style={{
      left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px`, transform: 'translate(-50%, -50%)',
      background: `conic-gradient(#06b6d4 0% ${c1}%, #d946ef ${c1}% ${c1+c2}%, #3b82f6 ${c1+c2}% 100%)`
    }}
  />
);

import { apiClient } from '@/lib/api-client';
import ExecutiveView from "./ExecutiveView";
import NetworkAccess from "./NetworkAccess";

export default function DeviceSecurity() {
  const [data, setData] = React.useState<any>(null);
  const [activeSubView, setActiveSubView] = React.useState<"main" | "executive" | "network">("main");

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

  const lineData1 = [900, 920, 910, 950, 940, 984];
  const lineData2 = [500, 480, 490, 510, 492];
  const lineData3 = [1300, 1350, 1400, 1450, 1476];
  const lineData4 = [900, 880, 850, 870, 861];

  const totalDevices = data?.total_alerts_24h ? Math.floor(data.total_alerts_24h * 1.5) : 13653;
  const compliance = data?.risk_score ? 100 - data.risk_score : 72;

  return (
    <div className="h-full flex flex-col font-sans text-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Employee Device Security</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveSubView(activeSubView === "executive" ? "main" : "executive")}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold transition-all ${activeSubView === "executive" ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-[#13101d] border-white/10 text-slate-400 hover:bg-white/5"}`}
          >
            <Laptop className="w-4 h-4" /> Executive View
          </button>
          <button 
            onClick={() => setActiveSubView(activeSubView === "network" ? "main" : "network")}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold transition-all ${activeSubView === "network" ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-transparent border-transparent text-slate-400 hover:text-white"}`}
          >
            <Database className="w-4 h-4" /> Network Access
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {activeSubView === "executive" ? (
          <ExecutiveView />
        ) : activeSubView === "network" ? (
          <NetworkAccess />
        ) : (
          <>
            {/* Top Row */}
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-1 bg-[#13101d] border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 mb-2">Device Compliance</h3>
                <div className="flex-1 flex items-center justify-between">
                  <div className="w-20 h-20">
                    <ReactECharts
                      option={{
                        series: [{
                          type: 'pie', radius: ['70%', '100%'], avoidLabelOverlap: false, label: { show: false },
                          data: [
                            { value: compliance, itemStyle: { color: '#22c55e' } },
                            { value: Math.floor((100 - compliance) * 0.6), itemStyle: { color: '#f59e0b' } },
                            { value: Math.ceil((100 - compliance) * 0.4), itemStyle: { color: '#ef4444' } }
                          ]
                        }]
                      }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                  <div className="text-[9px] font-medium space-y-1">
                    <div className="flex justify-between gap-4"><span className="text-[#22c55e]">● Compliant</span><span>{compliance}%</span></div>
                    <div className="flex justify-between gap-4"><span className="text-[#f59e0b]">● Exceptions</span><span>{Math.floor((100 - compliance) * 0.6)}%</span></div>
                    <div className="flex justify-between gap-4"><span className="text-[#ef4444]">● Non compliant</span><span>{Math.ceil((100 - compliance) * 0.4)}%</span></div>
                  </div>
                </div>
              </div>
              <StatCard title="Total Network Assets" value={totalDevices.toLocaleString()} trend="↓" trendVal="-2%" chartColor="#d946ef" data={lineData1} />
              <StatCard title="Critical Incidents" value={data?.active_incidents?.Critical || 0} trend="↑" trendVal="LIVE" chartColor="#8b5cf6" data={lineData2} />
              <StatCard title="High Threats" value={data?.active_incidents?.High || 0} trend="↑" trendVal="LIVE" chartColor="#0ea5e9" data={lineData3} />
              <StatCard title="AI Reasoning Detections" value={data?.ai_metrics?.total_trained ? Math.floor(data.ai_metrics.total_trained / 1000) + "k" : "352k"} trend="↑" trendVal="98.4%" chartColor="#10b981" data={lineData4} />
            </div>

            {/* Middle Row */}
            <div className="flex-1 grid grid-cols-5 gap-4 overflow-hidden">
              {/* Left Column */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="bg-[#13101d] border border-white/5 p-4 rounded-2xl">
                  <h3 className="text-[10px] font-bold text-slate-400 mb-4">Security Training Completion</h3>
                  <div className="relative h-6 w-full bg-slate-800 rounded-md flex overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '84%' }}></div>
                  </div>
                  <div className="relative w-full h-4 mt-2">
                    {/* Slider thumb */}
                    <div className="absolute top-[-28px] bg-white text-black font-bold text-xs px-2 py-1 rounded shadow-md border-2 border-[#13101d]" style={{ left: '84%', transform: 'translateX(-50%)' }}>
                      84
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#13101d] border border-white/5 p-4 rounded-2xl flex-1 flex items-center justify-center gap-4">
                  <Laptop className="w-16 h-16 text-slate-500" />
                  <div>
                    <p className="text-4xl font-black text-white">{totalDevices.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total Devices</p>
                  </div>
                </div>
              </div>

              {/* Map Area */}
              <div className="col-span-4 bg-[#0a0a10] rounded-3xl relative overflow-hidden border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                 {/* Map Header Overlay */}
                 <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 pointer-events-none">
                    <div className="flex items-center gap-2">
                       <Globe className="w-4 h-4 text-blue-400 animate-spin-slow" />
                       <h3 className="text-white font-black text-xs uppercase tracking-widest">Global Threat Matrix</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Real-time coordinate intercept</p>
                 </div>

                 {/* Live Feed Overlay (Right) */}
                 <div className="absolute top-6 right-6 z-20 w-48 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2 pointer-events-none">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                       <span>Latest Intercepts</span>
                       <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-2 max-h-32 overflow-hidden">
                       {data?.latest_alerts?.slice(0, 4).map((a: any, i: number) => (
                          <div key={i} className="flex flex-col border-l border-red-500/50 pl-2">
                             <span className="text-[9px] text-blue-400 font-mono font-bold leading-none">{a.src_ip}</span>
                             <span className="text-[8px] text-slate-500 truncate leading-tight">{a.source_country} • {a.severity}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Legend Overlay (Bottom) */}
                 <div className="absolute bottom-6 left-6 z-20 flex gap-6 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full pointer-events-none">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" /> <span className="text-[9px] font-bold text-slate-300">CRITICAL</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" /> <span className="text-[9px] font-bold text-slate-300">HIGH</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" /> <span className="text-[9px] font-bold text-slate-300">SCAN</span></div>
                 </div>

                 {/* The Interactive Map */}
                 <div className="absolute inset-0 z-10">
                   <ReactECharts
                    option={{
                      backgroundColor: 'transparent',
                      geo: {
                        map: 'world',
                        roam: false,
                        emphasis: { disabled: true },
                        itemStyle: {
                          areaColor: '#1a1a2e',
                          borderColor: '#3b82f633',
                          borderWidth: 1
                        },
                        label: { show: false }
                      },
                      series: [
                        {
                          type: 'scatter',
                          coordinateSystem: 'geo',
                          data: data?.geo_points?.map((p: any) => ({
                            name: p.source_country,
                            value: [p.value[0], p.value[1], p.value[2]],
                            itemStyle: { color: p.severity === 'Critical' ? '#ef4444' : p.severity === 'High' ? '#f97316' : '#3b82f6' }
                          })) || [],
                          symbolSize: (val: any) => 8 + (val[2] * 4),
                          itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(255,255,255,0.2)'
                          }
                        },
                        {
                          type: 'effectScatter',
                          coordinateSystem: 'geo',
                          data: data?.geo_points?.filter((p: any) => p.severity === 'Critical').map((p: any) => ({
                            name: p.source_country,
                            value: [p.value[0], p.value[1], p.value[2]],
                          })) || [],
                          symbolSize: (val: any) => 12 + (val[2] * 5),
                          showEffectOn: 'render',
                          rippleEffect: { brushType: 'stroke', scale: 4, period: 3 },
                          itemStyle: { color: '#ef4444', shadowBlur: 15, shadowColor: '#ef4444' },
                          zlevel: 1
                        }
                      ]
                    }}
                    style={{ height: '100%', width: '100%' }}
                   />
                 </div>
                 
                 {/* Map Noise Texture */}
                 <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-4 h-24">
              <div className="bg-[#13101d] border border-white/5 p-4 rounded-2xl flex items-end">
                <div className="flex gap-4 w-full">
                  <div className="text-[10px] font-bold text-slate-400 mb-2 w-1/3">Attack Velocity (Last 8 Hours)</div>
                  <div className="flex-1 h-10 border-b border-white/10 flex items-end justify-between px-2">
                    {data?.attack_trends?.map((t: any, i: number) => (
                      <div key={i} className="w-2 bg-blue-500 rounded-t" style={{ height: `${Math.min(t[Object.keys(t)[1]] * 5, 40)}px` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-[#13101d] border border-white/5 p-4 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 mb-2">System Health Index</div>
                <div className="w-full h-8 flex items-center justify-end">
                    <span className="text-[8px] text-slate-500 mr-4">Overall Performance: {data?.sla_percent || 99.9}%</span>
                    <div className="h-1 w-32 bg-emerald-500/30 rounded">
                      <div className="h-full bg-emerald-500 w-[99%] rounded" />
                    </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
