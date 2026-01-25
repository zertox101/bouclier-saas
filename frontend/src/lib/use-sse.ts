
import { useEffect, useState, useRef, useCallback } from 'react';

type SSEStatus = 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR';

interface UseSseOptions {
    enabled?: boolean;
    withCredentials?: boolean;
    onEvent?: (type: string, data: any) => void;
}

export function useEventSource(url: string, { enabled = true, withCredentials = true, onEvent }: UseSseOptions = {}) {
    const [data, setData] = useState<any[]>([]);
    const [status, setStatus] = useState<SSEStatus>('CLOSED');
    const [lastEvent, setLastEvent] = useState<any>(null);

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const retryCountRef = useRef(0);

    const init = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8005'}${url}`;
        setStatus('CONNECTING');

        const es = new EventSource(fullUrl, { withCredentials });

        es.onopen = () => {
            setStatus('OPEN');
            retryCountRef.current = 0; // Reset retry count
        };

        es.onmessage = (event) => {
            // Generic message (if no type)
            try {
                const parsed = JSON.parse(event.data);
                setLastEvent(parsed);
                setData(prev => [parsed, ...prev].slice(0, 50));
            } catch (e) {
                // Ignore parse errors for keep-alives
            }
        };

        // Specific event listeners
        // Server sends: 
        // event: events
        // data: {...}

        // We bind a wildcard listener or specific ones if needed. 
        // Standard EventSource doesn't support wildcard, so we manually parse in onmessage or add listeners.
        // However, FastAPI streaming might just send standard "message" type if not specified.
        // Our backend sends "event: events", "event: health". So we must add listeners.

        const handleCustomEvent = (e: MessageEvent) => {
            try {
                const parsed = JSON.parse(e.data);
                if (onEvent) onEvent(e.type, parsed);

                // Auto-toast for critical
                if (e.type === 'alerts' && parsed.severity === 'critical') {
                    // toast.error(`CRITICAL ALERT: ${parsed.message}`); 
                    // We don't have toast installed in this context yet, can just log
                    console.warn("CRITICAL ALERT", parsed);
                }

                // Consolidate into main data stream for UI
                setLastEvent({ type: e.type, ...parsed });
                setData(prev => [{ type: e.type, ...parsed }, ...prev].slice(0, 50));

            } catch (err) {
                console.error(err);
            }
        };

        es.addEventListener('events', handleCustomEvent);
        es.addEventListener('health', handleCustomEvent);
        es.addEventListener('alerts', handleCustomEvent);
        es.addEventListener('kpi', handleCustomEvent);

        es.onerror = (err) => {
            console.error("SSE Error", err);
            setStatus('ERROR');
            es.close();
            eventSourceRef.current = null;

            // Exponential Backoff
            const timeout = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
            retryCountRef.current++;

            reconnectTimeoutRef.current = setTimeout(init, timeout);
        };

        eventSourceRef.current = es;
    }, [url, withCredentials, onEvent]);

    useEffect(() => {
        if (!enabled) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                setStatus('CLOSED');
            }
            return;
        }

        init();

        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (eventSourceRef.current) eventSourceRef.current.close();
        };
    }, [enabled, init]);

    return { data, status, lastEvent };
}
