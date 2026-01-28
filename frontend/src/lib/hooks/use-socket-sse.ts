import { useState, useEffect, useCallback, useRef } from 'react';

interface SseOptions<T> {
    url: string;
    onMessage?: (data: T) => void;
    reconnectInterval?: number;
    maxRetries?: number;
    pollingFallback?: boolean;
    pollingInterval?: number;
}

export function useSocketSse<T>({
    url,
    onMessage,
    reconnectInterval = 3000,
    maxRetries = 5,
    pollingFallback = true,
    pollingInterval = 10000,
}: SseOptions<T>) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<'connected' | 'reconnecting' | 'demo'>('reconnecting');
    const [error, setError] = useState<string | null>(null);
    const retryCount = useRef(0);
    const eventSource = useRef<EventSource | null>(null);
    const pollingTimer = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (eventSource.current) eventSource.current.close();

        const es = new EventSource(url);
        eventSource.current = es;

        es.onopen = () => {
            setStatus('connected');
            setError(null);
            retryCount.current = 0;
            if (pollingTimer.current) clearInterval(pollingTimer.current);
        };

        const handleData = (eventData: string) => {
            try {
                const parsed = JSON.parse(eventData);
                setData(parsed);
                if (onMessage) onMessage(parsed);
            } catch (e) {
                console.error("SSE Parse Error", e);
            }
        };

        es.onmessage = (event) => handleData(event.data);

        // Listen to common named events in our system
        es.addEventListener('events', (e: any) => handleData(e.data));
        es.addEventListener('flow', (e: any) => handleData(e.data));
        es.addEventListener('health', (e: any) => handleData(e.data));

        es.onerror = () => {
            es.close();
            if (retryCount.current < maxRetries) {
                setStatus('reconnecting');
                const delay = reconnectInterval * Math.pow(2, retryCount.current);
                retryCount.current++;
                setTimeout(connect, delay);
            } else if (pollingFallback) {
                startPolling();
            } else {
                setError("Connection lost after multiple retries");
            }
        };
    }, [url, reconnectInterval, maxRetries, pollingFallback, onMessage]);


    const startPolling = useCallback(async () => {
        setStatus('demo');
        if (pollingTimer.current) clearInterval(pollingTimer.current);

        const poll = async () => {
            try {
                const res = await fetch(url.replace('/stream', '')); // Assumes simple mapping
                const json = await res.json();
                setData(json);
                if (onMessage) onMessage(json);
            } catch (e) {
                console.error("Polling Error", e);
            }
        };

        poll();
        pollingTimer.current = setInterval(poll, pollingInterval);
    }, [url, pollingInterval, onMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (eventSource.current) eventSource.current.close();
            if (pollingTimer.current) clearInterval(pollingTimer.current);
        };
    }, [connect]);

    return { data, status, error };
}
