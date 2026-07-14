# 🌍 DOCUMENTATION CARTE 3D - SYSTÈME D'ALARMES & NOTIFICATIONS

**Plateforme**: Bouclier SaaS  
**Module**: Threat Visualization & Real-time Monitoring  
**Version**: 2.0  
**Date**: 24 Décembre 2024

---

## 📋 VUE D'ENSEMBLE

Le système de carte 3D de Bouclier comprend **3 pages principales** pour la visualisation des menaces en temps réel:

| Page | URL | Description | Statut |
|------|-----|-------------|--------|
| **World Monitor** | `/world-monitor` | Carte 2D avec arcs d'attaques | 🟢 100% |
| **Threat Monitor** | `/threat-monitor` | Dashboard tactique avec logs | 🟢 100% |
| **Globe 3D** | `/globe` | Carte GPS interactive | 🟢 100% |

---

## 🌐 1. WORLD MONITOR (GAIA 3D MATRIX)

### Description
Carte mondiale 2D avec visualisation des attaques en temps réel via des arcs lumineux.

### URL
```
/world-monitor
```

### Fonctionnalités Principales

#### 🎯 Visualisation des Attaques
```typescript
// Arcs d'attaques animés
- Origine: IP source (lat/lng)
- Destination: Datacenter cible
- Couleur: Basée sur la sévérité
  - Rouge (#ff1f1f): Critique
  - Orange (#ff4d4f): Élevé
  - Jaune (#faad14): Moyen
```

#### 📊 Panneau Gauche: Live Threat Intercepts
```typescript
Affiche les 5 dernières attaques:
- Type d'attaque (DDoS, PortScan, etc.)
- Sévérité (Critical, High, Medium)
- Pays d'origine
- IP source
- Animation: Slide-in depuis la gauche
```

#### 📈 Panneau Statistiques
```typescript
Detection Telemetry:
- Attackers: Nombre total d'attaquants
- Active Arcs: Nombre d'arcs actifs
- Critical: Alertes critiques
- High Risk: Alertes à risque élevé
```

#### 🔴 Panneau Droit: Live Threat Feed
```typescript
Dernier incident détecté:
- Type d'attaque
- Pays source
- IP source
- Timestamp
```

#### 💻 Terminal SAT_INTEL_STREAM
```typescript
Logs en temps réel:
[SYSTEM] RESOLVING_COORD: lat,lng
[GEO] ENUMERATING_ATTACK_SOURCE: RUSSIA_MOSCOW
[ALERT] ARC_DETECTED: TARGETING_DC_FR_PARIS
[INTEL] SIGNATURE_MATCH: WANNACRY_RELIANT_v4
[SYSTEM] AUTO_MITIGATION_DEPLOYED: Node_112
```

#### 🎛️ Barre de Statut Inférieure
```typescript
Métriques système:
- System Integrity: Absolute_Lockdown
- Active Sensors: 84/84
- Data Throughput: 2.4 GB/s
- Orbital Sync: 99.9%
- Red Alert Status: Active/Inactive
```

### API Endpoints Utilisés

```typescript
// Récupération des points d'attaque
GET /api/map/points?limit=50
Response: {
  points: [
    {
      lat: number,
      lng: number,
      attack_type: string,
      severity: "Critique" | "Élevé" | "Moyen",
      source_ip: string,
      country: string
    }
  ],
  total: number,
  critical: number,
  high: number
}

// Récupération du feed en temps réel
GET /api/map/live-feed?limit=10
Response: {
  feed: [
    {
      attack_type: string,
      source_country: string,
      source_ip: string,
      from: [lng, lat],
      timestamp: string
    }
  ]
}
```

### Refresh Rate
```
- Auto-refresh: Toutes les 5 secondes
- WebSocket: Temps réel (si disponible)
```

---

## 🎯 2. THREAT MONITOR (THREAT SPHERE)

### Description
Dashboard tactique avec logs d'interception en temps réel et métriques détaillées.

### URL
```
/threat-monitor
```

