'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from "@/lib/api-client";

export const TrafficChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient<any>("/api/network/traffic");
        if (data.traffic) {
          setChartData(data.traffic.map((t: any) => ({
            name: new Date(t.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            pv: t.inbound || 0,
            uv: t.outbound || 0,
          })));
        }
      } catch (e) {
        console.error("TrafficChart fetch error:", e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayData = chartData.length > 0 ? chartData : [{ name: '--', uv: 0, pv: 0 }];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px' }}
          itemStyle={{ color: '#60a5fa' }}
        />
        <Area type="monotone" dataKey="pv" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPv)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
