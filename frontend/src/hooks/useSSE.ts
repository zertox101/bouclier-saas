'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SSEEvent {
    id: string;
    timestamp: string;
    type: 'alert' | 'info' | 'warning' | 'error' | 'success';
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    message: string;
    metadata?: Record<string, any>;
}

interface UseSSEOptions {
    endpoint?: string;
    mockInterval?: number; // milliseconds
    maxEvents?: number;
}



export function useSSE(options: UseSSEOptions = {}) {
    const {
        endpoint,
        mockInterval = 1000,
        maxEvents = 50,
    } = options;

    const [events, setEvents] = useState<SSEEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [connected, setConnected] = useState(false);

    const addEvent = useCallback((event: SSEEvent) => {
        setEvents(prev => [event, ...prev].slice(0, maxEvents));
    }, [maxEvents]);

    useEffect(() => {
        let eventSource: EventSource | null = null;

        if (endpoint) {
            try {
                eventSource = new EventSource(endpoint);

                eventSource.onopen = () => {
                    setConnected(true);
                    setLoading(false);
                    setError(null);
                };

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        addEvent(data);
                    } catch (err) {
                        console.error('Failed to parse SSE event:', err);
                    }
                };

                eventSource.onerror = (err) => {
                    console.error('SSE Error:', err);
                    setError(new Error('SSE connection failed'));
                    setConnected(false);
                    eventSource?.close();
                };
            } catch (e) {
                console.error("Failed to create EventSource", e);
                setError(new Error("Failed to create EventSource"));
            }

            return () => {
                eventSource?.close();
                setConnected(false);
            };
        } else {
            setLoading(false);
            setConnected(false);
            setError(new Error("No endpoint provided"));
        }
    }, [endpoint, addEvent]);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    return {
        events,
        loading,
        error,
        connected,
        clearEvents,
    };
}