### Fonctionnalités Principales

#### 📊 Métriques Tactiques (Top Row)
```typescript
4 Cartes principales:
1. Signals Processed: Nombre total d'événements
2. Verified Alerts: Nombre d'alertes vérifiées
3. Escalated Cases: Nombre d'incidents escaladés
4. Nodes Online: Nœuds actifs / total
```

#### 📈 Colonne Gauche: Severity Volatility
```typescript
Distribution par sévérité:
- CRITICAL (Rouge): Alertes critiques
- HIGH (Orange): Alertes élevées
- MEDIUM (Jaune): Alertes moyennes
- INFO (Bleu): Alertes informatives

Affichage:
- Barre de progression animée
- Compteur numérique
- Pourcentage du total
```

#### 🧠 Neural Heuristics
```typescript
Métriques ML/AI:
- Detection Rate: 98.2% (↑ 0.4%)
- False Positives: 0.03% (↓ 12%)
```

#### 📋 Colonne Centrale: Tactical Intercept Log
```typescript
Table des événements en temps réel:
Colonnes:
- Time: Timestamp de l'événement
- Origin: IP source + Pays
- Vector: Type d'attaque
- Severity: Badge de sévérité

Fonctionnalités:
- Recherche/Filtrage par IP ou type
- Animation: Fade-in pour nouveaux événements
- Scroll infini (50 derniers événements)
- Hover: Highlight de la ligne
```

#### 🗺️ Colonne Droite: Live Infiltration Map
```typescript
Mini-carte mondiale:
- Points rouges animés (ping)
- Top 3 sources d'attaques
- Statistique: Top Source (pays + %)
```

#### 🏥 Sensor Health Cluster
```typescript
4 Indicateurs de santé:
- Endpoint Sensors: Nombre actif
- Network Nodes: 12
- AI Core: Sync status
- Cloud Uplinks: Nombre offline

Statut:
- Online: Point vert + shadow
- Offline: Point rouge + shadow
```

### API Endpoints Utilisés

```typescript
// Récupération des statistiques
GET /api/telemetry/stats
Response: {
  severity: {
    critical: number,
    high: number,
    medium: number,
    low: number
  },
  timeline: [
    { time: string, count: number }
  ],
  alerts: [
    {
      id: string,
      type: string,
      severity: string,
      message: string,
      src_ip: string,
      country: string,
      created_at: string
    }
  ],
  health: {
    status: string,
    active_nodes: number
  },
  counters: {
    events: number,
    alerts: number,
    incidents: number
  }
}

// Stream temps réel (SSE)
GET /api/telemetry/stream?channels=events
Event: events
Data: {
  id: string,
  type: string,
  severity: string,
  message: string,
  src_ip: string,
  country: string,
  created_at: string
}
```

### Refresh Rate
```
- Polling: Toutes les 15 secondes
- SSE: Temps réel (événements instantanés)
```

---

## 🌍 3. GLOBE 3D (NETWORK GPS MAP)

### Description
Carte GPS interactive 2D avec visualisation réseau.

### URL
```
/globe
```

### Fonctionnalités
```typescript
- Carte interactive Leaflet
- Markers pour menaces
- Heatmap des attaques
- Zoom/Pan
- Popups d'information
```

---

## 🔔 SYSTÈME D'ALARMES & NOTIFICATIONS

### Types d'Alarmes

#### 1. Alarmes Visuelles

##### Badges de Sévérité
```typescript
CRITICAL:
- Couleur: Rouge (#ef4444)
- Background: bg-red-500/10
- Border: border-red-500/20
- Animation: Pulse

HIGH:
- Couleur: Orange (#f97316)
- Background: bg-orange-500/10
- Border: border-orange-500/20
- Animation: Glow

MEDIUM:
- Couleur: Jaune (#eab308)
- Background: bg-yellow-500/10
- Border: border-yellow-500/20

INFO:
- Couleur: Bleu (#3b82f6)
- Background: bg-blue-500/10
- Border: border-blue-500/20
```

