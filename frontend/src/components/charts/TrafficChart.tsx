'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '00:00', uv: 4000, pv: 2400, amt: 2400 },
  { name: '04:00', uv: 3000, pv: 1398, amt: 2210 },
  { name: '08:00', uv: 2000, pv: 9800, amt: 2290 },
  { name: '12:00', uv: 2780, pv: 3908, amt: 2000 },
  { name: '16:00', uv: 1890, pv: 4800, amt: 2181 },
  { name: '20:00', uv: 2390, pv: 3800, amt: 2500 },
  { name: '23:59', uv: 3490, pv: 4300, amt: 2100 },
];

export const TrafficChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
          itemStyle={{ color: '#60a5fa' }}
        />
        <Area type="monotone" dataKey="pv" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPv)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};