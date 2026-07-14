"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Battery, Droplets, Thermometer, Zap, AlertTriangle, Server } from "lucide-react";

// --- Components ---
const MetricCard = ({ title, value, unit, subtitle, trend, trendColor, icon: Icon, chartColor, data }: any) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-2 text-slate-300">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold">{title}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-bold text-white">{value}</span>
      <span className="text-lg font-medium text-slate-400">{unit}</span>
      {trend && (
        <span className={`text-sm font-bold ${trendColor} ml-2`}>
          {trend}
        </span>
      )}
    </div>
    <div className="h-12 w-full mt-2">
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
    <p className="text-[10px] text-slate-500 text-center mt-2">{subtitle}</p>
  </div>
);

// CSS Isometric Racks
const IsoRack = ({ x, y, val, color }: any) => {
  return (
    <div
      className="absolute flex items-end justify-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: "40px",
        height: "80px",
        transform: "translate(-50%, -100%)",
      }}
    >
      <div
        className="relative flex items-center justify-center font-bold text-black"
        style={{
          width: "36px",
          height: `${Math.max(20, val * 0.6)}px`,
          backgroundColor: color,
          borderRadius: "4px",
          boxShadow: `0 0 15px ${color}80, inset 0 0 10px rgba(255,255,255,0.5)`,
          border: "1px solid rgba(255,255,255,0.2)",
          zIndex: Math.floor(y),
        }}
      >
        <span className="text-[11px] px-1 bg-black/20 rounded backdrop-blur-sm">{val}</span>
        {/* Top pseudo face for 3D effect */}
        <div 
          className="absolute top-0 left-0 w-full h-[8px] bg-white/30 rounded-t-[4px] pointer-events-none"
        />
      </div>
    </div>
  );
};

import { apiClient } from '@/lib/api-client';

