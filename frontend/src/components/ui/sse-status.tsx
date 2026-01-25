
import React from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface SseStatusProps {
    status: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR';
}

export function SseStatus({ status }: SseStatusProps) {
    return (
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-black/40 border border-white/5">
            <div className="relative flex h-2 w-2">
                {status === 'OPEN' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    status === 'OPEN' ? "bg-green-500" :
                        status === 'CONNECTING' ? "bg-yellow-500" : "bg-red-500"
                )}></span>
            </div>
            <span className={cn(
                status === 'OPEN' ? "text-green-500" :
                    status === 'CONNECTING' ? "text-yellow-500" : "text-muted-foreground"
            )}>
                {status === 'OPEN' ? 'LIVE' : status}
            </span>
        </div>
    );
}
