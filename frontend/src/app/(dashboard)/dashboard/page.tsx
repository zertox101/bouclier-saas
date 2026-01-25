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
  Network
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { LiveEventStream } from '@/components/dashboard/LiveEventStream';
import { AlertsTable } from '@/components/dashboard/AlertsTable';
import { JobsPanel } from '@/components/dashboard/JobsPanel';
import { SensorHealthList } from '@/components/dashboard/SensorHealthList';

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
        // Parallel fetch for stats and alerts count
        const [trafficRes, alertsRes] = await Promise.all([
          fetch(ENDPOINTS.TRAFFIC_STATS).then(r => r.json()).catch(() => ({})),
          fetch(ENDPOINTS.ALERTS).then(r => r.json()).catch(() => ({}))
        ]);

        const signalRate = trafficRes.inbound_packets ? `${(trafficRes.inbound_packets + trafficRes.outbound_packets).toLocaleString()}/s` : "Waiting...";
        // If alertsRes is array, use length. If object with items, use items.length.
        const threatCount = Array.isArray(alertsRes) ? alertsRes.length : (alertsRes.items?.length || 0);

        setStats({
          activeSignals: signalRate,
          threats: threatCount.toString(),
          latency: "24ms", // Mock for now as backend might not expose latency yet
          sensors: "512/516" // Mock
        });
      } catch (e) {
        console.error("Dashboard stats fetch failed", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity className="h-8 w-8 text-p-500" />
          SOC Command Overview
        </h1>
        <p className="text-text-3 font-medium uppercase tracking-[0.2em] text-xs">
          Real-time threat monitoring and response environment
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Packet Rate (Signals)"
          value={stats.activeSignals}
          change="Live"
          trend="up"
          icon={Activity}
          color="p-500"
        />
        <KPICard
          title="High Severity Threats"
          value={stats.threats}
          change="Since Login"
          trend="neutral"
          icon={ShieldAlert}
          color="danger"
        />
        <KPICard
          title="Avg. Latency"
          value={stats.latency}
          change="3ms"
          trend="down"
          icon={Cpu}
          color="info"
        />
        <KPICard
          title="Sensors Online"
          value={stats.sensors}
          change="2"
          trend="neutral"
          icon={Network}
          color="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Live Stream & Alerts */}
        <div className="lg:col-span-8 space-y-8">
          {/* Live Event Stream */}
          <div className="h-[450px]">
            <LiveEventStream />
          </div>

          {/* Alerts Table */}
          <AlertsTable />
        </div>

        {/* Right Column - Jobs & Sensors */}
        <div className="lg:col-span-4 space-y-8">
          {/* Active Jobs */}
          <div className="h-[400px]">
            <JobsPanel />
          </div>

          {/* Sensor Health */}
          <div className="flex-1 min-h-[400px]">
            <SensorHealthList />
          </div>
        </div>
      </div>

      {/* Background Glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-p-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-info/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  );
}
