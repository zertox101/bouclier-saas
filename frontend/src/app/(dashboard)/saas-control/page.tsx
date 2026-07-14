"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, Power, BrainCircuit, ShieldAlert, Cpu, Globe, Lock, Shield, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';

export default function SaaSControlCenter() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      setRefreshing(true);
      const data = await apiClient('/api/saas/control/health');
      setHealthData(data);
    } catch (err) {
      console.error('Failed to fetch health data', err);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleService = async (serviceName: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // Optimistic update
      setHealthData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          services: {
            ...(prev.services || {}),
            [serviceName]: newStatus
          }
        };
      });

      await apiClient('/api/saas/control/toggle', {
        method: 'POST',
        json: { service_name: serviceName, status: newStatus }
      });
    } catch (err) {
      console.error('Failed to toggle service', err);
      // Revert on error
      fetchHealth();
    }
  };

  if (loading && !healthData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0E14]">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
          <p className="text-cyan-400 font-mono tracking-widest uppercase">Initializing Core...</p>
        </div>
      </div>
    );
  }

  const core = healthData?.core || {};
  const services = healthData?.services || {};
  const config = healthData?.config || {};
  const metrics = healthData?.metrics || {};

  const getStatusColor = (status: string) => {
    if (!status) return 'text-gray-500';
    if (status.includes('online')) return 'text-emerald-400 shadow-emerald-400/50';
    return 'text-red-500 shadow-red-500/50';
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <RefreshCw className="h-5 w-5 animate-spin" />;
    if (status.includes('online')) return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-10 font-sans text-gray-200">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent flex items-center gap-4">
              <Shield className="h-10 w-10 text-cyan-400" />
              SaaS Core Control Center
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm tracking-wider">
              MASTER OPERATIONS DASHBOARD // NODE: OMEGA-1
            </p>
          </div>
          <button 
            onClick={fetchHealth}
            className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-mono text-sm">SYNC</span>
          </button>
        </div>

        {/* Real-time Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Bypass Efficiency", val: metrics.bypass_efficiency || "0.0%", icon: Globe, color: "text-blue-400" },
            { label: "Neural Compute", val: metrics.neural_compute || "0% CPU", icon: Cpu, color: "text-purple-400" },
            { label: "Trend Velocity", val: metrics.trend_velocity || "0.0%", icon: Activity, color: "text-cyan-400" },
            { label: "Critical Alerts", val: metrics.critical_alerts || "0", icon: ShieldAlert, color: "text-red-400" }
          ].map((m, i) => (
            <div key={i} className="bg-[#0f111a] border border-white/5 rounded-2xl p-6 flex items-center gap-5">
              <div className={`p-3 rounded-xl bg-black/40 ${m.color}`}>
                <m.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.label}</p>
                <p className="text-xl font-bold text-white">{m.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Core Infrastructure Health */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Activity className="h-6 w-6 text-emerald-400" />
              Infrastructure Health
            </h2>
            
            <div className="space-y-4">
              {/* Database */}
              <div className="bg-[#0f111a] border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Database className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">PostgreSQL DB</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{config.db_host || 'localhost'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusIcon(core.database)}
                    <span className={`text-xs mt-1 uppercase tracking-wider font-bold ${core.database?.includes('online') ? 'text-emerald-400' : 'text-red-500'}`}>
                      {core.database?.includes('online') ? 'OPERATIONAL' : 'DOWN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Redis */}
              <div className="bg-[#0f111a] border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <Server className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Redis Cache & Streams</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{config.redis_host || 'localhost'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusIcon(core.redis)}
                    <span className={`text-xs mt-1 uppercase tracking-wider font-bold ${core.redis?.includes('online') ? 'text-emerald-400' : 'text-red-500'}`}>
                      {core.redis?.includes('online') ? 'OPERATIONAL' : 'DOWN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* LLM Engine */}
              <div className="bg-[#0f111a] border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <BrainCircuit className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">LLM Engine</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{config.llm_model || 'gemma4:latest'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusIcon(core.llm)}
                    <span className={`text-xs mt-1 uppercase tracking-wider font-bold ${core.llm?.includes('online') ? 'text-emerald-400' : 'text-red-500'}`}>
                      {core.llm?.includes('online') ? 'OPERATIONAL' : 'DOWN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Control Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Cpu className="h-6 w-6 text-cyan-400" />
              Active Modules & Services
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'sentinel_agent', name: 'Sentinel Security Agent', icon: Shield, color: 'from-blue-500/20 to-transparent' },
                { key: 'ai_pentester', name: 'AI Pentester Auto-Scan', icon: BrainCircuit, color: 'from-purple-500/20 to-transparent' },
                { key: 'threat_intel', name: 'Global Threat Intel Feed', icon: Globe, color: 'from-cyan-500/20 to-transparent' },
                { key: 'network_monitor', name: 'Network Deep Packet Monitor', icon: Activity, color: 'from-emerald-500/20 to-transparent' },
                { key: 'auto_remediation', name: 'Autonomous Remediation', icon: Power, color: 'from-orange-500/20 to-transparent' },
                { key: 'apt_simulation', name: 'Advanced APT Simulation', icon: ShieldAlert, color: 'from-red-500/20 to-transparent' }
              ].map((service) => {
                const isActive = services[service.key];
                const Icon = service.icon;
                
                return (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={service.key} 
                    className={`p-5 rounded-xl border ${isActive ? 'bg-[#11141d] border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-[#0a0c12] border-white/5'} relative overflow-hidden transition-all duration-300`}
                  >
                    {isActive && <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-50`} />}
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${isActive ? 'bg-black/40 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <button
                          onClick={() => toggleService(service.key, isActive)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-cyan-500' : 'bg-gray-700'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-8' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      
                      <div>
                        <h3 className={`font-semibold text-lg ${isActive ? 'text-white' : 'text-gray-400'}`}>{service.name}</h3>
                        <p className={`text-sm mt-1 flex items-center gap-2 ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}>
                          <span className="relative flex h-2 w-2">
                            {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-cyan-500' : 'bg-gray-600'}`}></span>
                          </span>
                          {isActive ? 'ACTIVE & PROTECTING' : 'OFFLINE'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
