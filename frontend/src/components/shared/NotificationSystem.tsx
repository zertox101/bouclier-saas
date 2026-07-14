"use client";

import {
  useState, useEffect, useRef,
  createContext, useContext, useCallback
} from "react";
import {
  AlertTriangle, CheckCircle, Info, X,
  Shield, Zap, Bell
} from "lucide-react";
import { useSecurityWebSocket } from "@/hooks/useSecurityAPI";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
  ip?: string;
  country?: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isMuted: boolean;
  toggleMute: () => void;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sentinel_voice_muted");
    if (saved) setIsMuted(saved === "true");
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newVal = !prev;
      localStorage.setItem("sentinel_voice_muted", String(newVal));
      return newVal;
    });
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window !== "undefined" && !isMuted) {
      window.speechSynthesis.cancel(); // Cancel current to prioritize new critical
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      const voices = window.speechSynthesis.getVoices();
      const techVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Male"));
      if (techVoice) utterance.voice = techVoice;
      window.speechSynthesis.speak(utterance);
    }
  }, [isMuted]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    if (n.type === "critical") {
      speak(`Tactical Warning. ${n.title}. ${n.message}`);
    }

    setNotifications(prev => [{
      ...n,
      id: typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${prev.length}`,
      timestamp: new Date(),
      read: false,
    }, ...prev].slice(0, 50));
  }, [speak]);

  // Live WebSocket feed
  useSecurityWebSocket((data: any) => {
    if (data.type === "live_feed") {
      const isCritical =
        data.event.includes("FAIL") ||
        data.event.includes("DETECTED") ||
        data.event.includes("INTERCEPT");
      if (isCritical) {
        addNotification({
          type: isCritical ? "critical" : "warning",
          title: `Security Event: ${data.event}`,
          message: `Suspicious activity from ${data.src}`,
          ip: data.src,
          country: "XX",
        });
      }
    }
  });

  const markAsRead     = useCallback((id: string) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const markAllAsRead  = useCallback(() => setNotifications(p => p.map(n => ({ ...n, read: true }))), []);
  const clearNotification = useCallback((id: string) => setNotifications(p => p.filter(n => n.id !== id)), []);
  const clearAll       = useCallback(() => setNotifications([]), []);
  const unreadCount    = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, isMuted, toggleMute,
      addNotification, markAsRead, markAllAsRead,
      clearNotification, clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Toast Container — kept but silent (no auto-show) ────────────────────────
export function ToastContainer() {
  // Intentionally disabled — noisy toasts removed per UX request
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  critical: {
    icon:   <AlertTriangle className="w-4 h-4" />,
    color:  "#ef4444",
    bg:     "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    dot:    "#ef4444",
    label:  "CRITICAL",
  },
  warning: {
    icon:   <Zap className="w-4 h-4" />,
    color:  "#f97316",
    bg:     "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
    dot:    "#f97316",
    label:  "WARNING",
  },
  info: {
    icon:   <Shield className="w-4 h-4" />,
    color:  "#06b6d4",
    bg:     "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
    dot:    "#06b6d4",
    label:  "INFO",
  },
  success: {
    icon:   <CheckCircle className="w-4 h-4" />,
    color:  "#22c55e",
    bg:     "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    dot:    "#22c55e",
    label:  "OK",
  },
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)  return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

import { useRouter } from "next/navigation";

// ─── Notification Panel — Facebook-style dropdown ─────────────────────────────
export function NotificationPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Group: Unread first, then read
  const unread = notifications.filter(n => !n.read);
  const read   = notifications.filter(n =>  n.read);

  const handleSeeAll = () => {
    onClose();
    router.push("/alerts");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          key="notif-panel"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1     }}
          exit={{   opacity: 0, y: -8, scale: 0.97   }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            position:     "fixed",
            top:          "60px",
            right:        "12px",
            zIndex:       9999,
            width:        "360px",
            maxHeight:    "calc(100vh - 80px)",
            background:   "#0A0F1D",
            border:       "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            boxShadow:    "0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
            display:      "flex",
            flexDirection:"column",
            overflow:     "hidden",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            justifyContent:"space-between",
            padding:      "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink:   0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell style={{ width: 16, height: 16, color: "#3b82f6" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
                Tactical Notifications
              </span>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                    minWidth:        "20px",
                    height:          "20px",
                    padding:         "0 6px",
                    borderRadius:    "10px",
                    background:      "#ef4444",
                    fontSize:        "10px",
                    fontWeight:      700,
                    color:           "#fff",
                    boxShadow:       "0 0 15px rgba(239,68,68,0.4)",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    fontSize:   "11px",
                    color:      "#60a5fa",
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    padding:    "4px 8px",
                    borderRadius:"6px",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  Tout lire
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    fontSize:   "11px",
                    color:      "#64748b",
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    padding:    "4px 8px",
                    borderRadius:"6px",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ overflowY: "auto", flex: 1 }} className="custom-scrollbar">
            {notifications.length === 0 ? (
              <div style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                justifyContent:"center",
                padding:       "60px 20px",
                color:         "#475569",
                gap:           "10px",
              }}>
                <Shield style={{ width: 32, height: 32, opacity: 0.2 }} />
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>GRID_CLEAR: NO_THREATS</p>
              </div>
            ) : (
              <>
                {/* Unread group */}
                {unread.length > 0 && (
                  <>
                    <div style={{
                      padding:    "12px 16px 4px",
                      fontSize:   "10px",
                      fontWeight: 900,
                      color:      "#3b82f6",
                      textTransform:"uppercase",
                      letterSpacing:"0.12em",
                    }}>
                      LATEST_INTERCEPTS — {unread.length}
                    </div>
                    {unread.map(n => (
                      <NotifItem key={n.id} n={n} onRead={markAsRead} />
                    ))}
                  </>
                )}

                {/* Read group */}
                {read.length > 0 && (
                  <>
                    <div style={{
                      padding:    "12px 16px 4px",
                      fontSize:   "10px",
                      fontWeight: 900,
                      color:      "#334155",
                      textTransform:"uppercase",
                      letterSpacing:"0.12em",
                    }}>
                      ARCHIVED_TELEMETRY
                    </div>
                    {read.map(n => (
                      <NotifItem key={n.id} n={n} onRead={markAsRead} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          {notifications.length > 0 && (
            <div style={{
              padding:      "12px 16px",
              borderTop:    "1px solid rgba(255,255,255,0.05)",
              textAlign:    "center",
              flexShrink:   0,
              background:   "rgba(0,0,0,0.2)"
            }}>
              <button
                onClick={handleSeeAll}
                style={{
                  fontSize:    "10px",
                  color:       "#fff",
                  background:  "#3b82f6",
                  border:      "none",
                  cursor:      "pointer",
                  fontWeight:  900,
                  width:       "100%",
                  padding:     "10px",
                  borderRadius: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  boxShadow: "0 4px 15px rgba(59,130,246,0.3)"
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#2563eb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#3b82f6")}
              >
                Go to Command Alerts Dashboard →
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Single Notification Item ─────────────────────────────────────────────────
function NotifItem({
  n,
  onRead,
}: {
  n: Notification;
  onRead: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[n.type];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onRead(n.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    "flex",
        alignItems: "flex-start",
        gap:        "12px",
        padding:    "11px 16px",
        cursor:     "pointer",
        background: hovered
          ? "rgba(255,255,255,0.04)"
          : n.read
            ? "transparent"
            : "rgba(255,255,255,0.025)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition:   "background 0.15s",
        position:     "relative",
      }}
    >
      {/* Unread dot */}
      {!n.read && (
        <span style={{
          position:  "absolute",
          left:      "6px",
          top:       "50%",
          transform: "translateY(-50%)",
          width:     "5px",
          height:    "5px",
          borderRadius:"50%",
          background: cfg.dot,
          boxShadow:  `0 0 6px ${cfg.dot}`,
        }} />
      )}

      {/* Icon bubble */}
      <div style={{
        flexShrink:     0,
        width:          34,
        height:         34,
        borderRadius:   "50%",
        background:     cfg.bg,
        border:         `1px solid ${cfg.border}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        color:          cfg.color,
        marginLeft:     "6px",
      }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <span style={{
            fontSize:   "10px",
            fontWeight: 700,
            color:      cfg.color,
            letterSpacing: "0.06em",
          }}>
            {cfg.label}
          </span>
          <span style={{
            fontSize: "10px",
            color:    "#475569",
            marginLeft:"auto",
          }}>
            {timeAgo(n.timestamp)}
          </span>
        </div>
        <p style={{
          fontSize:   "12px",
          fontWeight: n.read ? 400 : 600,
          color:      n.read ? "#94a3b8" : "#f1f5f9",
          marginBottom:"2px",
          lineHeight: "1.4",
        }}>
          {n.title}
        </p>
        <p style={{
          fontSize:    "11px",
          color:       "#64748b",
          overflow:    "hidden",
          textOverflow:"ellipsis",
          whiteSpace:  "nowrap",
        }}>
          {n.message}
        </p>
        {n.ip && (
          <p style={{ fontSize:"10px", color:"#334155", fontFamily:"monospace", marginTop:"3px" }}>
            {n.country && <span style={{ marginRight: 4 }}>{n.country}</span>}
            {n.ip}
          </p>
        )}
      </div>
    </motion.div>
  );
}
