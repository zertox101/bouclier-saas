"use client";

import React, { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { 
  Brain, Cpu, Database, Zap, BarChart3, TrendingUp, Activity,
  ShieldCheck, AlertTriangle, History, Timer, Network, Fingerprint,
  Layers, Search, ChevronRight, Boxes, Microscope, Workflow, Scan,
  ZapOff, Lock, Radio, Atom, BookOpen, BrainCircuit, Globe, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_CONFIG } from "@/lib/api-config";
import { apiClient } from '@/lib/api-client';

interface ReasoningStats {
  status: string;
  rf_accuracy: number;
  knn_accuracy: number;
  top_features: { name: string; value: number }[];
  dataset_samples: number;
  trained_at: string;
  classes: string[];
  real_time_learning: boolean;
  model_type: string;
  gru_anomaly_score?: number;
  inference_time?: string;
  aix_learning_progress?: number;
  neural_synapses?: number;
  total_parameters?: string;
}

export default function AIReasoningPage() {
  const [stats, setStats] = useState<ReasoningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'topology' | 'features' | 'knowledge'>('topology');
  const [isTraining, setIsTraining] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<any | null>(null);

  const normalizeStats = (data: any): ReasoningStats => ({
    ...data,
    top_features: Array.isArray(data?.top_features) ? data.top_features : [],
    classes: Array.isArray(data?.classes) ? data.classes : [],
    real_time_learning: Boolean(data?.real_time_learning),
    aix_learning_progress: data?.status === "ready" ? 100 : 0,
    neural_synapses: Array.isArray(data?.top_features) ? data.top_features.length : 0,
    inference_time: data?.inference_time || "N/A",
    total_parameters: data?.model_type || "CICIDS model",
  });

  const learnedPatterns = useMemo(() => {
    const classes = stats?.classes || [];
    const rfAccuracy = Number(stats?.rf_accuracy || 0) * 100;
    return classes.slice(0, 6).map((label, index) => ({
      id: `CICIDS-${String(index + 1).padStart(3, "0")}`,
      type: "CICIDS_Class",
      title: label,
      confidence: Number.isFinite(rfAccuracy) ? rfAccuracy.toFixed(1) : "N/A",
      desc: `Class learned from CICIDS dataset using ${stats?.model_type || "the active ML model"}.`,
      detected_at: stats?.trained_at ? new Date(stats.trained_at).toLocaleString() : "Training metadata unavailable",
    }));
  }, [stats]);

  const handleSync = async () => {
    setIsSyncing(true);
    window.dispatchEvent(new CustomEvent('notify', { 
       detail: { message: "Refreshing CICIDS reasoning metadata from backend...", type: 'info' } 
    }));
    try {
        const data = await apiClient('/api/ai-reasoning/stats');
        setStats(normalizeStats(data));
        window.dispatchEvent(new CustomEvent('notify', { 
           detail: { message: "Reasoning metadata refreshed from backend.", type: 'success' } 
        }));
    } catch (err) {
        window.dispatchEvent(new CustomEvent('notify', { 
           detail: { message: "Reasoning metadata refresh failed.", type: 'error' } 
        }));
    } finally {
        setIsSyncing(false);
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    window.dispatchEvent(new CustomEvent('notify', { 
       detail: { message: "Initiating Neural Model Training on real CICIDS-2017 dataset...", type: 'warning' } 
    }));
    try {
      const data = await apiClient('/api/telemetry/train', {
        method: "POST"
      });
      window.dispatchEvent(new CustomEvent('notify', { 
         detail: { message: `Model trained successfully! Accuracy: ${data.accuracy}%. Size: ${data.total_trained} samples.`, type: 'success' } 
      }));
      
      // Re-fetch stats to update UI
      const statsData = await apiClient('/api/ai-reasoning/stats');
      setStats(normalizeStats(statsData));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('notify', { 
         detail: { message: "Model training failed. Please check backend logs.", type: 'error' } 
      }));
    } finally {
      setIsTraining(false);
    }
  };

  const handleNavDetails = (pattern: any) => {
    setSelectedPattern(pattern);
    window.dispatchEvent(new CustomEvent('notify', { 
       detail: { message: `Opening Advanced Neural Diagnostics: ${pattern.title}`, type: 'info' } 
    }));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient('/api/ai-reasoning/stats');
        setStats(normalizeStats(data));
      } catch (err) {
        console.error("Failed to fetch reasoning stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); 
    return () => clearInterval(interval);
  }, []);

  const featureChartOption = useMemo(() => ({
    backgroundColor: "transparent",
    radar: {
      indicator: (stats?.top_features || []).map(f => ({ name: f.name, max: 1 })),
      splitNumber: 4,
      shape: 'circle',
      axisName: { color: '#64748b', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } },
      splitArea: { areaStyle: { color: ['rgba(59, 130, 246, 0.02)', 'transparent'] } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: (stats?.top_features || []).map(f => f.value),
        name: 'Feature Impact',
        symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: 'rgba(59, 130, 246, 0.3)' }
      }]
    }]
  }), [stats]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin" />
            <Brain className="absolute inset-0 m-auto w-10 h-10 text-blue-600 animate-pulse" />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-blue-500/30 overflow-y-auto custom-scrollbar relative">
      
      {/* ── Background Aesthetics ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-blue-600/[0.03] rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
      </div>

      <div className="max-w-[1600px] mx-auto p-10 relative z-10 space-y-10">
        
        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-2xl shadow-blue-600/20">
                    <BrainCircuit className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Neural_Reasoning_Engine</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Active_Gemma_X4</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Nexus_Brain_v4.2.1</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                    {[
                        { id: 'topology', label: 'Topology', icon: Network },
                        { id: 'features', label: 'Feature Impact', icon: Fingerprint },
                        { id: 'knowledge', label: 'Neural KB', icon: BookOpen }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </header>

        {/* ── Core Dashboard ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Stats Overview */}
            <div className="lg:col-span-1 space-y-6">
                <StatCard label="Model_Accuracy" value={`${(stats?.rf_accuracy || 0).toFixed(3)}`} sub={stats?.model_type || "Backend model"} color="text-emerald-400" icon={ShieldCheck} />
                
                <button 
                   onClick={handleTrain}
                   disabled={isTraining}
                   className={cn(
                      "w-full p-8 rounded-[2.5rem] border transition-all flex flex-col items-start gap-4 group",
                      isTraining ? "bg-amber-600/20 border-amber-500/40" : "bg-blue-600/10 border-blue-500/20 hover:bg-blue-600 hover:border-blue-500"
                   )}
                >
                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", isTraining ? "bg-amber-500 text-black animate-spin" : "bg-blue-500 text-white group-hover:bg-white group-hover:text-blue-600")}>
                      <Zap className="w-6 h-6 fill-current" />
                   </div>
                   <div className="text-left">
                      <p className={cn("text-[11px] font-black uppercase tracking-widest", isTraining ? "text-amber-400" : "text-white")}>{isTraining ? 'Training_In_Progress...' : 'Initiate_Neural_Overhaul'}</p>
                      <p className={cn("text-[9px] font-bold uppercase mt-1", isTraining ? "text-amber-500/60" : "text-blue-400 group-hover:text-white/70")}>Recalibrate weights</p>
                   </div>
                </button>
                <StatCard label="Feature_Count" value={stats?.neural_synapses?.toLocaleString() || "0"} sub="Top CICIDS features" color="text-blue-400" icon={Atom} />
                <StatCard label="Inference_Time" value={stats?.inference_time || "N/A"} sub="Backend reported" color="text-p-400" icon={Timer} />
                
                <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real_Time_Learning</h4>
                        </div>
                        <p className="text-3xl font-black text-white italic mb-2">{(stats?.aix_learning_progress || 0).toFixed(1)}%</p>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${stats?.aix_learning_progress || 0}%` }} 
                                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                    {activeTab === 'topology' && (
                        <motion.div key="topology" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Network className="w-64 h-64 text-blue-500" /></div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-8">System_Topology_Map</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <TopologyNode label="Samples" count={stats?.dataset_samples || 0} active={Boolean(stats?.dataset_samples)} icon={Radio} />
                                    <TopologyNode label="Features" count={stats?.top_features?.length || 0} active={Boolean(stats?.top_features?.length)} icon={Database} />
                                    <TopologyNode label="Classes" count={stats?.classes?.length || 0} active={Boolean(stats?.classes?.length)} icon={Cpu} />
                                    <TopologyNode label="Model_Status" count={stats?.status === "ready" ? 1 : 0} active={stats?.status === "ready"} icon={ShieldCheck} />
                                </div>
                                <div className="mt-12 p-8 bg-black/40 border border-white/5 rounded-[2rem] space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Microscope className="w-4 h-4 text-slate-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural_Activity_Heat</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-blue-400">{stats?.status || "NO_MODEL"}</span>
                                    </div>
                                    <div className="flex gap-2 h-20 items-end">
                                        {(stats?.top_features || []).slice(0, 40).map((feature, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ height: 10 }}
                                                animate={{ height: 12 + Math.max(0, Math.min(1, feature.value)) * 56 }}
                                                className="flex-1 bg-blue-600/20 rounded-full"
                                                title={`${feature.name}: ${(feature.value * 100).toFixed(1)}%`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'features' && (
                        <motion.div key="features" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-8">Feature_Weight_Radar</h3>
                                <div className="h-[400px]">
                                    <ReactECharts option={featureChartOption} style={{ height: '100%', width: '100%' }} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 px-4">Correlation_Metrics</h3>
                                {stats?.top_features.map((f, i) => (
                                    <div key={i} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <span className="text-[10px] font-black font-mono">0{i+1}</span>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{f.name}</span>
                                        </div>
                                        <span className="text-[12px] font-black text-blue-400 font-mono">{(f.value * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'knowledge' && (
                        <motion.div key="knowledge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 h-full relative overflow-hidden">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Neural_Knowledge_Base</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Autonomous Pattern Recognition History</p>
                                    </div>
                                    <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Self_Learning_Enabled</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {learnedPatterns.length > 0 ? learnedPatterns.map((pattern) => (
                                        <motion.div 
                                            key={pattern.id}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                                                <Brain className="w-24 h-24 text-blue-500" />
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 block">{pattern.type}</span>
                                                    <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{pattern.title}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-black text-emerald-400 font-mono">{pattern.confidence}%</span>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase">Confidence</p>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed mb-6 border-l-2 border-blue-500/20 pl-4">
                                                {pattern.desc}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <History className="w-3 h-3 text-slate-600" />
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{pattern.detected_at}</span>
                                                </div>
                                                <button 
                                                   onClick={() => handleNavDetails(pattern)}
                                                   className="flex items-center gap-2 text-[9px] font-black text-blue-500 hover:text-white transition-colors group/btn"
                                                >
                                                    NAV_DETAILS <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="md:col-span-2 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            No CICIDS class metadata available yet
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-8 p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                                            <Globe className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Global Intelligence Sync</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Refreshing model classes, features, and accuracy from backend.</p>
                                        </div>
                                    </div>
                                    <button 
                                       onClick={handleSync}
                                       disabled={isSyncing}
                                       className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                    >
                                        {isSyncing ? 'SYNCING...' : 'Sync_Knowledge_Base'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* ── Footer ── */}
        <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-8">
                <MetricItem label="Total Samples Processed" value={(stats?.dataset_samples || 0).toLocaleString()} />
                <MetricItem label="Model Type" value={stats?.model_type || "N/A"} />
                <MetricItem label="Trained At" value={stats?.trained_at ? new Date(stats.trained_at).toLocaleDateString() : "N/A"} />
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Inference_Engine_Stable
            </div>
        </footer>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>

    </div>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }: any) {
    return (
        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-slate-500 group-hover:text-blue-500 transition-all">
                    <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-800" />
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <p className={cn("text-4xl font-black italic tracking-tighter leading-none mb-3", color)}>{value}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sub}</p>
        </div>
    );
}

function TopologyNode({ label, count, active, icon: Icon }: any) {
    return (
        <div className="flex flex-col items-center text-center space-y-4">
            <div className={cn(
                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all",
                active ? "bg-blue-600/10 border-blue-500/30 text-blue-500" : "bg-white/5 border-white/10 text-slate-700"
            )}>
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{label}</p>
                <p className="text-[12px] font-black text-blue-500 font-mono mt-1">{count}</p>
            </div>
        </div>
    );
}

function MetricItem({ label, value }: any) {
    return (
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{label}</span>
            <span className="text-[11px] font-black text-white font-mono">{value}</span>
        </div>
    );
}
