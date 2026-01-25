
'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const TerminalFeed = ({ logs }: { logs: any[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new log
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [logs]);

    return (
        <div className="w-full h-full bg-black/90 rounded-xl border border-emerald-500/30 overflow-hidden font-mono text-xs relative shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-emerald-900/20 border-b border-emerald-500/20">
                <span className="text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    System_Log.sh
                </span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
            </div>

            {/* Scanlines Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

            {/* Content */}
            <div ref={scrollRef} className="p-4 h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-2 relative z-0">
                {logs.length === 0 && <span className="text-slate-600 animate-pulse">Waiting for telemetry...</span>}

                {logs.map((log, i) => (
                    <motion.div
                        key={log.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 text-emerald-300/80 border-b border-white/5 pb-1"
                    >
                        <span className="text-slate-500 shrink-0">[{log.time || new Date().toLocaleTimeString()}]</span>
                        <span className={`${log.severity === 'CRITICAL' ? 'text-red-500 font-bold' : log.severity === 'HIGH' ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {log.severity}
                        </span>
                        <span className="text-white ml-2">
                            {log.event} <span className="text-slate-500">from {log.source}</span>
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
