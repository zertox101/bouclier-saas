'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { TrafficChart } from '../../../components/charts/TrafficChart';
import {
  Shield, Activity, AlertTriangle, CheckCircle2,
  Clock, Eye, XCircle, Zap, Globe, Server,
  Download, RefreshCw, Lock, Radio, MoreVertical,
  Terminal, FileText, Target, Network,
  ChevronRight, Copy, ExternalLink, X,
  ArrowRight, Cpu, Hash, User, Loader2, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';

interface Incident {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  owner: string;
  alerts: string[];
  timeline: { time: string; action: string; user: string }[];
  created_at: string;
  updated_at: string;
}

const severityConfig: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
  High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Low: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const statusConfig: Record<string, { color: string; dot: string }> = {
  Open: { color: 'text-red-500', dot: 'bg-red-500 animate-ping' },
  'In Progress': { color: 'text-orange-400', dot: 'bg-orange-400 animate-pulse' },
  Resolved: { color: 'text-emerald-400', dot: 'bg-emerald-400' },
  Closed: { color: 'text-slate-500', dot: 'bg-slate-500' },
};

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [modalTab, setModalTab] = useState<'detail' | 'timeline' | 'actions'>('detail');
  const [isCreating, setIsCreating] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await apiClient('/api/incidents/');
      setIncidents(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 20000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiClient(`/api/incidents/${id}`, { method: "PATCH", json: { status } });
      fetchIncidents();
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  const selectedInc = incidents.find(i => i.id === selectedId);
  const filters = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const filtered = filter === 'All' ? incidents : incidents.filter(i => i.status === filter);

  if (loading && incidents.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
      <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Incident Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10 pb-12 p-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/[0.01] p-8 rounded-[32px] border border-white/5 backdrop-blur-3xl relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">SOC Operational Response</span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-3 italic">
            Incident <span className="text-emerald-400">Registry</span>.
          </h1>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Production-grade incident management system. Track, investigate, and resolve security breaches with full forensic timeline auditing.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchIncidents} className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white flex items-center justify-center transition-all"><RefreshCw className="h-5 w-5" /></button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black text-[11px] h-12 px-6 rounded-2xl transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)] uppercase tracking-widest"
          >
            <Plus className="h-4 w-4" /> Create Incident
          </button>
        </div>
      </div>

      {/* Stats Row (Simulated from actual data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Active Incidents" value={incidents.filter(i=>i.status!=='Closed').length.toString().padStart(2,'0')} icon={AlertTriangle} color="text-red-500" />
        <StatCard label="Resolved" value={incidents.filter(i=>i.status==='Resolved').length.toString().padStart(2,'0')} icon={CheckCircle2} color="text-emerald-400" />
        <StatCard label="Avg Response" value="4.2m" icon={Clock} color="text-cyan-400" />
        <StatCard label="MTTD" value="1.8m" icon={Activity} color="text-orange-400" />
      </div>

      {/* Incident List */}
      <div className="bg-[#0D121B] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20 text-red-500"><Shield className="h-5 w-5" /></div>
             <h2 className="text-[11px] font-black text-white tracking-[0.2em] uppercase">Tactical Incident Log</h2>
          </div>
          <div className="flex items-center gap-2">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                  filter === f ? "bg-white/10 text-white border-white/20" : "text-slate-500 border-white/5 hover:text-white hover:bg-white/[0.03]")}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                {['ID', 'Title', 'Owner', 'Severity', 'Status', 'Last Update', 'Actions'].map((h) => (
                  <th key={h} className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((inc) => (
                <tr key={inc.id} onClick={() => { setSelectedId(inc.id); setModalTab('detail'); }} className="group hover:bg-white/[0.03] transition-all cursor-pointer">
                  <td className="px-8 py-6 text-[10px] font-mono text-slate-500">#{inc.id}</td>
                  <td className="px-8 py-6">
                    <div className="text-[12px] font-black text-white tracking-tight group-hover:text-red-400 transition-colors italic">{inc.title}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-[8px] font-black">{inc.owner[0]}</div>
                      <span className="text-[10px] font-bold text-slate-300">{inc.owner}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase border inline-flex items-center gap-1.5", severityConfig[inc.severity] || severityConfig.Medium)}>
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />{inc.severity}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", statusConfig[inc.status]?.color || 'text-slate-500')}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig[inc.status]?.dot || 'bg-slate-500')} />{inc.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-mono text-slate-600">{new Date(inc.updated_at).toLocaleTimeString()}</td>
                  <td className="px-8 py-6">
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-500 hover:text-white"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Incident Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsCreating(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-[#0D121B] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Create Incident</h2>
                <button onClick={() => setIsCreating(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-500" /></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = Object.fromEntries(new FormData(form));
                try {
                  await apiClient('/api/incidents/', { method: "POST", json: data });
                  setIsCreating(false);
                  fetchIncidents();
                } catch (err) {
                  console.error("Create failed", err);
                }
              }} className="p-10 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Title</label>
                  <input name="title" required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-red-500/50 transition-all" placeholder="Incident title..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Description</label>
                  <textarea name="description" required rows={3} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-red-500/50 transition-all resize-none" placeholder="Detailed description..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Severity</label>
                    <select name="severity" defaultValue="Medium" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-red-500/50 transition-all">
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Owner</label>
                    <input name="owner" required defaultValue="admin" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-red-500/50 transition-all" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  <button type="submit" className="px-8 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)]">Create Incident</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Incident Modal */}
      <AnimatePresence>
        {selectedInc && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedId(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl bg-[#0D121B] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-start">
                 <div className="flex gap-6">
                    <div className={cn("w-16 h-16 rounded-2xl border flex items-center justify-center", severityConfig[selectedInc.severity])}>
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">{selectedInc.title}</h2>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Case #{selectedInc.id}</span>
                        <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", statusConfig[selectedInc.status]?.color)}>
                           <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig[selectedInc.status]?.dot)} /> {selectedInc.status}
                        </div>
                      </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedId(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-500" /></button>
              </div>

              <div className="flex border-b border-white/5 bg-black/20">
                 {['detail', 'timeline', 'actions'].map(tab => (
                   <button key={tab} onClick={() => setModalTab(tab as any)} className={cn("px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2", modalTab === tab ? "text-red-500 border-red-500 bg-red-500/5" : "text-slate-500 border-transparent hover:text-white")}>
                     {tab}
                   </button>
                 ))}
              </div>

              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                 {modalTab === 'detail' && (
                   <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                     <section className="bg-black/40 rounded-[32px] p-8 border border-white/5">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">Description & Scope</h4>
                        <p className="text-sm text-slate-300 leading-relaxed italic">{selectedInc.description}</p>
                     </section>
                     <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Incident Owner" value={selectedInc.owner} icon={User} />
                        <DetailItem label="Creation Date" value={new Date(selectedInc.created_at).toLocaleString()} icon={Clock} />
                        <DetailItem label="Associated Alerts" value={`${selectedInc.alerts.length} Records`} icon={Activity} />
                        <DetailItem label="Security Tier" value="L2 Response" icon={Shield} />
                     </div>
                   </div>
                 )}

                 {modalTab === 'timeline' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                     {selectedInc.timeline.map((item, i) => (
                       <div key={i} className="flex gap-6 relative">
                          {i < selectedInc.timeline.length - 1 && <div className="absolute left-[23px] top-10 bottom-0 w-px bg-white/5" />}
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 z-10">
                            <Clock className="w-5 h-5 text-slate-500" />
                          </div>
                          <div className="flex-1 bg-black/20 p-6 rounded-[24px] border border-white/5">
                             <div className="flex justify-between items-center mb-2">
                               <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">{item.action}</p>
                               <span className="text-[9px] font-mono text-slate-600">{item.time}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400">Operator: {item.user}</p>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}

                 {modalTab === 'actions' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                       <ActionButton label="Set In Progress" icon={Activity} onClick={() => handleUpdateStatus(selectedInc.id, "In Progress")} color="text-orange-400" />
                       <ActionButton label="Resolve Case" icon={CheckCircle2} onClick={() => handleUpdateStatus(selectedInc.id, "Resolved")} color="text-emerald-500" />
                       <ActionButton label="Close (Archive)" icon={XCircle} onClick={() => handleUpdateStatus(selectedInc.id, "Closed")} color="text-slate-500" />
                       <ActionButton label="Escalate to L3" icon={ArrowRight} onClick={() => {}} color="text-red-500" />
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#0D121B] border border-white/5 p-6 rounded-[24px] flex items-center gap-5 group hover:border-red-500/20 transition-all">
       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10", color)}>
          <Icon className="w-6 h-6" />
       </div>
       <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-white italic">{value}</p>
       </div>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[11px] font-bold text-white uppercase italic">{value}</p>
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick, color }: any) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all group">
       <div className={cn("w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 transition-all group-hover:scale-110", color)}>
          <Icon className="w-5 h-5" />
       </div>
       <span className="text-[11px] font-black text-white uppercase tracking-widest">{label}</span>
    </button>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
