'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Volume2, Monitor, Mail, MessageSquare, Shield,
  Check, X, AlertTriangle, Info, Zap, TestTube, Save,
  ChevronRight, Settings as SettingsIcon
} from 'lucide-react';
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
import { NotificationConfig, desktopNotificationManager } from '@/lib/notifications';
import { cn } from '@/lib/utils';

export default function NotificationsSettingsPage() {
  const { config, updateConfig, testNotification } = useNotificationContext();
  const [localConfig, setLocalConfig] = useState<NotificationConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [desktopPermission, setDesktopPermission] = useState(false);

  useEffect(() => {
    setDesktopPermission(desktopNotificationManager.hasPermission());
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(localConfig));
  }, [config, localConfig]);

  const handleSave = () => {
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRequestDesktopPermission = async () => {
    const granted = await desktopNotificationManager.requestPermission();
    setDesktopPermission(granted);
    if (granted) {
      setLocalConfig({ ...localConfig, desktop: true });
    }
  };

  const handleTest = (severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    testNotification(severity);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center">
              <Bell className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                Notifications <span className="text-purple-500">Settings</span>
              </h1>
              <p className="text-sm text-slate-500 font-bold mt-1">
                Configure how you receive security alerts
              </p>
            </div>
          </div>

          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSave}
              className="flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </motion.button>
          )}

          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
            >
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-500">Saved!</span>
            </motion.div>
          )}
        </header>

        {/* Notification Channels */}
        <section className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
            Notification Channels
          </h2>

          <div className="space-y-6">
            {/* Sound */}
            <ChannelToggle
              icon={<Volume2 className="w-5 h-5" />}
              label="Sound Alerts"
              description="Play audio alerts for new threats"
              enabled={localConfig.sound}
              onToggle={(v) => setLocalConfig({ ...localConfig, sound: v })}
            />

            {/* Volume Slider */}
            {localConfig.sound && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-14 space-y-3"
              >
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Volume: {Math.round(localConfig.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localConfig.volume * 100}
                  onChange={(e) => setLocalConfig({ 
                    ...localConfig, 
                    volume: parseInt(e.target.value) / 100 
                  })}
                  className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                />
              </motion.div>
            )}

            {/* Desktop */}
            <div>
              <ChannelToggle
                icon={<Monitor className="w-5 h-5" />}
                label="Desktop Notifications"
                description="Show browser notifications"
                enabled={localConfig.desktop && desktopPermission}
                onToggle={(v) => {
                  if (v && !desktopPermission) {
                    handleRequestDesktopPermission();
                  } else {
                    setLocalConfig({ ...localConfig, desktop: v });
                  }
                }}
              />
              {!desktopPermission && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleRequestDesktopPermission}
                  className="ml-14 mt-2 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3" />
                  Grant Permission
                </motion.button>
              )}
            </div>

            {/* Toast */}
            <ChannelToggle
              icon={<Bell className="w-5 h-5" />}
              label="In-App Notifications"
              description="Show toast notifications in the app"
              enabled={localConfig.toast}
              onToggle={(v) => setLocalConfig({ ...localConfig, toast: v })}
            />
          </div>
        </section>

        {/* Severity Filter */}
        <section className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            Minimum Severity
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            Only notify for alerts at or above this severity level
          </p>

          <div className="grid grid-cols-4 gap-4">
            {(['INFO', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((severity) => (
              <SeverityOption
                key={severity}
                severity={severity}
                selected={localConfig.minSeverity === severity}
                onSelect={() => setLocalConfig({ ...localConfig, minSeverity: severity })}
              />
            ))}
          </div>
        </section>

        {/* Email Integration */}
        <section className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-400" />
            Email Notifications
          </h2>

          <div className="space-y-6">
            <ChannelToggle
              icon={<Mail className="w-5 h-5" />}
              label="Enable Email Alerts"
              description="Receive critical alerts via email"
              enabled={localConfig.email.enabled}
              onToggle={(v) => setLocalConfig({ 
                ...localConfig, 
                email: { ...localConfig.email, enabled: v } 
              })}
            />

            {localConfig.email.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={localConfig.email.address}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    email: { ...localConfig.email, address: e.target.value }
                  })}
                  placeholder="admin@company.com"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 transition-all"
                />
              </motion.div>
            )}
          </div>
        </section>

        {/* Slack Integration */}
        <section className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            Slack Integration
          </h2>

          <div className="space-y-6">
            <ChannelToggle
              icon={<MessageSquare className="w-5 h-5" />}
              label="Enable Slack Alerts"
              description="Send alerts to Slack channel"
              enabled={localConfig.slack.enabled}
              onToggle={(v) => setLocalConfig({ 
                ...localConfig, 
                slack: { ...localConfig.slack, enabled: v } 
              })}
            />

            {localConfig.slack.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={localConfig.slack.webhookUrl}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    slack: { ...localConfig.slack, webhookUrl: e.target.value }
                  })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 transition-all font-mono text-sm"
                />
                <p className="text-xs text-slate-600">
                  Create a webhook in your Slack workspace settings
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Test Notifications */}
        <section className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <TestTube className="w-6 h-6 text-purple-400" />
            Test Notifications
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            Test your notification settings with sample alerts
          </p>

          <div className="grid grid-cols-4 gap-4">
            {(['INFO', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((severity) => (
              <button
                key={severity}
                onClick={() => handleTest(severity)}
                className={cn(
                  "p-4 rounded-xl border-2 font-black text-sm uppercase tracking-wider transition-all hover:scale-105",
                  severity === 'CRITICAL' && "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20",
                  severity === 'HIGH' && "bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20",
                  severity === 'MEDIUM' && "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20",
                  severity === 'INFO' && "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                )}
              >
                Test {severity}
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function ChannelToggle({ 
  icon, 
  label, 
  description, 
  enabled, 
  onToggle 
}: { 
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">{label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>

      <button
        onClick={() => onToggle(!enabled)}
        className={cn(
          "relative w-14 h-7 rounded-full transition-all",
          enabled ? "bg-purple-600" : "bg-white/10"
        )}
      >
        <motion.div
          animate={{ x: enabled ? 28 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}

function SeverityOption({ 
  severity, 
  selected, 
  onSelect 
}: { 
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  selected: boolean;
  onSelect: () => void;
}) {
  const icons = {
    CRITICAL: <AlertTriangle className="w-6 h-6" />,
    HIGH: <Shield className="w-6 h-6" />,
    MEDIUM: <Zap className="w-6 h-6" />,
    INFO: <Info className="w-6 h-6" />
  };

  const colors = {
    CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', selected: 'bg-red-500/20 border-red-500' },
    HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', selected: 'bg-orange-500/20 border-orange-500' },
    MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', selected: 'bg-yellow-500/20 border-yellow-500' },
    INFO: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', selected: 'bg-blue-500/20 border-blue-500' }
  };

  const style = colors[severity];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "p-6 rounded-2xl border-2 transition-all hover:scale-105 relative",
        selected ? style.selected : `${style.bg} ${style.border}`
      )}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
        >
          <Check className={cn("w-4 h-4", style.text)} />
        </motion.div>
      )}

      <div className={cn("mb-3", style.text)}>
        {icons[severity]}
      </div>
      <h3 className={cn("text-sm font-black uppercase tracking-wider", style.text)}>
        {severity}
      </h3>
    </button>
  );
}
