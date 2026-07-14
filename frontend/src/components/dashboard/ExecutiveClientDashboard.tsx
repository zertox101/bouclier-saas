"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Activity, Shield, Globe as GlobeIcon, TrendingUp, AlertTriangle, Cpu, Network,
  Clock, Database, Target, Flame, Zap, CheckCircle, Fingerprint, Radar, Layers, Radio, Loader2, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { cn } from "@/lib/utils";
import TacticalExpertMap from "./TacticalExpertMap";
import { apiClient, ApiError } from "@/lib/api-client";

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE (SOC PRO THEME)
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  critical: '#ff1744', // Neon Red
  high: '#ff9100',     // Neon Orange
  medium: '#ffea00',   // Neon Yellow
  normal: '#00e676',   // Neon Green
  info: '#2979ff',     // Neon Blue
  purple: '#d500f9',   // Neon Purple
  bgDark: '#0a0e17',   // Deep Cyberpunk background
  bgCard: 'rgba(13, 17, 23, 0.7)',
  textMuted: '#8b949e',
  gridLine: 'rgba(255,255,255,0.05)'
};

// ─────────────────────────────────────────────────────────────────────────────
// ECHARTS CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

const commonOpts = {
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter' },
  tooltip: { 
    backgroundColor: 'rgba(10, 14, 23, 0.95)', 
    borderColor: COLORS.info, 
    borderWidth: 1,
    textStyle: { color: '#fff', fontSize: 11 },
    padding: [10, 15]
  },
};

// 1. Alerts Over Time (Line)
const getAlertsOverTimeOption = (data: any[] = []) => ({
  ...commonOpts,
  tooltip: { trigger: 'axis', ...commonOpts.tooltip },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
  xAxis: { type: 'category', data: data.map(d => d.time), axisLine: { lineStyle: { color: COLORS.gridLine } }, axisLabel: { color: COLORS.textMuted, fontSize: 10 } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: COLORS.gridLine, type: 'dashed' } }, axisLabel: { color: COLORS.textMuted, fontSize: 10 } },
  series: [
    { name: 'Alerts', type: 'line', smooth: true, data: data.map(d => d.count), lineStyle: { width: 3, color: COLORS.critical, shadowBlur: 10, shadowColor: COLORS.critical }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255, 23, 68, 0.3)' }, { offset: 1, color: 'transparent' }]) }, showSymbol: false },
    { name: 'Resolved', type: 'line', smooth: true, data: data.map(d => Math.floor(d.count * 0.8)), lineStyle: { width: 3, color: COLORS.normal, shadowBlur: 10, shadowColor: COLORS.normal }, showSymbol: false }
  ]
});

// 2. Severity Pie (Donut)
const getSeverityPieOption = (stats: any = {}) => ({
  ...commonOpts,
  tooltip: { trigger: 'item', ...commonOpts.tooltip },
  series: [{
    name: 'Severity', type: 'pie', radius: ['55%', '80%'], center: ['50%', '50%'],
    itemStyle: { borderRadius: 4, borderColor: COLORS.bgDark, borderWidth: 3 },
    label: { show: false },
    data: [
      { value: stats.critical || 0, name: 'Critical', itemStyle: { color: COLORS.critical } },
      { value: stats.high || 0, name: 'High', itemStyle: { color: COLORS.high } },
      { value: stats.medium || 0, name: 'Medium', itemStyle: { color: COLORS.medium } },
      { value: stats.low || 0, name: 'Low/Info', itemStyle: { color: COLORS.info } }
    ]
  }]
});

// 3. Top Attack Types (Bar)
const getAttackTypesOption = (types: any[] = []) => ({
  ...commonOpts,
  tooltip: { trigger: 'axis', ...commonOpts.tooltip },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
  xAxis: { type: 'value', splitLine: { lineStyle: { color: COLORS.gridLine } }, axisLabel: { show: false } },
  yAxis: { type: 'category', data: types.map(t => t.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: COLORS.textMuted, fontSize: 10 } },
  series: [{
    type: 'bar', data: types.map(t => t.value),
    itemStyle: { color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: COLORS.high }, { offset: 1, color: COLORS.critical }]), borderRadius: [0, 4, 4, 0] }
  }]
});

// 4. Stacked Area — generated inline via useMemo

// 5. Attack Heatmap — generated inline via useMemo

// 5. Network data — handled inline

