"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal, X, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalShellProps {
  visible?: boolean;
  onClose?: () => void;
  wsUrl?: string;
  title?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export default function TerminalShell({
  visible = true,
  onClose,
  wsUrl,
  title = "Kali Shell — root@nexus",
}: TerminalShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [connected, setConnected] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const TOOLS_WS_URL =
    wsUrl ||
    process.env.NEXT_PUBLIC_TOOLS_API_WS_URL ||
    "ws://localhost:8100/ws/shell";

  useEffect(() => {
    if (!visible || !terminalRef.current) return;

    let term: any;
    let fitAddon: any;

    const initTerminal = async () => {
      try {
        const { Terminal } = await import("xterm");
        const { FitAddon } = await import("xterm-addon-fit");

        fitAddon = new FitAddon();
        term = new Terminal({
          cursorBlink: true,
          cursorStyle: "block",
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          theme: {
            background: "#050505",
            foreground: "#e0e0e0",
            cursor: "#3b82f6",
            selectionBackground: "#3b82f640",
            black: "#000000",
            red: "#ef4444",
            green: "#22c55e",
            yellow: "#eab308",
            blue: "#3b82f6",
            magenta: "#a855f7",
            cyan: "#06b6d4",
            white: "#e0e0e0",
            brightBlack: "#666666",
            brightRed: "#ef4444",
            brightGreen: "#22c55e",
            brightYellow: "#eab308",
            brightBlue: "#3b82f6",
            brightMagenta: "#a855f7",
            brightCyan: "#06b6d4",
            brightWhite: "#ffffff",
          },
          allowTransparency: true,
          rows: 24,
          cols: 80,
        });

        term.loadAddon(fitAddon);
        term.open(terminalRef.current!);
        fitAddon.fit();
        xtermRef.current = term;

        // Connect WebSocket
        const ws = new WebSocket(TOOLS_WS_URL);
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          onConnectionChange?.(true);
          term.reset();
          term.write("\r\n\x1b[32m── Kali Linux Shell Connected ──\x1b[0m\r\n\n");
        };

        ws.onmessage = (ev) => {
          if (ev.data instanceof ArrayBuffer) {
            const data = new Uint8Array(ev.data);
            term.write(data);
          } else {
            term.write(ev.data);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          onConnectionChange?.(false);
          term.write("\r\n\x1b[31m── Connection Closed ──\x1b[0m\r\n");
        };

        ws.onerror = () => {
          setConnected(false);
          onConnectionChange?.(false);
          term.write("\r\n\x1b[31m── Connection Error ──\x1b[0m\r\n");
        };

        // Send keystrokes from terminal to WebSocket (encode as binary)
        const enc = new TextEncoder();
        term.onData((data: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(enc.encode(data));
          }
        });

        // Handle resize
        const sendResize = () => {
          if (!fitAddon || !ws || ws.readyState !== WebSocket.OPEN) return;
          try {
            const dims = fitAddon.proposeDimensions();
            if (dims) {
              // Binary protocol: 0xFE marker, then rows (uint16 BE), cols (uint16 BE)
              const buf = new ArrayBuffer(5);
              const view = new DataView(buf);
              view.setUint8(0, 0xFE);
              view.setUint16(1, dims.rows);
              view.setUint16(3, dims.cols);
              ws.send(buf);
            }
          } catch {}
        };

        resizeObserverRef.current = new ResizeObserver(() => {
          setTimeout(() => {
            try {
              fitAddon?.fit();
              sendResize();
            } catch {}
          }, 50);
        });

        if (containerRef.current) {
          resizeObserverRef.current.observe(containerRef.current);
        }

        setTimeout(sendResize, 500);
      } catch (err) {
        console.error("Terminal init error:", err);
      }
    };

    initTerminal();

    return () => {
      resizeObserverRef.current?.disconnect();
      if (wsRef.current) wsRef.current.close();
      if (xtermRef.current) {
        try {
          xtermRef.current.dispose();
        } catch {}
      }
    };
  }, [visible, TOOLS_WS_URL]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "flex flex-col bg-[#050505] border border-blue-500/20 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/5",
            minimized ? "h-12" : "flex-1 min-h-[300px]"
          )}
        >
          <div className="h-12 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {title}
              </span>
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )}
              />
              <span className="text-[8px] font-black text-slate-500 uppercase">
                [{connected ? "CONNECTED" : "OFFLINE"}]
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div ref={containerRef} className={cn("flex-1 relative", minimized && "hidden")}>
            <div ref={terminalRef} className="absolute inset-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
