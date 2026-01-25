'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle, Shield, Volume2, VolumeX } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'threat' | 'security';
    priority: 'low' | 'normal' | 'high' | 'critical';
    created_at: string;
    read: boolean;
}

interface NotificationCenterProps {
    wsUrl?: string;
    apiUrl?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    maxNotifications?: number;
    soundEnabled?: boolean;
}

// =============================================================================
// Notification Center Component
// =============================================================================

export function NotificationCenter({
    wsUrl = 'ws://localhost:8080/ws',
    apiUrl = 'http://localhost:8080/api/notifications',
    position = 'top-right',
    maxNotifications = 50,
    soundEnabled: initialSoundEnabled = true
}: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
    const [unreadCount, setUnreadCount] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // WebSocket connection
    const connect = useCallback(() => {
        const clientId = `client_${Math.random().toString(36).substr(2, 9)}`;
        const ws = new WebSocket(`${wsUrl}/${clientId}`);

        ws.onopen = () => {
            console.log('🔔 Notification WebSocket connected');
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log('🔔 Notification WebSocket disconnected');
            setIsConnected(false);
            // Reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Skip heartbeat messages
                if (data.type === 'heartbeat') return;

                // Add notification
                const notification: Notification = {
                    id: data.id || `notif_${Date.now()}`,
                    title: data.title,
                    message: data.message,
                    type: data.type || 'info',
                    priority: data.priority || 'normal',
                    created_at: data.created_at || new Date().toISOString(),
                    read: false
                };

                setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
                setUnreadCount(prev => prev + 1);

                // Play sound for high priority
                if (soundEnabled && (data.priority === 'high' || data.priority === 'critical')) {
                    playNotificationSound();
                }

                // Show browser notification
                showBrowserNotification(notification);
            } catch (e) {
                // Ignore parse errors
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
    }, [wsUrl, maxNotifications, soundEnabled]);

    // Connect on mount
    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    // Request browser notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1idHx0aGJvfHV7eHNydnZ0');
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch (e) { }
    };

    // Show browser notification
    const showBrowserNotification = (notification: Notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/shield-icon.png',
                tag: notification.id
            });
        }
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    // Clear all notifications
    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Remove single notification
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Get icon for notification type
    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
            case 'threat': return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
            case 'security': return <Shield className="w-5 h-5 text-purple-400" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    // Get background color for notification type
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500 bg-green-500/10';
            case 'warning': return 'border-l-yellow-500 bg-yellow-500/10';
            case 'error': return 'border-l-red-500 bg-red-500/10';
            case 'threat': return 'border-l-red-600 bg-red-600/20';
            case 'security': return 'border-l-purple-500 bg-purple-500/10';
            default: return 'border-l-blue-500 bg-blue-500/10';
        }
    };

    // Position classes
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    };

    return (
        <>
            {/* Notification Bell Button */}
            <div className={`fixed ${positionClasses[position]} z-50`}>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen) markAllAsRead();
                    }}
                    className="relative p-3 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg border border-slate-700 transition-all hover:scale-105"
                >
                    <Bell className={`w-6 h-6 ${isConnected ? 'text-cyan-400' : 'text-gray-500'}`} />

                    {/* Connection indicator */}
                    <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />

                    {/* Unread badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Notification Panel */}
            {isOpen && (
                <div className={`fixed ${positionClasses[position]} z-50 mt-16 w-96 max-h-[70vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-cyan-400" />
                            <h3 className="font-semibold text-white">Notifications</h3>
                            <span className="text-xs text-slate-400">({notifications.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                                title={soundEnabled ? 'Mute' : 'Unmute'}
                            >
                                {soundEnabled ? (
                                    <Volume2 className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <VolumeX className="w-4 h-4 text-slate-500" />
                                )}
                            </button>
                            <button
                                onClick={clearAll}
                                className="text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500">No notifications yet</p>
                                <p className="text-xs text-slate-600 mt-1">
                                    {isConnected ? 'Waiting for new alerts...' : 'Connecting...'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-l-4 ${getTypeColor(notification.type)} hover:bg-slate-800/50 transition-colors ${!notification.read ? 'bg-slate-800/30' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-medium text-white text-sm truncate">
                                                        {notification.title}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeNotification(notification.id)}
                                                        className="p-1 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                                                    >
                                                        <X className="w-3 h-3 text-slate-500" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${notification.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                            notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                                notification.priority === 'normal' ? 'bg-slate-500/20 text-slate-400' :
                                                                    'bg-slate-600/20 text-slate-500'
                                                        }`}>
                                                        {notification.priority}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(notification.created_at).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                        <div className="flex items-center justify-between text-xs">
                            <span className={`flex items-center gap-1.5 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                            <span className="text-slate-500">
                                Real-time notifications
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default NotificationCenter;
