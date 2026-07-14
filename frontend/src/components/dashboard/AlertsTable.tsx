import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, MoreHorizontal, ExternalLink, Loader2 } from 'lucide-react';
import { useNotifications } from '@/components/shared/NotificationSystem';

interface Alert {
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'investigating' | 'mitigated' | 'dismissed';
    source: string;
    created_at?: string;
    timestamp?: string;
    category?: string;
}

const SEVERITY_COLORS = {
    low: 'bg-info/20 text-info border-info/20',
    medium: 'bg-warning/20 text-warning border-warning/20',
    high: 'bg-orange-500/20 text-orange-500 border-orange-500/20',
    critical: 'bg-danger/20 text-danger border-danger/20',
};

const STATUS_COLORS = {
    active: 'text-danger',
    investigating: 'text-warning',
    mitigated: 'text-success',
    dismissed: 'text-text-3',
};

interface AlertsTableProps {
    limit?: number;
}

export function AlertsTable({ limit }: AlertsTableProps = {}) {
    const { addNotification } = useNotifications();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            setLoading(true);
            try {
                const data = await apiClient('/api/telemetry/stats');
                
                const items = (data.alerts || []).map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    severity: a.severity,
                    status: a.status === 'new' ? 'active' : a.status,
                    source: a.source,
                    timestamp: a.timestamp,
                    category: a.category
                }));

                setAlerts(limit ? items.slice(0, limit) : items);
            } catch (err) {
                console.error("Alerts API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, [limit]);

    return (
        <div className="glass-card rounded-2xl overflow-hidden relative">
            <div className="p-4 border-b border-border-1 flex items-center justify-between bg-bg-2/50">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-danger" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                        Real-time Security Alerts
                    </h3>
                </div>
                <button
                    className="text-[10px] text-p-400 font-bold uppercase tracking-widest hover:text-p-500 transition-colors"
                >
                    Live Log
                </button>
            </div>

            <div className="overflow-x-auto min-h-[200px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-p-500 animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest text-text-3 mt-2">Syncing Alerts...</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border-1 hover:bg-transparent">
                                <TableHead className="text-text-3 uppercase text-[10px] font-bold">Alert ID</TableHead>
                                <TableHead className="text-text-3 uppercase text-[10px] font-bold">Severity</TableHead>
                                <TableHead className="text-text-3 uppercase text-[10px] font-bold">Description</TableHead>
                                <TableHead className="text-text-3 uppercase text-[10px] font-bold">Source</TableHead>
                                <TableHead className="text-text-3 uppercase text-[10px] font-bold">Status</TableHead>
                                <TableHead className="text-text-3 uppercase text-[10px] font-bold text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.map((alert) => (
                                <TableRow key={alert.id} className="border-border-1 hover:bg-bg-2/30 animate-fade-in">
                                    <TableCell className="font-mono text-xs text-text-1">{alert.id}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[9px] uppercase font-bold py-0 h-5 ${SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low}`}>
                                            {alert.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-text-1 font-medium">{alert.title}</TableCell>
                                    <TableCell className="text-xs font-mono text-p-400">{alert.source}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`h-1.5 w-1.5 rounded-full bg-current ${STATUS_COLORS[alert.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.active}`} />
                                            <span className={`text-[10px] uppercase font-bold tracking-tight ${STATUS_COLORS[alert.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.active}`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => addNotification({
                                                    type: 'info',
                                                    title: 'Opening Alert Details',
                                                    message: `Redirecting to full analysis of ${alert.id}...`
                                                })}
                                                className="p-1 hover:bg-bg-3 rounded transition-colors text-text-3 hover:text-white"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => addNotification({
                                                    type: 'info',
                                                    title: 'Incident Management',
                                                    message: `Quick triage menu opened for ${alert.id}.`
                                                })}
                                                className="p-1 hover:bg-bg-3 rounded transition-colors text-text-3 hover:text-white"
                                            >
                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
