'use client';

import { Activity, Circle, Server, Laptop, Globe } from 'lucide-react';

const MOCK_SENSORS = [
    { name: 'DC-MAIN-01', type: 'server', status: 'online', load: 32, latency: '12ms' },
    { name: 'WS-MARKT-04', type: 'workstation', status: 'online', load: 8, latency: '24ms' },
    { name: 'GW-PROD-EDGE', type: 'network', status: 'offline', load: 0, latency: '--' },
    { name: 'SEC-LOG-01', type: 'server', status: 'online', load: 64, latency: '4ms' },
    { name: 'VPN-USER-42', type: 'remote', status: 'warning', load: 45, latency: '156ms' },
];

const TYPE_ICONS = {
    server: Server,
    workstation: Laptop,
    network: Globe,
    remote: Activity,
};

export function SensorHealthList() {
    return (
        <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-border-1 flex items-center justify-between bg-bg-2/50">
                <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-success" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Sensor Health</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        <span className="text-[9px] text-success font-bold uppercase">14</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                        <span className="text-[9px] text-danger font-bold uppercase">2</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-2 space-y-1">
                {MOCK_SENSORS.map((sensor) => {
                    const Icon = TYPE_ICONS[sensor.type] || Server;
                    return (
                        <div key={sensor.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-3/30 transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-lg bg-bg-2 border border-border-1 group-hover:border-p-500/30 transition-colors`}>
                                    <Icon className="h-3.5 w-3.5 text-text-3 group-hover:text-white" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-semibold text-text-1 truncate">{sensor.name}</div>
                                    <div className="text-[9px] font-mono text-text-3 uppercase">{sensor.type}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                                <div className="hidden sm:block">
                                    <div className="text-[9px] font-bold text-white uppercase leading-none">{sensor.load}%</div>
                                    <div className="text-[8px] text-text-3 uppercase tracking-tighter">Load</div>
                                </div>
                                <div className="w-16">
                                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-tighter ${sensor.status === 'online' ? 'bg-success/10 text-success border-success/20' :
                                            sensor.status === 'offline' ? 'bg-danger/10 text-danger border-danger/20' :
                                                'bg-warning/10 text-warning border-warning/20'
                                        }`}>
                                        <span className={`h-1 w-1 rounded-full bg-current ${sensor.status === 'online' ? 'animate-pulse' : ''}`} />
                                        {sensor.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-border-1 bg-bg-2/30">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-text-3 uppercase font-bold">Grid Stability</span>
                    <span className="text-[10px] text-success font-bold">98.2%</span>
                </div>
                <div className="h-1 w-full bg-bg-1 rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[98%] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
            </div>
        </div>
    );
}