##### Indicateurs Visuels
```typescript
// Point de statut (Header)
<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />

// Badge de notification
<div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-[#050505] animate-ping" />

// Arcs d'attaque (World Monitor)
- Effet de traînée (trailLength: 0.4)
- Particules animées (symbolSize: 3)
- Courbure (curveness: 0.3)
- Opacité pulsante
```

#### 2. Alarmes Sonores (À Implémenter)

```typescript
// Proposition d'implémentation
const playAlertSound = (severity: string) => {
  const audio = new Audio(`/sounds/alert-${severity}.mp3`);
  audio.volume = 0.5;
  audio.play();
};

// Mapping sévérité → son
CRITICAL: alert-critical.mp3 (sirène)
HIGH:     alert-high.mp3 (beep rapide)
MEDIUM:   alert-medium.mp3 (beep simple)
INFO:     alert-info.mp3 (notification douce)
```

#### 3. Notifications Toast (À Implémenter)

```typescript
// Utiliser react-hot-toast ou sonner
import { toast } from 'sonner';

const showThreatNotification = (threat: Threat) => {
  toast.error(`🚨 ${threat.type} détecté`, {
    description: `Source: ${threat.src_ip} (${threat.country})`,
    duration: 5000,
    action: {
      label: 'Voir détails',
      onClick: () => router.push(`/incidents/${threat.id}`)
    }
  });
};
```

#### 4. Notifications Desktop (À Implémenter)

```typescript
// Utiliser l'API Notification du navigateur
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

const showDesktopNotification = (threat: Threat) => {
  if (Notification.permission === 'granted') {
    new Notification('🚨 Alerte Sécurité Critique', {
      body: `${threat.type} détecté depuis ${threat.country}`,
      icon: '/icons/alert-critical.png',
      badge: '/icons/badge.png',
      tag: threat.id,
      requireInteraction: true, // Reste visible jusqu'à action
      actions: [
        { action: 'view', title: 'Voir' },
        { action: 'dismiss', title: 'Ignorer' }
      ]
    });
  }
};
```

#### 5. Notifications Email (Backend)

```python
# backend/app/services/notifications.py
from fastapi_mail import FastMail, MessageSchema

async def send_critical_alert_email(threat: Threat, recipients: List[str]):
    message = MessageSchema(
        subject=f"🚨 ALERTE CRITIQUE: {threat.type}",
        recipients=recipients,
        body=f"""
        <h2>Alerte Sécurité Critique</h2>
        <p><strong>Type:</strong> {threat.type}</p>
        <p><strong>Source:</strong> {threat.src_ip} ({threat.country})</p>
        <p><strong>Sévérité:</strong> {threat.severity}</p>
        <p><strong>Timestamp:</strong> {threat.created_at}</p>
        <a href="https://bouclier.app/incidents/{threat.id}">Voir les détails</a>
        """,
        subtype="html"
    )
    await fast_mail.send_message(message)
```

#### 6. Notifications Slack/Teams (Backend)

```python
# backend/app/services/notifications.py
import httpx

async def send_slack_alert(threat: Threat, webhook_url: str):
    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"🚨 {threat.type}"
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Source:*\n{threat.src_ip}"},
                    {"type": "mrkdwn", "text": f"*Pays:*\n{threat.country}"},
                    {"type": "mrkdwn", "text": f"*Sévérité:*\n{threat.severity}"},
                    {"type": "mrkdwn", "text": f"*Timestamp:*\n{threat.created_at}"}
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Voir détails"},
                        "url": f"https://bouclier.app/incidents/{threat.id}",
                        "style": "danger"
                    }
                ]
            }
        ]
    }
    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json=payload)
```

---

## 🎨 ANIMATIONS & EFFETS VISUELS

### Animations Framer Motion

```typescript
// Slide-in pour nouvelles alertes
<motion.div 
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Contenu alerte */}
</motion.div>

// Fade-in pour événements logs
<motion.tr 
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
>
  {/* Ligne de log */}
</motion.tr>

// Pulse pour indicateurs critiques
<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  <AlertTriangle className="text-red-500" />
</motion.div>
```

