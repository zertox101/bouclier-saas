"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { AlertTriangle, CheckCircle, Info, X, Shield, Zap } from "lucide-react";

// Types
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
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
}

// Notification Provider
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
        const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotification,
            clearAll,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

// Toast Container Component
export function ToastContainer() {
    const { notifications, clearNotification } = useNotifications();
    const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

    useEffect(() => {
        // Show only unread notifications as toasts (max 3)
        const unread = notifications.filter(n => !n.read).slice(0, 3);
        setVisibleToasts(unread);
    }, [notifications]);

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (visibleToasts.length > 0) {
                clearNotification(visibleToasts[0].id);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [visibleToasts, clearNotification]);

    if (visibleToasts.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case "critical":
                return <AlertTriangle className="h-5 w-5 text-red-400" />;
            case "warning":
                return <Zap className="h-5 w-5 text-orange-400" />;
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            default:
                return <Info className="h-5 w-5 text-cyan-400" />;
        }
    };

    const getBorderColor = (type: string) => {
        switch (type) {
            case "critical":
                return "border-red-500/50 bg-red-500/10";
            case "warning":
                return "border-orange-500/50 bg-orange-500/10";
            case "success":
                return "border-green-500/50 bg-green-500/10";
            default:
                return "border-cyan-500/50 bg-cyan-500/10";
        }
    };

    return (
        <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm">
            {visibleToasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className={`animate-in slide-in-from-right-5 fade-in duration-300 flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${getBorderColor(toast.type)}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(toast.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{toast.title}</p>
                            {toast.type === "critical" && (
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{toast.message}</p>
                        {toast.ip && (
                            <p className="text-[10px] text-cyan-400 font-mono mt-1">
                                {toast.country && <span className="mr-1">{toast.country}</span>}
                                {toast.ip}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => clearNotification(toast.id)}
                        className="flex-shrink-0 text-slate-500 hover:text-white transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// Notification Panel Component
export function NotificationPanel({
    isOpen,
    onClose
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case "critical":
                return <AlertTriangle className="h-4 w-4 text-red-400" />;
            case "warning":
                return <Zap className="h-4 w-4 text-orange-400" />;
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            default:
                return <Shield className="h-4 w-4 text-cyan-400" />;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-4 top-16 z-50 w-80 max-h-[70vh] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 p-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300"
                        >
                            Tout lire
                        </button>
                        <button
                            onClick={clearAll}
                            className="text-[10px] text-slate-500 hover:text-slate-300"
                        >
                            Effacer tout
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                            <Shield className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-xs">Aucune notification</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`flex items-start gap-3 border-b border-slate-800/50 p-3 transition cursor-pointer hover:bg-slate-800/50 ${!notification.read ? "bg-slate-800/30" : ""
                                    }`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs font-medium ${!notification.read ? "text-white" : "text-slate-300"}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.read && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[9px] text-slate-600 mt-1">
                                        {notification.timestamp.toLocaleTimeString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
