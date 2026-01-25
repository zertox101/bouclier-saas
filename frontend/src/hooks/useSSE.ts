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

const MOCK_SOURCES = [
    'sensor-01', 'sensor-02', 'sensor-03', 'firewall-gw',
    'ids-main', 'web-scanner', 'endpoint-agent', 'purple-team'
];

const MOCK_MESSAGES = [
    'Suspicious network traffic detected',
    'Failed authentication attempt',
    'Port scan activity observed',
    'Malware signature detected',
    'Anomalous process execution',
    'Data exfiltration attempt blocked',
    'Privilege escalation detected',
    'SQL injection attempt',
    'DDoS attack mitigated',
    'Zero-day exploit detected',
];

const MOCK_TYPES: SSEEvent['type'][] = ['alert', 'info', 'warning', 'error', 'success'];
const MOCK_SEVERITIES: SSEEvent['severity'][] = ['low', 'medium', 'high', 'critical'];

function generateMockEvent(): SSEEvent {
    return {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: MOCK_TYPES[Math.floor(Math.random() * MOCK_TYPES.length)],
        severity: MOCK_SEVERITIES[Math.floor(Math.random() * MOCK_SEVERITIES.length)],
        source: MOCK_SOURCES[Math.floor(Math.random() * MOCK_SOURCES.length)],
        message: MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)],
        metadata: {
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            port: Math.floor(Math.random() * 65535),
        },
    };
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
        let mockTimer: NodeJS.Timeout | null = null;

        const startMock = () => {
            mockTimer = setInterval(() => {
                const mockEvent = generateMockEvent();
                addEvent(mockEvent);
            }, mockInterval);
        };

        // If endpoint is provided, try real SSE
        if (endpoint) {
            try {
                eventSource = new EventSource(endpoint);

                eventSource.onopen = () => {
                    setConnected(true);
                    setLoading(false);
                    setError(null);
                    // Stop mock if it was running (e.g. from a retry or previous state)
                    if (mockTimer) clearInterval(mockTimer);
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

                    // Fallback to mock if real connection dies
                    // NOTE: User requested to ONLY switch if API truly fails. 
                    // This error handler triggers when it truly fails.
                    if (!mockTimer) startMock();
                };
            } catch (e) {
                console.error("Failed to create EventSource", e);
                setError(new Error("Failed to create EventSource"));
                if (!mockTimer) startMock();
            }

            return () => {
                eventSource?.close();
                if (mockTimer) clearInterval(mockTimer);
                setConnected(false);
            };
        }
        // Otherwise, use mock data immediately
        else {
            setLoading(false);
            setConnected(true); // Treat mock as "connected" for UI purposes if no endpoint intended
            startMock();

            return () => {
                if (mockTimer) clearInterval(mockTimer);
            };
        }
    }, [endpoint, mockInterval, addEvent]);

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