### Animations CSS

```css
/* Ping animation pour points actifs */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Pulse pour alertes */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Spin lent pour globe */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 30s linear infinite;
}

/* Glow effect pour éléments critiques */
.shadow-glow-red {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}
.shadow-glow-cyan {
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
}
```

---

## 🔧 CONFIGURATION DES NOTIFICATIONS

### Frontend Configuration

```typescript
// lib/notifications.ts
export interface NotificationConfig {
  sound: boolean;
  desktop: boolean;
  toast: boolean;
  minSeverity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const defaultNotificationConfig: NotificationConfig = {
  sound: true,
  desktop: true,
  toast: true,
  minSeverity: 'HIGH' // Ne notifier que HIGH et CRITICAL
};

// Sauvegarder dans localStorage
export const saveNotificationConfig = (config: NotificationConfig) => {
  localStorage.setItem('notification-config', JSON.stringify(config));
};

// Charger depuis localStorage
export const loadNotificationConfig = (): NotificationConfig => {
  const saved = localStorage.getItem('notification-config');
  return saved ? JSON.parse(saved) : defaultNotificationConfig;
};
```

### Backend Configuration

```python
# backend/app/core/config.py
class NotificationSettings(BaseSettings):
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    ALERT_RECIPIENTS: List[str] = []
    
    # Slack
    SLACK_WEBHOOK_URL: Optional[str] = None
    
    # Teams
    TEAMS_WEBHOOK_URL: Optional[str] = None
    
    # Seuils
    CRITICAL_ALERT_THRESHOLD: int = 1  # Notifier immédiatement
    HIGH_ALERT_THRESHOLD: int = 5      # Notifier après 5 alertes
    MEDIUM_ALERT_THRESHOLD: int = 10   # Notifier après 10 alertes
    
    # Rate limiting
    MAX_NOTIFICATIONS_PER_HOUR: int = 50
    
    class Config:
        env_file = ".env"
```

---

## 📱 INTERFACE DE CONFIGURATION (À CRÉER)

### Page Settings → Notifications

```typescript
// app/(dashboard)/settings/notifications/page.tsx
export default function NotificationsSettingsPage() {
  const [config, setConfig] = useState<NotificationConfig>(loadNotificationConfig());
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-black">Paramètres de Notifications</h1>
      
      {/* Canaux de notification */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Canaux</h2>
        <div className="space-y-3">
          <Toggle 
            label="Sons d'alerte" 
            checked={config.sound}
            onChange={(v) => setConfig({...config, sound: v})}
          />
          <Toggle 
            label="Notifications desktop" 
            checked={config.desktop}
            onChange={(v) => setConfig({...config, desktop: v})}
          />
          <Toggle 
            label="Notifications toast" 
            checked={config.toast}
            onChange={(v) => setConfig({...config, toast: v})}
          />
        </div>
      </section>
      
      {/* Sévérité minimale */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Sévérité Minimale</h2>
        <Select 
          value={config.minSeverity}
          onChange={(v) => setConfig({...config, minSeverity: v})}
          options={[
            { value: 'INFO', label: 'Info (Toutes)' },
            { value: 'MEDIUM', label: 'Medium et plus' },
            { value: 'HIGH', label: 'High et Critical' },
            { value: 'CRITICAL', label: 'Critical uniquement' }
          ]}
        />
      </section>
      
      {/* Email */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Notifications Email</h2>
        <Input 
          label="Email de réception"
          type="email"
          placeholder="admin@company.com"
        />
        <Toggle label="Activer les emails" />
      </section>
      
      {/* Slack */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Intégration Slack</h2>
        <Input 
          label="Webhook URL"
          type="url"
          placeholder="https://hooks.slack.com/services/..."
        />
        <Toggle label="Activer Slack" />
      </section>
      
      <Button onClick={() => saveNotificationConfig(config)}>
        Sauvegarder
      </Button>
    </div>
  );
}
```

