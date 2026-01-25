import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Robust SSE hook for real-time telemetry
 * Features:
 * - Exponential backoff reconnection
 * - Keep-alive monitoring
 * - Event deduplication
 * - Ring-buffer management
 */

export interface SseEvent {
    id: string;
    type: string;
    timestamp: string;
    data: any;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export type SseStatus = 'connected' | 'reconnecting' | 'disconnected' | 'error';

export function useEventSource(url: string, maxEvents = 200) {
    const [events, setEvents] = useState<SseEvent[]>([]);
    const [status, setStatus] = useState<SseStatus>('disconnected');
    const [errorCount, setErrorCount] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);
    const knownIds = useRef<Set<string>>(new Set());

    const connect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setStatus('reconnecting');
        const es = new EventSource(url, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
            setStatus('connected');
            setErrorCount(0);
            console.log('SSE: Connected to', url);
        };

        es.onerror = (err) => {
            console.error('SSE: Error', err);
            setStatus('error');
            es.close();

            // Exponential backoff
            const timeout = Math.min(1000 * Math.pow(2, errorCount), 30000);
            setErrorCount(prev => prev + 1);
            setTimeout(connect, timeout);
        };

        // Generic event handler
        es.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                const eventId = payload.id || Date.now().toString();

                if (knownIds.current.has(eventId)) return;

                const newEvent: SseEvent = {
                    id: eventId,
                    type: payload.type || 'generic',
                    timestamp: payload.timestamp || new Date().toISOString(),
                    data: payload,
                    severity: payload.severity,
                };

                knownIds.current.add(eventId);

                setEvents(prev => {
                    const next = [newEvent, ...prev];
                    if (next.length > maxEvents) {
                        const removed = next.pop();
                        if (removed) knownIds.current.delete(removed.id);
                    }
                    return next;
                });
            } catch (err) {
                console.error('SSE: Parse error', err);
            }
        };

        // Keep-alive heartbeat listener if specified by server
        es.addEventListener('heartbeat', () => {
            // Just keep session alive
        });

    }, [url, maxEvents, errorCount]);

    useEffect(() => {
        connect();
        return () => {
            eventSourceRef.current?.close();
        };
    }, [connect]);

    const clearEvents = useCallback(() => {
        setEvents([]);
        knownIds.current.clear();
    }, []);

    return { events, status, clearEvents };
}
