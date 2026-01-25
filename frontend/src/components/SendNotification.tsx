'use client';

import React, { useState } from 'react';
import { Send, Bell, AlertTriangle, CheckCircle, Info, AlertCircle, Shield, X } from 'lucide-react';

interface SendNotificationProps {
    apiUrl?: string;
}

interface NotificationForm {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'threat' | 'security';
    priority: 'low' | 'normal' | 'high' | 'critical';
}

const NotificationTypes = [
    { value: 'info', label: 'Info', icon: Info, color: 'text-blue-400' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-400' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-400' },
    { value: 'error', label: 'Error', icon: AlertCircle, color: 'text-red-400' },
    { value: 'threat', label: 'Threat', icon: AlertTriangle, color: 'text-red-500' },
    { value: 'security', label: 'Security', icon: Shield, color: 'text-purple-400' },
] as const;

const Priorities = [
    { value: 'low', label: 'Low', color: 'bg-slate-500' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500' },
] as const;

export function SendNotification({ apiUrl = 'http://localhost:8080/api/notifications' }: SendNotificationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState<NotificationForm>({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const response = await fetch(`${apiUrl}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    channels: ['websocket']
                })
            });

            if (response.ok) {
                setSuccess(true);
                setForm({ title: '', message: '', type: 'info', priority: 'normal' });
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendQuickAlert = async (type: string, title: string, message: string, priority: string = 'high') => {
        try {
            await fetch(`${apiUrl}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    message,
                    type,
                    priority,
                    channels: ['websocket']
                })
            });
        } catch (error) {
            console.error('Failed to send quick alert:', error);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-40 p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-full shadow-lg transition-all hover:scale-105"
                title="Send Notification"
            >
                <Send className="w-6 h-6 text-white" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-40 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Send Notification</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-slate-800 bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-2">Quick Alerts:</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => sendQuickAlert('threat', '🚨 Threat Detected!', 'Suspicious activity detected in the system', 'critical')}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition-colors"
                    >
                        🚨 Threat
                    </button>
                    <button
                        onClick={() => sendQuickAlert('warning', '⚠️ Security Warning', 'Unusual login attempt detected', 'high')}
                        className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs rounded-lg transition-colors"
                    >
                        ⚠️ Warning
                    </button>
                    <button
                        onClick={() => sendQuickAlert('success', '✅ All Clear', 'Security scan completed - No threats found', 'normal')}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs rounded-lg transition-colors"
                    >
                        ✅ Success
                    </button>
                    <button
                        onClick={() => sendQuickAlert('security', '🔒 Security Update', 'New security policy applied', 'normal')}
                        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs rounded-lg transition-colors"
                    >
                        🔒 Security
                    </button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Notification title..."
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                </div>

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                    <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Enter notification message..."
                        required
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
                    />
                </div>

                {/* Type & Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                        >
                            {NotificationTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                        <select
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                        >
                            {Priorities.map((priority) => (
                                <option key={priority.value} value={priority.value}>
                                    {priority.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${success
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white'
                        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Sent!
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Send Notification
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default SendNotification;