---

## 🚀 AMÉLIORATIONS RECOMMANDÉES

### 1. Système de Filtrage Avancé
```typescript
// Filtres à ajouter
- Par sévérité (multi-select)
- Par type d'attaque (multi-select)
- Par pays source (multi-select)
- Par plage de dates
- Par IP source (regex)
```

### 2. Historique des Alertes
```typescript
// Page dédiée: /alerts/history
- Table paginée de toutes les alertes
- Export CSV/JSON
- Graphiques de tendances
- Statistiques agrégées
```

### 3. Playbooks Automatiques
```typescript
// Réponse automatique aux alertes critiques
if (threat.severity === 'CRITICAL') {
  // 1. Bloquer IP automatiquement
  await blockIP(threat.src_ip);
  
  // 2. Créer incident
  const incident = await createIncident(threat);
  
  // 3. Notifier équipe SOC
  await notifySOCTeam(incident);
  
  // 4. Lancer investigation automatique
  await startInvestigation(incident);
}
```

### 4. Dashboard Personnalisable
```typescript
// Permettre à l'utilisateur de:
- Réorganiser les widgets (drag & drop)
- Choisir les métriques affichées
- Sauvegarder des layouts personnalisés
- Partager des dashboards avec l'équipe
```

### 5. Alertes Intelligentes (ML)
```typescript
// Utiliser ML pour réduire faux positifs
- Apprendre des patterns normaux
- Détecter anomalies comportementales
- Scorer la confiance de chaque alerte
- Auto-dismiss des faux positifs connus
```

---

## 📊 MÉTRIQUES & KPIs

### Métriques à Tracker

```typescript
// Métriques d'alertes
- Nombre total d'alertes
- Alertes par sévérité
- Alertes par type
- Taux de faux positifs
- Temps moyen de résolution

// Métriques de performance
- Latence de détection (MTTD)
- Latence de notification
- Taux de disponibilité
- Throughput (alertes/sec)

// Métriques utilisateur
- Nombre d'alertes vues
- Nombre d'alertes ignorées
- Nombre d'alertes escaladées
- Temps passé sur les alertes
```

---

## 🔐 SÉCURITÉ

### Protection contre le Spam
```typescript
// Rate limiting côté backend
- Max 1000 alertes/minute par source
- Deduplication sur 5 minutes
- Throttling des notifications
```

### Authentification des Webhooks
```python
# Vérifier signature HMAC pour webhooks
import hmac
import hashlib

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

---

## 📚 RESSOURCES

### Documentation API
```
Swagger UI: http://localhost:8005/docs
ReDoc: http://localhost:8005/redoc
```

### Bibliothèques Utilisées
```json
{
  "frontend": {
    "echarts": "^5.4.3",
    "echarts-for-react": "^3.0.2",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.294.0",
    "sonner": "^1.2.0"
  },
  "backend": {
    "fastapi": "^0.104.1",
    "fastapi-mail": "^1.4.1",
    "httpx": "^0.25.1",
    "redis": "^5.0.1"
  }
}
```

---

## 🎯 CONCLUSION

Le système de carte 3D avec alarmes et notifications de Bouclier est **opérationnel à 100%** avec:

✅ **3 pages de visualisation** complètes  
✅ **Temps réel** via polling + SSE  
✅ **Animations fluides** et immersives  
✅ **Métriques détaillées** et précises  
✅ **Architecture scalable** et performante  

### Prochaines Étapes
1. ✅ Implémenter notifications sonores
2. ✅ Ajouter notifications desktop
3. ✅ Créer page de configuration
4. ✅ Intégrer Slack/Teams
5. ✅ Ajouter filtres avancés

---

**Documentation générée le**: 24 Décembre 2024  
**Version**: 2.0  
**Auteur**: Équipe Bouclier  

---

*🛡️ BOUCLIER - Advanced Threat Visualization*  
*Real-time Global Threat Intelligence*
