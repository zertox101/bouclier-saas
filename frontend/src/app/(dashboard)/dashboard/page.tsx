'use client';

import { useState, useEffect } from 'react';
import { ENDPOINTS } from '@/lib/api-config';
import {
  Activity,
  ShieldAlert,
  Terminal as TerminalIcon,
  Lock,
  Zap,
  Target,
  Cpu,
  Network,
  Globe,
  Radar,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LiveEventStream } from '@/components/dashboard/LiveEventStream';
import { AlertsTable } from '@/components/dashboard/AlertsTable';
import { JobsPanel } from '@/components/dashboard/JobsPanel';
import { SensorHealthList } from '@/components/dashboard/SensorHealthList';
import ToolsStatusWidget from '@/components/ToolsStatusWidget';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  description: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeSignals: "---",
    threats: "0",
    latency: "---",
    sensors: "512/516"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [trafficRes, alertsRes] = await Promise.all([
          fetch(ENDPOINTS.TRAFFIC_STATS).then(r => r.json()).catch(() => ({})),
          fetch(ENDPOINTS.ALERTS).then(r => r.json()).catch(() => ({}))
        ]);

        const signalRate = trafficRes.inbound_packets
          ? `${(trafficRes.inbound_packets + trafficRes.outbound_packets).toLocaleString()}/s`
          : "Waiting...";

        const threatCount = Array.isArray(alertsRes) ? alertsRes.length : (alertsRes.items?.length || 0);

        setStats({
          activeSignals: signalRate,
          threats: threatCount.toString(),
          latency: "24ms",
          sensors: "512/516"
        });
      } catch (e) {
        console.error("Dashboard stats fetch failed", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const metrics: Metric[] = [
    {
      title: "Signal Rate",
      value: stats.activeSignals,
      change: "Live Stream",
      trend: 'up',
      icon: Activity,
      color: "p-500",
      description: "Real-time packet analysis"
    },
    {
      title: "Critical Threats",
      value: stats.threats,
      change: "Active Now",
      trend: 'neutral',
      icon: ShieldAlert,
      color: "danger",
      description: "High severity alerts"
    },
    {
      title: "Network Latency",
      value: stats.latency,
      change: "-3ms",
      trend: 'down',
      icon: Cpu,
      color: "info",
      description: "System response time"
    },
    {
      title: "Active Sensors",
      value: stats.sensors,
      change: "+2 nodes",
      trend: 'up',
      icon: Network,
      color: "success",
      description: "Online monitoring endpoints"
    }
  ];

  return (
    <div className="flex-1 space-y-8 p-8 max-w-[1800px] mx-auto animate-fade-in relative">
      {/* Premium Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-bg-2/80 to-bg-1/40 p-10 rounded-[40px] border border-border-1 backdrop-blur-xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-p-500/10 via-transparent to-danger/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2.5 w-2.5 rounded-full bg-p-500 animate-pulse shadow-[0_0_20px_rgba(167,139,250,1)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-p-400">Command Center</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
              SOC <span className="text-p-400">Dashboard.</span>
            </h1>
            <p className="text-[11px] text-text-3 font-bold uppercase tracking-[0.3em] opacity-60">
              Real-time threat monitoring and response environment
            </p>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-6 py-3 bg-bg-0/60 border border-success/20 rounded-2xl flex items-center gap-3 hover:border-success/40 transition-colors backdrop-blur-xl">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_12px_#10b981]" />
              <span className="text-[9px] font-black text-success uppercase tracking-widest">All Systems Operational</span>
            </div>
            <div className="px-6 py-3 bg-bg-0/60 border border-p-500/20 rounded-2xl flex items-center gap-3 hover:border-p-500/40 transition-colors backdrop-blur-xl">
              <Lock className="w-4 h-4 text-p-400" />
              <span className="text-[9px] font-black text-p-400 uppercase tracking-widest">AES-256 Encrypted</span>
            </div>
          </div>
        </div>

        {/* Background Glow Effects */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-p-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-danger/10 rounded-full blur-[100px] pointer-events-none" />
      </header>

      {/* Premium KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="group relative overflow-hidden bg-gradient-to-br from-bg-2/60 to-bg-1/30 backdrop-blur-xl p-8 rounded-[32px] border border-border-1 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-p-500/10"
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-p-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Icon Container */}
            <div className="relative mb-6 flex items-center justify-between">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110",
                metric.color === 'p-500' && "bg-p-600/10 border-p-500/30 text-p-400 group-hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]",
                metric.color === 'danger' && "bg-danger/10 border-danger/30 text-danger group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]",
                metric.color === 'info' && "bg-info/10 border-info/30 text-info group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
                metric.color === 'success' && "bg-success/10 border-success/30 text-success group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              )}>
                <metric.icon className="w-7 h-7" />
              </div>

              {/* Trend Indicator */}
              <div className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                metric.trend === 'up' && "bg-success/10 border border-success/20 text-success",
                metric.trend === 'down' && "bg-info/10 border border-info/20 text-info",
                metric.trend === 'neutral' && "bg-white/5 border border-white/10 text-text-3"
              )}>
                {metric.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {metric.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {metric.trend === 'neutral' && <Minus className="w-3 h-3" />}
                {metric.change}
              </div>
            </div>

            {/* Content */}
            <div className="relative space-y-3">
              <div className="text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">
                {metric.title}
              </div>
              <div className="text-4xl font-black text-white tracking-tighter">
                {metric.value}
              </div>
              <div className="text-[9px] text-text-3 font-medium tracking-wide opacity-60">
                {metric.description}
              </div>
            </div>

            {/* Bottom Accent Line */}
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-1 rounded-b-[32px]",
                metric.color === 'p-500' && "bg-gradient-to-r from-transparent via-p-500 to-transparent",
                metric.color === 'danger' && "bg-gradient-to-r from-transparent via-danger to-transparent",
                metric.color === 'info' && "bg-gradient-to-r from-transparent via-info to-transparent",
                metric.color === 'success' && "bg-gradient-to-r from-transparent via-success to-transparent"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Live Stream & Alerts */}
        <div className="xl:col-span-8 space-y-8">
          {/* Live Event Stream - Enhanced Container */}
          <div className="relative overflow-hidden rounded-[40px] border border-border-1 bg-gradient-to-br from-bg-2/40 to-bg-1/20 backdrop-blur-xl p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-p-500/5 to-transparent pointer-events-none" />
            <div className="h-[450px] relative z-10">
              <LiveEventStream />
            </div>
          </div>

          {/* Alerts Table - Enhanced Container */}
          <div className="relative overflow-hidden rounded-[40px] border border-border-1 bg-gradient-to-br from-bg-2/40 to-bg-1/20 backdrop-blur-xl p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-danger/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <AlertsTable />
            </div>
          </div>
        </div>

        {/* Right Column - Enhanced Sidebar Widgets */}
        <div className="xl:col-span-4 space-y-8">
          {/* Tools Status Widget */}
          <div className="relative overflow-hidden rounded-[40px] border border-border-1 bg-gradient-to-br from-bg-2/40 to-bg-1/20 backdrop-blur-xl p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <ToolsStatusWidget />
            </div>
          </div>

          {/* Active Jobs Panel */}
          <div className="relative overflow-hidden rounded-[40px] border border-border-1 bg-gradient-to-br from-bg-2/40 to-bg-1/20 backdrop-blur-xl p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent pointer-events-none" />
            <div className="h-[400px] relative z-10">
              <JobsPanel />
            </div>
          </div>

          {/* Sensor Health List */}
          <div className="relative overflow-hidden rounded-[40px] border border-border-1 bg-gradient-to-br from-bg-2/40 to-bg-1/20 backdrop-blur-xl p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-p-500/5 to-transparent pointer-events-none" />
            <div className="flex-1 min-h-[400px] relative z-10">
              <SensorHealthList />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="flex flex-col items-center gap-4 py-8">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-border-1 to-transparent mb-4" />
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.6em] opacity-40">BOUCLIER_COMMAND_CENTER</span>
          <div className="h-1 w-1 rounded-full bg-p-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.6em] opacity-40">ENTERPRISE_v2.4.0</span>
        </div>
      </footer>

      {/* Global Background Glows */}
      <div className="fixed top-20 right-20 w-[600px] h-[600px] bg-p-500/5 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse" />
      <div className="fixed bottom-20 left-20 w-[600px] h-[600px] bg-info/5 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
}