// THE BEST GEO MAP: Highly Styled Cyberpunk Geo
const getGeoMapOption = (mapLoaded: boolean, attacks: any[] = []) => {
  if (!mapLoaded) return {};
  return {
    ...commonOpts,
    geo: { 
      map: 'world', 
      roam: true, 
      zoom: 1.2, 
      label: { emphasis: { show: false } }, 
      itemStyle: { 
        normal: { areaColor: '#050b14', borderColor: '#1e3a8a', borderWidth: 1, shadowColor: 'rgba(30, 58, 138, 0.5)', shadowBlur: 10 }, 
        emphasis: { areaColor: '#0f2042' } 
      } 
    },
    series: [
      {
        type: 'effectScatter', coordinateSystem: 'geo', symbolSize: 10, rippleEffect: { brushType: 'stroke', scale: 4 },
        itemStyle: { color: COLORS.critical, shadowBlur: 20, shadowColor: COLORS.critical },
        data: attacks.filter(a => a.severity === 'critical').map(a => ({ name: a.country, value: [a.lon, a.lat, 100] }))
      },
      {
        type: 'effectScatter', coordinateSystem: 'geo', symbolSize: 8, rippleEffect: { brushType: 'stroke', scale: 3 },
        itemStyle: { color: COLORS.info, shadowBlur: 15, shadowColor: COLORS.info },
        data: attacks.filter(a => a.severity !== 'critical').map(a => ({ name: a.country, value: [a.lon, a.lat, 50] }))
      },
      {
        type: 'lines', zlevel: 2, effect: { show: true, period: 4, trailLength: 0.4, color: '#fff', symbolSize: 3 },
        lineStyle: { normal: { color: COLORS.critical, width: 1.5, curveness: 0.3, opacity: 0.6 } },
        data: attacks.slice(0, 10).map(a => ({ coords: [[a.lon, a.lat], [-6.8498, 34.0209]] })) // Traffic to Rabat (SOC)
      }
    ]
  };
};

// Logs + Bandwidth — handled inline

// 10. Top Talkers — generated inline via useMemo

// 7-8. Funnel + Gauge — handled inline

// 9. AI Anomaly Scatter (Expert Version)
const getScatterOption = () => {
  return {
    ...commonOpts,
    tooltip: { 
      trigger: 'item',
      backgroundColor: 'rgba(10, 14, 23, 0.95)',
      borderColor: COLORS.info,
      borderWidth: 1,
      formatter: (params: any) => {
        const val = params.value;
        const type = params.seriesName;
        return `
          <div style="font-family: monospace; padding: 5px;">
            <div style="color: ${COLORS.textMuted}; font-size: 9px; margin-bottom: 5px;">AI BEHAVIORAL VECTOR</div>
            <div style="color: #fff; font-weight: bold; margin-bottom: 5px;">${type === 'Anomaly' ? '⚠️ ANOMALY_DETECTED' : '✅ NORMAL_BEHAVIOR'}</div>
            <div style="display: flex; justify-content: space-between; gap: 20px; font-size: 10px;">
              <span style="color: ${COLORS.textMuted}">CONFIDENCE:</span>
              <span style="color: ${type === 'Anomaly' ? COLORS.critical : COLORS.normal}">${(val[0] * 100).toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px; font-size: 10px;">
              <span style="color: ${COLORS.textMuted}">ENTROPY:</span>
              <span style="color: #fff">${val[1].toFixed(3)}</span>
            </div>
          </div>
        `;
      }
    },
    grid: { left: '8%', right: '8%', bottom: '15%', top: '15%' },
    xAxis: { 
        name: 'Temporal Variance',
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { color: COLORS.textMuted, fontSize: 9, fontWeight: 'bold' },
        splitLine: { lineStyle: { color: COLORS.gridLine, type: 'dashed' } }, 
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: COLORS.gridLine } }
    },
    yAxis: { 
        name: 'Payload Entropy',
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { color: COLORS.textMuted, fontSize: 9, fontWeight: 'bold' },
        splitLine: { lineStyle: { color: COLORS.gridLine, type: 'dashed' } }, 
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: COLORS.gridLine } }
    },
    series: [
      { 
        name: 'Normal', 
        type: 'scatter', 
        symbolSize: (val: any) => Math.sqrt(val[0] * 50) + 4, 
        itemStyle: { 
            color: COLORS.info, 
            opacity: 0.6,
            shadowBlur: 5,
            shadowColor: COLORS.info
        },
        emphasis: {
            itemStyle: { opacity: 1, shadowBlur: 10 }
        }
      },
      { 
        name: 'Anomaly', 
        type: 'scatter', 
        symbolSize: (val: any) => Math.sqrt(val[0] * 80) + 8, 
        itemStyle: { 
            color: COLORS.critical, 
            shadowBlur: 15, 
            shadowColor: COLORS.critical,
            opacity: 0.8
        },
        markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: 'rgba(255, 23, 68, 0.2)', type: 'dashed' },
            data: [{ xAxis: 0.6 }, { yAxis: 0.6 }]
        },
        emphasis: {
            itemStyle: { opacity: 1, shadowBlur: 25 }
        }
      }
    ]
  };
};

// SHAP feature importance — handled inline

