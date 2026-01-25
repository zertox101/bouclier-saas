'use client';

import { Wrench, CheckCircle2, Loader2, Play } from 'lucide-react';
import { useNotifications } from '@/components/NotificationSystem';

const MOCK_JOBS = [
    { id: 'JOB-742', tool: 'Nmap Scan', target: '10.0.0.0/24', status: 'running', progress: 45 },
    { id: 'JOB-741', tool: 'Nuclei Discovery', target: 'api.production.internal', status: 'completed', progress: 100 },
    { id: 'JOB-740', tool: 'OWASP ZAP', target: 'https://staging.app', status: 'failed', progress: 12 },
    { id: 'JOB-739', tool: 'Metasploit Exploit', target: 'target-vm-01', status: 'running', progress: 88 },
];

export function JobsPanel() {
    const { addNotification } = useNotifications();
    return (
        <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-border-1 flex items-center justify-between bg-bg-2/50">
                <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-p-400" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Active Jobs</h3>
                </div>
                <button
                    onClick={() => addNotification({
                        type: 'info',
                        title: 'Execution History',
                        message: 'Fetching last 50 execution logs from the secure vault...'
                    })}
                    className="text-[10px] text-p-400 font-bold uppercase tracking-widest hover:text-p-500 transition-colors"
                >
                    History
                </button>
            </div>

            <div className="flex-1 p-4 space-y-4">
                {MOCK_JOBS.map((job) => (
                    <div key={job.id} className="p-3 rounded-xl bg-bg-3/30 border border-border-1/50 hover:border-p-500/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-text-3">{job.id}</span>
                                <span className="text-xs font-bold text-text-1">{job.tool}</span>
                            </div>
                            {job.status === 'running' ? (
                                <div className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 text-p-400 animate-spin" />
                                    <span className="text-[10px] text-p-400 font-bold uppercase">{job.progress}%</span>
                                </div>
                            ) : job.status === 'completed' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            ) : (
                                <span className="text-[10px] text-danger font-bold uppercase tracking-tighter">Failed</span>
                            )}
                        </div>

                        <div className="text-[10px] font-mono text-text-3 mb-3 truncate">{job.target}</div>

                        {job.status === 'running' && (
                            <div className="h-1 w-full bg-bg-1 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-p-500 to-info transition-all duration-500"
                                    style={{ width: `${job.progress}%` }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 bg-bg-3/20">
                <button
                    onClick={() => addNotification({
                        type: 'success',
                        title: 'Deployment Initialized',
                        message: 'New tactical scan engine is being provisioned in the Kali cluster.'
                    })}
                    className="w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-bg-2 border border-border-2 text-white text-xs font-bold uppercase tracking-widest hover:bg-p-500/10 hover:border-p-500 transition-all group"
                >
                    <Play className="h-3.5 w-3.5 text-p-400 group-hover:fill-p-400" />
                    New Job Scan
                </button>
            </div>
        </div>
    );
}
