'use client';
import React from 'react';
import { TrafficChart } from '../../../components/charts/TrafficChart';
import { Shield, Smartphone, Server, Globe } from 'lucide-react';

export default function IncidentsPage() {
  const incidents = [
    { id: 'INC-2029', type: 'DDoS Attack', source: '192.168.1.45', region: 'CN', severity: 'CRITICAL', status: 'Active' },
    { id: 'INC-2030', type: 'SQL Injection', source: '10.0.0.12', region: 'RU', severity: 'HIGH', status: 'Mitigated' },
    { id: 'INC-2031', type: 'Malware Download', source: '172.16.0.5', region: 'US', severity: 'HIGH', status: 'Investigating' },
    { id: 'INC-2032', type: 'Port Scanning', source: '192.168.1.10', region: 'BR', severity: 'MEDIUM', status: 'Closed' },
  ];

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-200">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Incident Response Center</h1>
        <p className="text-slate-500">Manage and mitigate active threats across the infrastructure.</p>
      </header>

      {/* Traffic Analysis */}
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-lg font-medium text-white mb-4">Traffic Anomalies (Last 24h)</h3>
        <TrafficChart />
      </div>

      {/* Incident List */}
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Threat Type</th>
              <th className="px-6 py-4">Source IP</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{inc.id}</td>
                <td className="px-6 py-4">{inc.type}</td>
                <td className="px-6 py-4 font-mono text-xs">{inc.source} ({inc.region})</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                      inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-blue-500/20 text-blue-500'
                    }`}>
                    {inc.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {inc.status === 'Active' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                    {inc.status === 'Mitigated' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                    {inc.status}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-400 hover:text-blue-300 hover:underline">Investigate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}