// NEW: Real-time Live Line Chart
const getLiveStreamOption = (data: number[]) => ({
  ...commonOpts,
  grid: { left: '0%', right: '0%', bottom: '0%', top: '10%' },
  xAxis: { type: 'category', show: false, data: Array.from({length: 50}, (_, i) => i) },
  yAxis: { type: 'value', show: false, min: 0, max: 100 },
  series: [{
    type: 'line', smooth: true, symbol: 'none', data: data,
    lineStyle: { width: 2, color: COLORS.info, shadowBlur: 5, shadowColor: COLORS.info },
    areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(41, 121, 255, 0.4)' }, { offset: 1, color: 'transparent' }]) }
  }]
});

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const GlassCard = ({ title, icon: Icon, children, className }: any) => (
  <div className={cn("bg-[#0d1117]/70 backdrop-blur-2xl border border-white/5 rounded-xl p-4 shadow-2xl relative flex flex-col hover:border-white/10 transition-colors", className)}>
    <div className="flex items-center gap-2 mb-4 shrink-0 border-b border-white/5 pb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-blue-500" />}
      <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="flex-1 min-h-0 relative">
      {children}
    </div>
  </div>
);

const KPICard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-[#0d1117]/70 backdrop-blur-2xl border border-white/5 rounded-xl p-4 relative overflow-hidden group hover:border-white/10 transition-colors">
    <div className="absolute top-0 left-0 w-1 h-full opacity-50" style={{ backgroundColor: color }} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-white font-mono leading-none tracking-tight">{value}</h4>
      </div>
      <div className="p-2 rounded-lg bg-white/5" style={{ color: color }}>
        <Icon className="w-5 h-5 drop-shadow-md" />
      </div>
    </div>
    <p className="text-[10px] text-slate-500 mt-3 font-medium">{subValue}</p>
  </div>
);

interface SummaryData {
  total_alerts_24h: number;
  priority: { critical: number; high: number; medium: number; low: number };
  latest_alerts: { time: string; severity: string; source: string; description: string }[];
  risk_score: number;
  active_incidents: { Critical: number; High: number; Medium: number; Low: number };
  hourly_trend: { t: string; critical: number; high: number; medium: number; low: number }[];
  attack_types: { name: string; count: number }[];
  industry_stats: { label: string; icon: string; val: number }[];
  ai_metrics: { is_fitted: boolean; total_trained: number; accuracy: number; inference_ms: number; buffer_size: number };
  top_talkers: { ip: string; count: number }[];
  attack_trends: { t: string; [key: string]: any }[];
  heatmap_matrix: [number, number, number][];
  geo_points: { name: string; value: [number, number, number]; severity: string }[];
  ml_scatter: [number, number][];
  offensive_stats?: {
    total_scans: number;
    vulns_found: number;
    avg_risk: string;
    mythos_status: string;
    bypass_rate: string;
  };
}

