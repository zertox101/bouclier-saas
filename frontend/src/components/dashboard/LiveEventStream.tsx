'use client';

import { ENDPOINTS } from '@/lib/api-config';
import { useSSE } from '@/hooks/useSSE';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, ShieldAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SEVERITY_COLORS = {
    low: 'bg-info/20 text-info border-info/30',
    medium: 'bg-warning/20 text-warning border-warning/30',
    high: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    critical: 'bg-danger/20 text-danger border-danger/30',
};

const TYPE_ICONS = {
    alert: ShieldAlert,
    info: Info,
    warning: AlertTriangle,
    error: ShieldAlert,
    success: CheckCircle2,
};

export function LiveEventStream() {
    // Connect to real endpoint
    const { events, connected } = useSSE({
        endpoint: ENDPOINTS.EVENTS, // Use real API
        mockInterval: 1500
    });

    return (
        <div className="flex flex-col h-full overflow-hidden bg-black/40 backdrop-blur-xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-5">Message / Activity</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1 text-right">Status</div>
            </div>

            <ScrollArea className="flex-1">
                <div className="divide-y divide-white/5">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <div className="h-10 w-10 rounded-full border-2 border-dashed border-cyan-500/30 animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synching with Neural Stream...</p>
                        </div>
                    ) : (
                        events.map((event, i) => {
                            const sevColor = SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.low;

                            return (
                                <motion.div
                                    key={event.id || i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i * 0.02, 1) }}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors items-center group"
                                >
                                    <div className="col-span-2 font-mono text-[10px] text-cyan-400 group-hover:text-cyan-300 transition-colors">
                                        {format(new Date(event.timestamp), 'HH:mm:ss.SSS')}
                                    </div>

                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-1.5 w-1.5 rounded-full", event.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-cyan-500')} />
                                            <span className="text-[10px] font-bold text-slate-300 truncate tracking-tight">{event.source}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-5">
                                        <p className="text-[11px] text-slate-400 font-medium leading-tight line-clamp-1 group-hover:text-slate-200 transition-colors">
                                            {event.message}
                                        </p>
                                        {event.metadata && (
                                            <div className="mt-1.5 flex flex-wrap gap-2 group-hover:opacity-100 opacity-60 transition-opacity">
                                                {Object.entries(event.metadata).map(([k, v]) => (
                                                    <span key={k} className="text-[8px] font-mono text-cyan-500/70 bg-cyan-500/5 px-1.5 py-0.5 rounded border border-cyan-500/10">
                                                        {k.toUpperCase()}:{String(v)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{event.type}</span>
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <div className={cn(
                                            "inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                                            sevColor
                                        )}>
                                            {event.severity}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
