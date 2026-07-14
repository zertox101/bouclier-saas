// ============================================================================
// NOTIFICATION SYSTEM - BOUCLIER SAAS
// ============================================================================

export type NotificationSeverity = 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NotificationConfig {
  sound: boolean;
  desktop: boolean;
  toast: boolean;
  minSeverity: NotificationSeverity;
  volume: number; // 0-1
  email: {
    enabled: boolean;
    address: string;
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
  };
}

export interface ThreatNotification {
  id: string;
  type: string;
  severity: NotificationSeverity;
  message: string;
  src_ip: string;
  country: string;
  timestamp: string;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const defaultNotificationConfig: NotificationConfig = {
  sound: true,
  desktop: true,
  toast: true,
  minSeverity: 'HIGH',
  volume: 0.5,
  email: {
    enabled: false,
    address: ''
  },
  slack: {
    enabled: false,
    webhookUrl: ''
  }
};

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

const STORAGE_KEY = 'bouclier-notification-config';

export const saveNotificationConfig = (config: NotificationConfig): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
};

export const loadNotificationConfig = (): NotificationConfig => {
  if (typeof window === 'undefined') return defaultNotificationConfig;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultNotificationConfig;
  
  try {
    return { ...defaultNotificationConfig, ...JSON.parse(saved) };
  } catch {
    return defaultNotificationConfig;
  }
};

// ============================================================================
// SEVERITY HELPERS
// ============================================================================

const severityLevels: Record<NotificationSeverity, number> = {
  INFO: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
};

export const shouldNotify = (
  severity: NotificationSeverity,
  minSeverity: NotificationSeverity
): boolean => {
  return severityLevels[severity] >= severityLevels[minSeverity];
};

export const getSeverityColor = (severity: NotificationSeverity): string => {
  const colors: Record<NotificationSeverity, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    INFO: '#3b82f6'
  };
  return colors[severity];
};

export const getSeverityIcon = (severity: NotificationSeverity): string => {
  const icons: Record<NotificationSeverity, string> = {
    CRITICAL: '🚨',
    HIGH: '⚠️',
    MEDIUM: '⚡',
    INFO: 'ℹ️'
  };
  return icons[severity];
};

// ============================================================================
// SOUND NOTIFICATION
// ============================================================================

class SoundNotificationManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<NotificationSeverity, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSounds();
    }
  }

  private initializeSounds(): void {
    // Créer des sons synthétiques pour chaque sévérité
    const soundUrls: Record<NotificationSeverity, string> = {
      CRITICAL: '/sounds/alert-critical.mp3',
      HIGH: '/sounds/alert-high.mp3',
      MEDIUM: '/sounds/alert-medium.mp3',
      INFO: '/sounds/alert-info.mp3'
    };

    Object.entries(soundUrls).forEach(([severity, url]) => {
      const audio = new Audio(url);
      audio.volume = this.volume;
      this.sounds.set(severity as NotificationSeverity, audio);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  async play(severity: NotificationSeverity): Promise<void> {
    if (!this.enabled) return;

    const audio = this.sounds.get(severity);
    if (!audio) {
      // Fallback: générer un son synthétique
      this.playBeep(severity);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
      this.playBeep(severity);
    }
  }

  private playBeep(severity: NotificationSeverity): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Fréquences différentes par sévérité
      const frequencies: Record<NotificationSeverity, number> = {
        CRITICAL: 880, // A5 (aigu, urgent)
        HIGH: 659,     // E5
        MEDIUM: 523,   // C5
        INFO: 440      // A4 (grave, calme)
      };

      oscillator.frequency.value = frequencies[severity];
      oscillator.type = severity === 'CRITICAL' ? 'square' : 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play beep:', error);
    }
  }
}

export const soundManager = new SoundNotificationManager();

// ============================================================================
// DESKTOP NOTIFICATION
// ============================================================================

class DesktopNotificationManager {
  private permission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (this.permission === 'granted') return true;

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
      return false;
    }
  }

  async show(threat: ThreatNotification): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const icon = getSeverityIcon(threat.severity);
      const notification = new Notification(
        `${icon} Alerte Sécurité ${threat.severity}`,
        {
          body: `${threat.type} détecté depuis ${threat.country}\nSource: ${threat.src_ip}`,
          icon: '/icons/bouclier-logo.png',
          badge: '/icons/badge.png',
          tag: threat.id,
          requireInteraction: threat.severity === 'CRITICAL',
          silent: false,
          timestamp: new Date(threat.timestamp).getTime(),
          data: threat
        }
      );

      notification.onclick = () => {
        window.focus();
        window.location.href = `/incidents/${threat.id}`;
        notification.close();
      };

      // Auto-close après 10 secondes (sauf CRITICAL)
      if (threat.severity !== 'CRITICAL') {
        setTimeout(() => notification.close(), 10000);
      }
    } catch (error) {
      console.warn('Failed to show desktop notification:', error);
    }
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }
}

export const desktopNotificationManager = new DesktopNotificationManager();

// ============================================================================
// NOTIFICATION ORCHESTRATOR
// ============================================================================

export class NotificationOrchestrator {
  private config: NotificationConfig;
  private toastCallback?: (threat: ThreatNotification) => void;

  constructor() {
    this.config = loadNotificationConfig();
    this.initialize();
  }

  private initialize(): void {
    soundManager.setEnabled(this.config.sound);
    soundManager.setVolume(this.config.volume);
  }

  setConfig(config: NotificationConfig): void {
    this.config = config;
    saveNotificationConfig(config);
    this.initialize();
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  setToastCallback(callback: (threat: ThreatNotification) => void): void {
    this.toastCallback = callback;
  }

  async notify(threat: ThreatNotification): Promise<void> {
    // Vérifier si on doit notifier selon la sévérité
    if (!shouldNotify(threat.severity, this.config.minSeverity)) {
      return;
    }

    // Son
    if (this.config.sound) {
      await soundManager.play(threat.severity);
    }

    // Desktop
    if (this.config.desktop) {
      await desktopNotificationManager.show(threat);
    }

    // Toast
    if (this.config.toast && this.toastCallback) {
      this.toastCallback(threat);
    }

    // Log pour debug
    console.log(`[Notification] ${threat.severity}: ${threat.type} from ${threat.country}`);
  }

  async testNotification(severity: NotificationSeverity): Promise<void> {
    const testThreat: ThreatNotification = {
      id: 'test-' + Date.now(),
      type: 'Test Alert',
      severity,
      message: 'Ceci est une notification de test',
      src_ip: '192.168.1.100',
      country: 'France',
      timestamp: new Date().toISOString()
    };

    await this.notify(testThreat);
  }
}

// Singleton instance
export const notificationOrchestrator = new NotificationOrchestrator();

// ============================================================================
// REACT HOOKS
// ============================================================================

export const useNotifications = () => {
  return {
    config: notificationOrchestrator.getConfig(),
    setConfig: (config: NotificationConfig) => notificationOrchestrator.setConfig(config),
    notify: (threat: ThreatNotification) => notificationOrchestrator.notify(threat),
    test: (severity: NotificationSeverity) => notificationOrchestrator.testNotification(severity),
    requestPermission: () => desktopNotificationManager.requestPermission(),
    hasPermission: () => desktopNotificationManager.hasPermission()
  };
};
