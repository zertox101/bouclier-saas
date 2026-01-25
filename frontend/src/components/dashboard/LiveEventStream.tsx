'use client';

import { ENDPOINTS } from '@/lib/api-config';
import { useSSE } from '@/hooks/useSSE';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, ShieldAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

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
        <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden border border-border-1">
            <div className="p-4 border-b border-border-1 flex items-center justify-between bg-bg-2/50">
                <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-p-400" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Live Event Stream</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                    <span className="text-[10px] text-text-3 font-mono uppercase">{connected ? 'Streaming' : 'Disconnected'}</span>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-text-3">
                            <div className="h-8 w-8 rounded-full border-2 border-dashed border-text-3 animate-spin mb-4" />
                            <p className="text-xs uppercase tracking-widest">Waiting for events...</p>
                        </div>
                    ) : (
                        events.map((event) => {
                            const Icon = TYPE_ICONS[event.type] || Info;
                            return (
                                <div
                                    key={event.id}
                                    className="group flex gap-3 p-3 rounded-lg bg-bg-3/30 border border-transparent hover:border-p-500/20 hover:bg-bg-3/50 transition-all duration-200 animate-fade-in"
                                >
                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${SEVERITY_COLORS[event.severity]}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider">
                                                {format(new Date(event.timestamp), 'HH:mm:ss.SSS')}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] uppercase font-mono ${SEVERITY_COLORS[event.severity]}`}>
                                                {event.severity}
                                            </Badge>
                                        </div>
                                        <div className="text-xs font-semibold text-text-1 mb-1 truncate">{event.source}</div>
                                        <p className="text-xs text-text-2 leading-relaxed">{event.message}</p>
                                        {event.metadata && (
                                            <div className="mt-2 flex gap-2">
                                                {Object.entries(event.metadata).map(([k, v]) => (
                                                    <span key={k} className="text-[9px] font-mono text-p-400 bg-p-400/10 px-1.5 py-0.5 rounded border border-p-400/20">
                                                        {k}: {v}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
