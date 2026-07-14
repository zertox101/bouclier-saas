import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';
import { Wrench, CheckCircle2, Loader2, Play, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/components/shared/NotificationSystem';

export function JobsPanel() {
    const { addNotification } = useNotifications();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiClient('/api/scans/');
                setJobs(data.slice(0, 4)); // Only show top 4
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
        const interval = setInterval(fetchJobs, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-border-1 flex items-center justify-between bg-bg-2/50">
                <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-p-400" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Active Scans</h3>
                </div>
                <button
                    className="text-[10px] text-p-400 font-bold uppercase tracking-widest hover:text-p-500 transition-colors"
                >
                    Registry
                </button>
            </div>

            <div className="flex-1 p-4 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40">
                         <Loader2 className="h-6 w-6 text-p-400 animate-spin" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 opacity-20">
                        <Wrench className="h-10 w-10 text-white mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No active jobs</span>
                    </div>
                ) : jobs.map((job) => (
                    <div key={job.id} className="p-3 rounded-xl bg-bg-3/30 border border-border-1/50 hover:border-p-500/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-text-3">#{String(job.id).padStart(3, '0')}</span>
                                <span className="text-xs font-bold text-text-1 uppercase">{job.tool}</span>
                            </div>
                            {job.status === 'running' ? (
                                <div className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 text-p-400 animate-spin" />
                                    <span className="text-[10px] text-p-400 font-bold uppercase italic">Scrutinizing...</span>
                                </div>
                            ) : job.status === 'completed' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            ) : job.status === 'failed' ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-danger" />
                            ) : (
                                <span className="text-[10px] text-text-3 font-bold uppercase">{job.status}</span>
                            )}
                        </div>

                        <div className="text-[10px] font-mono text-text-3 mb-3 truncate">{job.target}</div>

                        {job.status === 'running' && (
                            <div className="h-1 w-full bg-bg-1 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-p-500 to-info transition-all duration-500 w-[65%] animate-pulse"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 bg-bg-3/20">
                <button
                    onClick={() => window.location.href = '/scans'}
                    className="w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-bg-2 border border-border-2 text-white text-xs font-bold uppercase tracking-widest hover:bg-p-500/10 hover:border-p-500 transition-all group"
                >
                    <Play className="h-3.5 w-3.5 text-p-400 group-hover:fill-p-400" />
                    Initialize Engine
                </button>
            </div>
        </div>
    );
}