export default function DatacenterSensors() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const json = await apiClient('/api/soc-expert/summary');
        setData(json);
      } catch (e) { console.error("Expert data fetch error"); }
      finally { setLoading(false); }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [API]);

  const powerData = data?.hourly_trend?.map((h: any) => h.critical + h.high + h.medium) || [40, 42, 45, 43, 46, 48, 45, 50, 49, 48, 52, 50, 51];
  const waterData = [98, 99, 100, 102, 101, 102, 102, 101, 102, 100, 102]; // Mocked as not in API yet
  const tempData = [100, 102, 104, 105, 106, 104, 105, 106, 105, 106]; // Mocked as not in API yet

  const totalAlerts = data?.total_alerts_24h || 0;
  const riskScore = data?.risk_score || 82;

  return (
    <div className="h-full flex flex-col font-sans text-slate-200">
      <h2 className="text-2xl font-bold text-white mb-6">Datacenter Sensors</h2>
      
      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        
        {/* Left Side (Metrics + Heatmap) */}
        <div className="col-span-8 flex flex-col h-full">
          {/* Top 3 Metrics */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <MetricCard 
              title="Power Utilization" value={totalAlerts.toLocaleString()} unit="Flux" subtitle="Total Alerts (Last 24h)"
              trend="" trendColor="" icon={Battery} chartColor="#ef4444" data={powerData}
            />
            <MetricCard 
              title="Capacity Status" value={riskScore} unit="%" subtitle="Security Risk Index"
              trend={riskScore > 70 ? "↑ Warning" : "↓ Stable"} trendColor={riskScore > 70 ? "text-red-400" : "text-emerald-400"} icon={Droplets} chartColor="#3b82f6" data={waterData}
            />
            <MetricCard 
              title="Node Connectivity" value={data?.active_incidents?.Critical || 0} unit="Crit" subtitle="Active Critical Incidents"
              trend="" trendColor="" icon={Thermometer} chartColor="#ef4444" data={tempData}
            />
          </div>

          {/* Heatmap Area */}
          <div className="flex-1 relative bg-[#13101d] rounded-2xl border border-white/5 overflow-hidden flex flex-col p-4 shadow-inner">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2 z-10">
              <Server className="w-4 h-4" /> Server Room Heatmap
            </div>

            <div className="absolute top-4 right-4 z-10 text-[10px] space-y-1 bg-black/40 p-2 rounded-lg border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-[#3b82f6] rounded-full"></div> Safe 0-50°</div>
              <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-[#eab308] rounded-full"></div> Low 50-70°</div>
              <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-[#ef4444] rounded-full"></div> High 70-100°</div>
            </div>

            {/* Pseudo 3D Platform container */}
            <div className="flex-1 relative flex items-center justify-center">
               <div 
                 className="relative w-[80%] h-[70%]"
                 style={{
                   transform: 'rotateX(60deg) rotateZ(-45deg)',
                   transformStyle: 'preserve-3d',
                   background: 'rgba(255,255,255,0.02)',
                   border: '2px solid rgba(255,255,255,0.05)',
                   borderRadius: '20px',
                   boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.5)',
                 }}
               >
                 {/* Floor grid */}
                 <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                 
                 {/* Decorative Racks (mapped to x,y percentages of the floor) */}
                 {/* Using un-rotated child elements that counter-rotate to stand upright */}
                 <div className="absolute inset-0" style={{ transform: 'rotateZ(45deg) rotateX(-60deg)', pointerEvents: 'none' }}>
                    {/* Row 1 */}
                    <IsoRack x={20} y={40} val={data?.priority?.low || 42} color="#3b82f6" />
                    <IsoRack x={35} y={50} val={data?.priority?.medium || 46} color="#eab308" />
                    <IsoRack x={50} y={60} val={data?.priority?.high || 43} color="#f97316" />
                    <IsoRack x={65} y={70} val={data?.priority?.critical || 39} color="#ef4444" />
                    <IsoRack x={80} y={80} val={data?.active_incidents?.Critical || 47} color="#ef4444" />
                    
                    {/* Row 2 */}
                    <IsoRack x={40} y={30} val={12} color="#3b82f6" />
                    <IsoRack x={55} y={40} val={25} color="#eab308" />
                    <IsoRack x={70} y={50} val={57} color="#f97316" />
                    <IsoRack x={85} y={60} val={64} color="#ef4444" />

                    {/* Row 3 */}
                    <IsoRack x={60} y={20} val={10} color="#3b82f6" />
                    <IsoRack x={75} y={30} val={15} color="#eab308" />
                    <IsoRack x={90} y={40} val={22} color="#f97316" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side (Charts & Tables) */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
          
          <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5 h-[280px] flex flex-col">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
              <Zap className="w-4 h-4" /> Threat Velocity
            </div>
            <div className="flex-1">
              <ReactECharts
                option={{
                  grid: { top: 10, bottom: 40, left: 30, right: 10 },
                  xAxis: { 
                    type: 'category', 
                    data: data?.hourly_trend?.map((h: any) => h.t) || ['11:00 AM', '7:00 PM', '3:00 AM', '11:00 AM'],
                    axisLabel: { color: '#64748b', fontSize: 10 }
                  },
                  yAxis: { 
                    type: 'value',
                    axisLabel: { color: '#64748b', fontSize: 10 },
                    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
                  },
                  series: [
                    { name: 'Critical', type: 'line', data: data?.hourly_trend?.map((h: any) => h.critical) || [10, 20, 15, 25], smooth: true, symbol: 'none', lineStyle: { color: '#ef4444' } },
                    { name: 'High', type: 'line', data: data?.hourly_trend?.map((h: any) => h.high) || [20, 30, 25, 35], smooth: true, symbol: 'none', lineStyle: { color: '#f97316' } },
                    { name: 'Medium', type: 'line', data: data?.hourly_trend?.map((h: any) => h.medium) || [30, 40, 35, 45], smooth: true, symbol: 'none', lineStyle: { color: '#eab308' } }
                  ]
                }}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </div>

          <div className="bg-[#13101d] p-4 rounded-2xl border border-white/5 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
              <AlertTriangle className="w-4 h-4" /> Live Threat Intel
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-white/10">
                    <th className="pb-2 font-medium">Host</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {data?.latest_alerts?.slice(0, 10).map((alert: any, i: number) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 font-mono text-blue-400">{alert.src_ip}</td>
                      <td className="py-2 text-[10px]">{alert.description}</td>
                      <td className="py-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>
                          {alert.severity}
                        </span>
                      </td>
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
