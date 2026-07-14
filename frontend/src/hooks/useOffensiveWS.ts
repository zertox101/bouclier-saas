"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type WSMessage = Record<string, any>;

interface UseOffensiveWSOptions {
  onMessage?: (msg: WSMessage) => void;
  autoConnect?: boolean;
}

export function useOffensiveWS(options: UseOffensiveWSOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastStats, setLastStats] = useState<Record<string, any> | null>(null);
  const [scanLog, setScanLog] = useState<WSMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(options.onMessage);
  const retriesRef = useRef(0);
  const maxRetries = 10;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const queueRef = useRef<Record<string, any>[]>([]);
  onMessageRef.current = options.onMessage;

  const getWsUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, "")
      : `${window.location.hostname}:8005`;
    return `${proto}//${host}/api/offensive/ws`;
  }, []);

  const flushQueue = useCallback(() => {
    const q = queueRef.current;
    const remaining: Record<string, any>[] = [];
    q.forEach(msg => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg));
      } else {
        remaining.push(msg);
      }
    });
    queueRef.current = remaining;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const url = getWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    ws.onopen = () => {
      setIsConnected(true);
      retriesRef.current = 0;
      flushQueue();
    };
    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
        retriesRef.current++;
        timerRef.current = setTimeout(connect, delay);
      }
    };
    ws.onerror = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "stats") setLastStats(msg);
        else if (msg.type.startsWith("scan_") || msg.type.startsWith("mythos_") || msg.type.startsWith("wstg_") || msg.type.startsWith("raptor_")) {
          setScanLog((prev) => [...prev, msg]);
        }
        onMessageRef.current?.(msg);
      } catch {}
    };

    wsRef.current = ws;
  }, [getWsUrl, flushQueue]);

  const disconnect = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    retriesRef.current = maxRetries;
    queueRef.current = [];
  }, []);

  const send = useCallback((data: Record<string, any>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    queueRef.current.push(data);
    return false;
  }, []);

  const subscribeStats = useCallback(() => {
    send({ action: "subscribe" });
  }, [send]);

  const startScan = useCallback((target: string, scanType = "nmap") => {
    setScanLog([]);
    connect();
    send({ action: "scan", target, scan_type: scanType });
  }, [send, connect]);

  const startMythosAnalysis = useCallback((target: string, scanData?: any) => {
    send({ action: "mythos_analyze", target, scan_data: scanData });
  }, [send]);

  const startWstgScan = useCallback((targetUrl: string, options?: Record<string, any>) => {
    setScanLog([]);
    connect();
    send({ action: "wstg_scan", target: targetUrl, url: targetUrl, ...options });
  }, [send, connect]);

  const startRaptorScan = useCallback((target: string, mode = "scan") => {
    setScanLog([]);
    connect();
    send({ action: "raptor_scan", target, mode });
  }, [send, connect]);

  const clearScanLog = useCallback(() => setScanLog([]), []);

  useEffect(() => {
    if (options.autoConnect !== false) connect();
    return () => disconnect();
  }, [connect, disconnect, options.autoConnect]);

  return {
    isConnected, lastStats, scanLog,
    connect, disconnect, send,
    subscribeStats, startScan, startMythosAnalysis, startWstgScan, startRaptorScan, clearScanLog,
  };
}