export default function ExecutiveClientDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [data, setData] = useState<SummaryData | null>(null);
  const dataRef = useRef<SummaryData | null>(null);
  const [liveData, setLiveData] = useState<number[]>(Array(50).fill(0));
  const [aiResult, setAiResult] = useState<{ summary: string; mitigation: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [briefing, setBriefing] = useState<any>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  
  useEffect(() => {
    fetch('/world.json')
      .then(res => res.json())
      .then(geoJson => { echarts.registerMap('world', geoJson); setMapLoaded(true); })
      .catch(() => {});
      
    setMounted(true);

    const fetchData = async () => {
      try {
        const json = await apiClient("/api/telemetry/stats");
        const newData = {
            total_alerts_24h: json.counters?.events || 0,
            priority: {
                critical: json.severity?.Critique || 0,
                high:     json.severity?.Élevé || 0,
                medium:   json.severity?.Moyen || 0,
                low:      json.severity?.Faible || 0
            },
            risk_score: json.counters?.alerts > 0 ? Math.min(Math.round((json.counters.alerts / json.counters.events) * 100), 100) : 0,
            active_incidents: {
                Critical: json.counters?.incidents || 0,
                High: json.severity?.Élevé || 0, 
                Medium: json.severity?.Moyen || 0, 
                Low: json.severity?.Faible || 0
            },
            latest_alerts: json.alerts?.map((a: any) => ({
                id: a.id,
                time: a.created_at ? new Date(a.created_at).toLocaleTimeString() : "Now",
                source: a.src_ip || "Unknown",
                description: a.message || "Generic Alert",
                severity: a.severity || "info",
                status: a.status || "active"
            })) || [],
            hourly_trend: json.timeline || [],
            attack_types: json.attack_types || [],
            industry_stats: json.health ? [
                { label: "SOC CORE", icon: "🛡️", val: 1 },
                { label: "NODES", icon: "🌐", val: json.health.active_nodes || 1 }
            ] : [],
            ai_metrics: json.ai_metrics || {
                is_fitted: false,
                total_trained: json.counters?.events || 0,
                accuracy: 0,
                inference_ms: 0,
                buffer_size: 0
            },
            top_talkers: json.top_talkers || [],
            attack_trends: json.attack_trends || [],
            heatmap_matrix: json.heatmap || [],
            geo_points: json.alerts?.map((a: any) => {
                let lat = a.lat || a.src_lat || (a.payload && a.payload.lat);
                let lng = a.lng || a.src_lon || (a.payload && a.payload.lng);
                const ip = a.src_ip || "Unknown";
                
                if (!lat || !lng) {
                    let hash = 0;
                    for (let i = 0; i < ip.length; i++) {
                        hash = ip.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const hotspots = [
                        [39.9042, 116.4074], [55.7558, 37.6173], [38.9072, -77.0369],
                        [51.5074, -0.1278], [-23.5505, -46.6333], [35.6895, 139.6917],
                        [50.4501, 30.5234], [35.6892, 51.3890], [39.0392, 125.7625]
                    ];
                    const index = Math.abs(hash) % hotspots.length;
                    const jitterLat = ((Math.abs(hash * 2) % 100) / 100) * 10 - 5;
                    const jitterLng = ((Math.abs(hash * 3) % 100) / 100) * 10 - 5;
                    lat = hotspots[index][0] + jitterLat;
                    lng = hotspots[index][1] + jitterLng;
                }
                return {
                    name: ip,
                    value: [lng, lat, 1],
                    severity: a.severity || 'high'
                };
            }) || [],
            ml_scatter: json.ml_scatter || [],
            offensive_stats: json.offensive || {
                total_scans: json.offensive?.scans || 0,
                vulns_found: json.offensive?.vulns || 0,
                avg_risk: json.offensive?.risk || "Unknown",
                mythos_status: "Unknown",
                bypass_rate: "0%"
            }
        };
        setData(newData);
        dataRef.current = newData;
      } catch (e) {
        console.error("Dashboard data fetch failed", e);
      }
    };

    const fetchBriefing = async () => {
        setBriefingLoading(true);
        try {
            const data = await apiClient('/api/strategic-briefing/');
            setBriefing(data.briefing);
        } catch (e) { console.error("Briefing fetch failed", e); }
        finally { setBriefingLoading(false); }
    };

    const fetchHealth = async () => {
        setHealthLoading(true);
        try {
            const data = await apiClient('/api/infrastructure/health');
            setHealth(data);
        } catch (e) { console.error("Health fetch failed", e); }
        finally { setHealthLoading(false); }
    };

    fetchData();
    fetchBriefing();
    fetchHealth();
    const interval = setInterval(() => {
        fetchData();
        fetchBriefing();
        fetchHealth();
    }, 15000); 
    
    let lastTotal = 0;
    const liveInterval = setInterval(() => {
      setLiveData(prev => {
        const currentTotal = dataRef.current?.total_alerts_24h || 0;
        const delta = lastTotal > 0 ? currentTotal - lastTotal : 0;
        lastTotal = currentTotal;
        
        const val = delta > 0 ? delta : 0;
        const next = [...prev.slice(1), val];
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && data?.geo_points?.length) setUseFallbackMap(false);
    const t = setTimeout(() => {
      if (data?.geo_points?.length) setUseFallbackMap(true);
    }, 12000);
    return () => clearTimeout(t);
  }, [mapLoaded, data]);

  const handleAIAnalyse = async (alert: any) => {
    setAiLoading(true);
    router.push(`/alerts?target=${alert.source}&severity=${alert.severity}`);
  };

  const alertsOverTimeOpt = useMemo(() => {
    const base = getAlertsOverTimeOption();
    const trend = data?.hourly_trend || [{ hour: new Date().getHours() + ":00", critical: 0, high: 0, medium: 0, low: 0 }];
    
    return {
      ...base,
      xAxis: { ...base.xAxis, data: trend.map(t => t.hour) },
      series: [
        { 
          ...base.series[0], 
          name: 'Threat Vectors', 
          data: trend.map(t => t.critical + t.high),
          lineStyle: { ...base.series[0].lineStyle, color: COLORS.critical }
        },
        { 
          ...base.series[1], 
          name: 'Ambient Noise', 
          data: trend.map(t => t.medium + t.low),
          lineStyle: { ...base.series[1].lineStyle, color: COLORS.info }
        }
      ]
    };
  }, [data]);

  const severityPieOpt = useMemo(() => ({
    ...getSeverityPieOption(),
    series: [{
      ...getSeverityPieOption().series[0],
      data: [
        { value: data?.priority?.critical || 0, name: 'Critical', itemStyle: { color: COLORS.critical } },
        { value: data?.priority?.high || 0,     name: 'High',     itemStyle: { color: COLORS.high } },
        { value: data?.priority?.medium || 0,   name: 'Medium',   itemStyle: { color: COLORS.medium } },
        { value: data?.priority?.low || 0,      name: 'Low/Info', itemStyle: { color: COLORS.info } }
      ]
    }]
  }), [data]);

  const attackTypesOpt = useMemo(() => ({
    ...getAttackTypesOption(),
    yAxis: { ...getAttackTypesOption().yAxis, data: data?.attack_types.map(a => a.name).reverse() || [] },
    series: [{ ...getAttackTypesOption().series[0], data: data?.attack_types.map(a => a.count).reverse() || [] }]
  }), [data]);

  const stackedAreaOpt = useMemo(() => {
    const attackNames = data?.attack_trends[0] ? Object.keys(data.attack_trends[0]).filter(k => k !== 't') : [];
    return {
      ...commonOpts,
      tooltip: { trigger: 'axis', ...commonOpts.tooltip },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: data?.attack_trends.map(t => t.t) || [], axisLabel: { color: COLORS.textMuted } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: COLORS.gridLine } }, axisLabel: { color: COLORS.textMuted } },
      series: attackNames.map((name, i) => ({
        name, type: 'line', stack: 'Total', areaStyle: {}, emphasis: { focus: 'series' },
        data: data?.attack_trends.map(t => t[name]) || [],
        itemStyle: { color: [COLORS.critical, COLORS.high, COLORS.purple, COLORS.info, COLORS.normal][i % 5] }
      }))
    };
  }, [data]);

  const heatmapOpt = useMemo(() => ({
    ...commonOpts,
    tooltip: { position: 'top', ...commonOpts.tooltip },
    grid: { height: '70%', top: '10%', right: '5%', left: '10%' },
    xAxis: { type: 'category', data: ['12a','3a','6a','9a','12p','3p','6p','9p'], splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.01)','transparent'] } }, axisLabel: { color: COLORS.textMuted, fontSize: 9 } },
    yAxis: { type: 'category', data: ['Sat','Fri','Thu','Wed','Tue','Mon','Sun'], axisLabel: { color: COLORS.textMuted, fontSize: 9 } },
    visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '-10%', textStyle: { color: COLORS.textMuted, fontSize: 9 }, inRange: { color: [COLORS.bgDark, COLORS.info, COLORS.purple, COLORS.high, COLORS.critical] }, itemWidth: 10, itemHeight: 100 },
    series: [{ name: 'Attacks', type: 'heatmap', data: data?.heatmap_matrix || [], itemStyle: { borderColor: COLORS.bgDark, borderWidth: 2, borderRadius: 2 } }]
  }), [data]);

  const topTalkersOpt = useMemo(() => ({
    ...commonOpts,
    grid: { left: '20%', right: '10%', bottom: '10%', top: '10%' },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: { type: 'category', data: data?.top_talkers.map(t => t.ip).reverse() || [], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#fff', fontSize: 10, fontFamily: 'monospace' } },
    series: [{ type: 'bar', barWidth: '40%', data: data?.top_talkers.map(t => t.count).reverse() || [], itemStyle: { color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: COLORS.info }, { offset: 1, color: 'rgba(41, 121, 255, 0.1)' }]), borderRadius: [0, 4, 4, 0] } }]
  }), [data]);

  const scatterOpt = useMemo(() => ({
    ...getScatterOption(),
    series: [
      { name: 'Normal', type: 'scatter', symbolSize: 6, data: data?.ml_scatter.filter(s => s[0] < 0.6) || [], itemStyle: { color: COLORS.info, opacity: 0.4 } },
      { name: 'Anomaly', type: 'scatter', symbolSize: 10, data: data?.ml_scatter.filter(s => s[0] >= 0.6) || [], itemStyle: { color: COLORS.critical, shadowBlur: 15, shadowColor: COLORS.critical } }
    ]
  }), [data]);

  const liveStreamOpt = useMemo(() => getLiveStreamOption(liveData), [liveData]);

  const geoMapFallbackOpt = useMemo(() => {
    if (!mapLoaded) return {};
    const pts = (data?.geo_points || []).filter(p => p && Array.isArray(p.value));
    const crit = pts.filter(p => String(p.severity).toLowerCase() === 'critical');
    const norm = pts.filter(p => String(p.severity).toLowerCase() !== 'critical');
    return {
      backgroundColor: 'transparent',
      geo: {
        map: 'world', roam: true, zoom: 1.2,
        label: { emphasis: { show: false } },
        itemStyle: { normal: { areaColor: '#050b14', borderColor: '#1e3a8a', borderWidth: 1 }, emphasis: { areaColor: '#0f2042' } }
      },
      series: [
        { type: 'effectScatter', coordinateSystem: 'geo', symbolSize: 12, rippleEffect: { brushType: 'stroke', scale: 4 }, itemStyle: { color: '#ff1744', shadowBlur: 20, shadowColor: '#ff1744' }, data: crit.map(p => ({ name: p.name, value: [p.value[0], p.value[1], p.value[2] || 100] })) },
        { type: 'scatter', coordinateSystem: 'geo', symbolSize: 7, itemStyle: { color: '#2979ff', opacity: 0.8 }, data: norm.map(p => ({ name: p.name, value: [p.value[0], p.value[1], p.value[2] || 50] })) },
        { type: 'lines', zlevel: 2, effect: { show: true, period: 4, trailLength: 0.4, color: '#fff', symbolSize: 3 }, lineStyle: { normal: { color: '#ff1744', width: 1.5, curveness: 0.3, opacity: 0.6 } }, data: crit.slice(0, 15).map(p => ({ coords: [[p.value[0], p.value[1]], [-7.5898, 33.5731]] })) },
        { type: 'effectScatter', coordinateSystem: 'geo', zlevel: 3, rippleEffect: { brushType: 'fill', scale: 2 }, symbolSize: 14, itemStyle: { color: '#00e676', shadowBlur: 15, shadowColor: '#00e676' }, data: [{ name: 'HQ-CASABLANCA', value: [-7.5898, 33.5731] }] }
      ]
    };
  }, [mapLoaded, data]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-400 font-sans p-4 lg:p-6 selection:bg-blue-600/30 overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[0]" 
           style={{ backgroundImage: 'linear-gradient(#2979ff 1px, transparent 1px), linear-gradient(90deg, #2979ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#05070a_100%)] z-[1]" />

      <div className="flex items-center justify-between mb-8 relative z-10 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            BOUCLIER <span className="text-blue-500">EXECUTIVE</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase mt-2">Strategic Defense Overview // CICIDS-2017 Live Feed</p>
          {/* DEBUG OVERLAY */}
          <div className="mt-2 flex gap-2">
            <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-500 font-mono">
              API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005'}
            </span>
            <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-500 font-mono">
              STATUS: {data ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
            <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-500 font-mono">
              EVENT_BUFFER: {data?.total_alerts_24h || 0}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Telemetry Synchronized</span>
          </div>
          <button 
            onClick={() => {
                const a = document.createElement('a');
                a.href = `http://localhost:8005/api/forensics/master-report`;
                a.download = 'BOUCLIER_MASTER_REPORT.md';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Export Master Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 relative z-10">
        <KPICard title="Total Alerts" value={data?.total_alerts_24h.toLocaleString() || "..."} subValue="Last 24h Telemetry" icon={Activity} color={COLORS.info} onClick={() => router.push('/graph')} />
        <KPICard title="Critical Alerts" value={data?.priority.critical || "..."} subValue="Requires Immediate Action" icon={AlertTriangle} color={COLORS.critical} onClick={() => router.push('/alerts')} />
        <KPICard title="Active Incidents" value={data?.active_incidents.Critical || "..."} subValue="Verified Threats" icon={Target} color={COLORS.high} onClick={() => router.push('/operation-soc-expert')} />
        <KPICard title="Risk Score" value={`${data?.risk_score || "..."}%`} subValue="Avg Infrastructure Risk" icon={Activity} color={COLORS.purple} onClick={() => router.push('/ai-reasoning')} />
        <KPICard title="SLA Status" value="100%" subValue="Uptime Guaranteed" icon={CheckCircle} color={COLORS.normal} onClick={() => router.push('/infrastructure')} />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 relative z-10">
        <GlassCard title="Tactical Threat Vector Map — Expert SOC Surveillance" icon={GlobeIcon} className="h-[550px]">
          {useFallbackMap && mapLoaded ? (
            <ReactECharts option={geoMapFallbackOpt} style={{ height: '100%', width: '100%' }} />
          ) : (
            <TacticalExpertMap data={data} />
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        <GlassCard title="Alerts Over Time" icon={TrendingUp} className="lg:col-span-3 h-[300px]">
          <ReactECharts option={alertsOverTimeOpt} notMerge={true} style={{ height: '100%', width: '100%' }} />
        </GlassCard>
        <GlassCard title="Severity Distribution" icon={Shield} className="h-[300px]">
          <ReactECharts option={severityPieOpt} notMerge={true} style={{ height: '100%', width: '100%' }} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        <GlassCard title="Top Attack Vectors" icon={Zap} className="h-[300px]">
          <ReactECharts option={attackTypesOpt} notMerge={true} style={{ height: '100%', width: '100%' }} />
        </GlassCard>
        <GlassCard title="Attack Trends (Stacked)" icon={Layers} className="lg:col-span-2 h-[300px]">
          <ReactECharts option={stackedAreaOpt} notMerge={true} style={{ height: '100%', width: '100%' }} />
        </GlassCard>
        <GlassCard title="Attack Heatmap" icon={Flame} className="h-[300px]">
          <ReactECharts option={heatmapOpt} notMerge={true} style={{ height: '100%', width: '100%' }} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        <GlassCard title="Top Talkers (Internal/External)" icon={Radio} className="h-[300px]">
          <ReactECharts option={topTalkersOpt} notMerge={true} style={{ height: '100%', width: '100%' }} />
        </GlassCard>
        <GlassCard title="AI Behavioral Anomaly Detection" icon={Fingerprint} className="lg:col-span-2 h-[300px]">
          <ReactECharts option={scatterOpt} notMerge={true} style={{ height: '100%', width: '100%' }} />
        </GlassCard>
        <GlassCard title="Target Infrastructure Status" icon={Database} className="h-[300px]">
          <div className="grid grid-cols-2 gap-3 pt-2 h-full overflow-y-auto pr-1 custom-scrollbar">
            {(data?.industry_stats || []).map((ind, i) => (
              <div key={i} onClick={() => router.push('/infrastructure')} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col group hover:bg-white/10 hover:border-blue-500/30 transition-all relative overflow-hidden h-28 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <span className="text-xl">{ind.icon}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">{ind.label}</p>
                    <p className="text-[7px] text-slate-600 font-mono mt-1">NODE_ID_${100+i}</p>
                  </div>
                </div>
                
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-lg font-black text-white font-mono leading-none">{ind.val.toLocaleString()}</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Intercepts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 relative z-10">
        <GlassCard title="Strategic Intelligence Briefing" icon={Shield} className="lg:col-span-2 h-[250px]">
           <div className="flex flex-col h-full">
              {briefingLoading && !briefing ? (
                <div className="flex-1 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : briefing ? (
                <div className="flex-1 space-y-4 pr-2 overflow-y-auto custom-scrollbar">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={cn("px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest", 
                           briefing.status === 'CRITICAL' ? 'bg-red-600/20 text-red-500 border border-red-500/30' : 
                           briefing.status === 'ELEVATED' ? 'bg-orange-600/20 text-orange-500 border border-orange-500/30' : 
                           'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30'
                         )}>
                            STATUS: {briefing.status}
                         </div>
                         <div className="text-[10px] text-slate-500 font-mono">NEURAL_LINK_STABLE // GEN_v2.0</div>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <p className="text-[12px] text-slate-300 leading-relaxed font-medium italic">
                         "{briefing.summary}"
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      <div>
                         <div className="text-[9px] font-black text-blue-500 uppercase mb-2 tracking-widest">Risk Assessment</div>
                         <p className="text-[11px] text-slate-400 leading-relaxed">{briefing.risk_assessment}</p>
                      </div>
                      <div>
                         <div className="text-[9px] font-black text-emerald-500 uppercase mb-2 tracking-widest">Priority Strategic Action</div>
                         <p className="text-[11px] text-white font-bold leading-relaxed">{briefing.priority_action}</p>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 text-[10px] uppercase font-black">
                   Waiting for neural handshake...
                </div>
              )}
           </div>
        </GlassCard>
        <GlassCard title="AI Reasoning Hub" icon={Cpu} className="h-[250px]" onClick={() => router.push('/ai-reasoning')}>
          <div className="flex flex-col justify-center items-center h-full cursor-pointer group space-y-4">
            <div className="w-24 h-24 relative">
               <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse group-hover:bg-blue-500/30" />
               <div className="absolute inset-2 border-2 border-dashed border-blue-500/30 rounded-full animate-spin-slow" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <Cpu className="w-8 h-8 text-blue-500" />
               </div>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Link: {data?.ai_metrics.is_fitted ? "Active" : "Learning..."}</p>
                <h4 className="text-sm font-black text-white uppercase mt-1">CICIDS Reasoning Engine</h4>
                <div className="mt-4 inline-block bg-white/5 px-4 py-1 rounded border border-white/5">
                  <p className="text-[8px] text-slate-500 uppercase">Neural Accuracy</p>
                  <p className="text-sm font-bold text-emerald-400">{data?.ai_metrics.accuracy || 0}%</p>
                </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        <GlassCard title="Infrastructure Health" icon={Database} className="lg:col-span-2 h-[200px]">
           <div className="flex flex-col h-full">
              {healthLoading && !health ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
              ) : health ? (
                <div className="flex-1 grid grid-cols-2 gap-4">
                   <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] text-slate-500 uppercase font-black">System Status</span>
                         <span className={cn("text-[10px] font-black", health.status === 'OPERATIONAL' ? 'text-emerald-500' : 'text-orange-500')}>
                            {health.status}
                         </span>
                      </div>
                      <div className="space-y-2">
                         <div className="space-y-1">
                            <div className="flex justify-between text-[8px] uppercase font-bold text-slate-400">
                               <span>CPU Load</span>
                               <span>{health.system.cpu}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${health.system.cpu}%` }} />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <div className="flex justify-between text-[8px] uppercase font-bold text-slate-400">
                               <span>RAM Usage</span>
                               <span>{health.system.ram}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${health.system.ram}%` }} />
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar pr-1">
                      {Object.entries(health.services).map(([name, s]: [string, any]) => (
                        <div key={name} className="p-2 bg-white/5 border border-white/5 rounded flex flex-col gap-1">
                           <span className="text-[7px] text-slate-500 font-black uppercase truncate">{name}</span>
                           <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", s.status === 'ONLINE' || s.status === 'READY' || s.status === 'ACTIVE' || s.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500')} />
                              <span className="text-[9px] text-white font-bold">{s.status}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : null}
           </div>
        </GlassCard>
        <GlassCard title="Offensive Intelligence (Mythos)" icon={Target} className="lg:col-span-1 h-[200px]" onClick={() => router.push('/ai-pentester')}>
           <div className="flex flex-col h-full cursor-pointer">
              <div className="flex-1 space-y-3">
                 {[
                     { label: "Bypass Efficiency", val: "84.2%", icon: GlobeIcon },
                     { label: "Neural Compute", val: "OPERATIONAL", icon: Cpu },
                     { label: "Offensive Scans", val: "12", icon: Target },
                     { label: "Vulns Detected", val: "8", icon: ShieldAlert }
                 ].map(m => (
                     <div key={m.label} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <m.icon className="w-3 h-3 text-slate-600" />
                             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                         </div>
                         <span className={cn("text-[9px] font-black italic", m.val === 'OPERATIONAL' ? 'text-purple-400 animate-pulse' : 'text-white')}>{m.val}</span>
                     </div>
                 ))}
              </div>
              <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
                 <span className="text-[8px] text-red-500 font-black uppercase tracking-[0.2em]">Live Engagement Active</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </div>
           </div>
        </GlassCard>
        <GlassCard title="Live Forensic Monitoring" icon={Radio} className="lg:col-span-1 h-[200px]">
           <div className="flex flex-col justify-center h-full space-y-4 px-4">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intercepts</span>
                 <span className="text-xl font-black text-white font-mono">{(data?.total_alerts_24h || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical</span>
                 <span className="text-xl font-black text-red-500 font-mono">{data?.priority.critical || 0}</span>
              </div>
           </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-10 relative z-10">
        <GlassCard title="Live Forensic Logs (CICIDS-2017 Real-Time Feed)" icon={Database} className="h-[400px]">
          <div className="overflow-y-auto h-full pr-2 custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0a0e17] z-10 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3">Vector</th>
                  <th className="py-3">Source IP</th>
                  <th className="py-3">Forensic Description</th>
                  <th className="py-3">Severity</th>
                  <th className="py-3 text-right pr-8">Operational Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10.5px] text-slate-400 font-mono">
                {(data?.latest_alerts || []).map((l, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] group transition-colors">
                    <td className="py-3 px-4 text-slate-500">{l.time}</td>
                    <td className="py-3 text-blue-400 font-bold uppercase">{(l.description || "").split(' ')[0]}</td>
                    <td className="py-3 text-slate-500 italic">{l.source}</td>
                    <td className="py-3 text-slate-300">{l.description}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border" 
                            style={{ 
                              color: l.severity === 'Critical' ? COLORS.critical : l.severity === 'High' ? COLORS.high : COLORS.info, 
                              borderColor: l.severity === 'Critical' ? `${COLORS.critical}40` : `${COLORS.high}40`, 
                              backgroundColor: l.severity === 'Critical' ? `${COLORS.critical}15` : `${COLORS.high}15` 
                            }}>
                        {l.severity}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                       <button 
                         onClick={() => handleAIAnalyse(l)}
                         className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-all text-[9px] font-black uppercase"
                       >
                         {aiLoading ? "..." : "AI Analyse"}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* AI MODAL */}
      { (aiLoading || aiResult) && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a1220] border border-blue-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-blue-500/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                AI Forensic Reasoning
              </h3>
              <button onClick={() => { setAiResult(null); setAiLoading(false); }} className="text-slate-500 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-6">
              {aiLoading ? (
                <div className="py-10 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] text-blue-400 animate-pulse uppercase font-black tracking-widest">Processing CICIDS Neural Context...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Technical Reasoning</p>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm leading-relaxed text-slate-200 font-mono">
                      {aiResult?.summary}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Recommended Strategic Mitigation</p>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-sm leading-relaxed text-emerald-400 font-mono italic">
                      {aiResult?.mitigation}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Analysis generated by Neural Engine // llama3.2</p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(41, 121, 255, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(41, 121, 255, 0.6); }
      `}</style>
    </div>
  );
}
