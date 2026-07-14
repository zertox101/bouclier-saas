'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  notificationOrchestrator, 
  ThreatNotification,
  NotificationConfig,
  getSeverityIcon,
  getSeverityColor
} from '@/lib/notifications';
import { AlertTriangle, Shield, Info, Zap, X, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// CONTEXT
// ============================================================================

interface NotificationContextType {
  config: NotificationConfig;
  updateConfig: (config: NotificationConfig) => void;
  notify: (threat: ThreatNotification) => void;
  testNotification: (severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [config, setConfig] = useState<NotificationConfig>(
    notificationOrchestrator.getConfig()
  );

  useEffect(() => {
    // Configurer le callback toast
    notificationOrchestrator.setToastCallback((threat: ThreatNotification) => {
      showToast(threat);
    });
  }, []);

  const showToast = (threat: ThreatNotification) => {
    const icon = getSeverityIcon(threat.severity);
    const color = getSeverityColor(threat.severity);

    const toastId = toast.custom(
      (t) => (
        <div 
          className="bg-[#0D121B] border-2 rounded-2xl p-6 shadow-2xl min-w-[400px] max-w-[500px]"
          style={{ borderColor: color }}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ 
                backgroundColor: `${color}20`,
                border: `1px solid ${color}40`
              }}
            >
              {threat.severity === 'CRITICAL' && <AlertTriangle className="w-6 h-6" style={{ color }} />}
              {threat.severity === 'HIGH' && <Shield className="w-6 h-6" style={{ color }} />}
              {threat.severity === 'MEDIUM' && <Zap className="w-6 h-6" style={{ color }} />}
              {threat.severity === 'INFO' && <Info className="w-6 h-6" style={{ color }} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {icon} {threat.severity} ALERT
                </h4>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-white font-bold mb-3 leading-relaxed">
                {threat.type}
              </p>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Source:</span>
                  <span className="text-slate-300">{threat.src_ip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Origin:</span>
                  <span className="text-slate-300">{threat.country}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => {
                    router.push(`/incidents/${threat.id}`);
                    toast.dismiss(t);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    border: `1px solid ${color}40`
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: threat.severity === 'CRITICAL' ? Infinity : 10000,
        position: 'top-right',
      }
    );
  };

  const updateConfig = (newConfig: NotificationConfig) => {
    setConfig(newConfig);
    notificationOrchestrator.setConfig(newConfig);
  };

  const notify = (threat: ThreatNotification) => {
    notificationOrchestrator.notify(threat);
  };

  const testNotification = (severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    notificationOrchestrator.testNotification(severity);
  };

  return (
    <NotificationContext.Provider value={{ config, updateConfig, notify, testNotification }}>
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton={false}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'pointer-events-auto',
          }
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
}
