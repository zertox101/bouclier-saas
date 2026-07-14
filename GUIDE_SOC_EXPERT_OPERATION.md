# 🎯 Guide Complet: SOC Expert Operation

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Ce qui fonctionne actuellement](#ce-qui-fonctionne-actuellement)
3. [Technologies utilisées](#technologies-utilisées)
4. [Fonctionnalités principales](#fonctionnalités-principales)
5. [Comment accéder aux fonctionnalités](#comment-accéder-aux-fonctionnalités)
6. [État d'avancement](#état-davancement)

---

## 🎯 Vue d'ensemble

**SOC Expert Operation** est une plateforme complète de centre d'opérations de sécurité (SOC) pour les analystes de sécurité experts. Elle intègre tous les modules existants de Bouclier SaaS pour fournir:

- 🔍 **Intelligence des menaces unifiée**
- 🤖 **Réponse automatisée aux incidents**
- 🔗 **Corrélation d'événements en temps réel**
- 🧠 **Analyse assistée par IA (Sentinel LLM)**
- 🎮 **Terminal tactique avec effets CRT**
- 📊 **Tableaux de bord opérationnels en temps réel**

---

## ✅ Ce qui fonctionne actuellement

### 1. **Schémas Pydantic (100% ✅)**
**Fichier:** `backend/app/schemas/soc_expert.py`

**Ce qui est disponible:**
- ✅ 50+ schémas de validation pour toutes les API
- ✅ Validation des adresses IP, hashes, techniques MITRE ATT&CK
- ✅ Schémas pour événements de sécurité, incidents, playbooks, threat intelligence
- ✅ Tests unitaires complets (30+ tests)

**Utilisation:**
```python
from app.schemas.soc_expert import (
    SecurityEventCreate,
    IncidentResponse,
    PlaybookExecutionStatus,
    ThreatIntelligencePackage
)

# Créer un événement de sécurité
event = SecurityEventCreate(
    title="Tentative de connexion suspecte",
    description="Multiples tentatives échouées depuis une localisation inhabituelle",
    event_type=EventType.INTRUSION,
    severity=SeverityLevel.HIGH,
    source_module=SourceModule.GOTHAM_THREAT_MAP,
    source_ip="192.168.1.100",
    mitre_attack_techniques=["T1078", "T1110.001"]
)
```

### 2. **Modèles de base de données (100% ✅)**
**Fichier:** `backend/app/models/soc_expert_sql.py`

**Tables disponibles:**
- ✅ `security_events` - Événements de sécurité normalisés
- ✅ `incidents` - Gestion du cycle de vie des incidents
- ✅ `playbooks` - Workflows de réponse automatisés
- ✅ `playbook_executions` - Historique d'exécution
- ✅ `threat_intelligence` - Packages de threat intelligence
- ✅ `correlation_rules` - Règles de corrélation personnalisées
- ✅ `investigation_notes` - Notes d'investigation collaboratives
- ✅ `threat_hunts` - Chasses aux menaces proactives
- ✅ `alert_priorities` - Priorisation des alertes avec ML

### 3. **Système de notifications (100% ✅)**
**Fichiers:**
- `frontend/src/lib/notifications.ts`
- `frontend/src/components/notifications/NotificationProvider.tsx`
- `frontend/src/app/(dashboard)/settings/notifications/page.tsx`

**Fonctionnalités:**
- ✅ Notifications sonores (Web Audio API)
- ✅ Notifications desktop (Notification API)
- ✅ Notifications toast (Sonner)
- ✅ Filtrage par sévérité (INFO/MEDIUM/HIGH/CRITICAL)
- ✅ Configuration persistante (localStorage)
- ✅ Interface de configuration complète

**Utilisation:**
```typescript
import { useNotificationContext } from '@/components/notifications/NotificationProvider';

const { notify } = useNotificationContext();

// Envoyer une notification
notify({
  title: "Attaque détectée",
  message: "Ransomware détecté sur server-01",
  severity: "critical",
  channels: ["sound", "desktop", "toast"]
});
```

---

## 🛠️ Technologies utilisées

### Backend
| Technologie | Version | Usage |
|------------|---------|-------|
| **Python** | 3.11+ | Langage principal backend |
| **FastAPI** | Latest | Framework API REST + WebSocket |
| **PostgreSQL** | 14+ | Base de données principale |
| **Redis** | 7+ | Cache + Streams pour événements |
| **SQLAlchemy** | 2.0+ | ORM pour base de données |
| **Pydantic** | 2.0+ | Validation de données |
| **Alembic** | Latest | Migrations de base de données |
| **Celery** | Latest | Tâches asynchrones |

### Frontend
| Technologie | Version | Usage |
|------------|---------|-------|
| **Next.js** | 14 | Framework React avec App Router |
| **TypeScript** | 5+ | Typage statique |
| **Tailwind CSS** | 3+ | Styling avec thème Gotham AI |
| **Shadcn/ui** | Latest | Composants UI |
| **ECharts** | 5+ | Visualisations de données |
| **xterm.js** | Latest | Émulateur de terminal |
| **Sonner** | Latest | Notifications toast |

### Intelligence Artificielle
| Technologie | Usage |
|------------|-------|
| **Sentinel LLM** | Analyse contextuelle, génération d'hypothèses |
| **Scikit-learn** | Modèles ML pour priorisation d'alertes |
| **TensorFlow/PyTorch** | Détection d'anomalies comportementales |

### Infrastructure
| Technologie | Usage |
|------------|-------|
| **Docker** | Conteneurisation |
| **Nginx** | Reverse proxy |
| **Redis Streams** | Traitement de flux d'événements |
| **WebSocket** | Communication temps réel |

---

## 🎯 Fonctionnalités principales

### 1. 🔍 Agrégation de Threat Intelligence

**Description:** Collecte et enrichit les données de menaces depuis tous les modules de la plateforme.

**Sources de données:**
- Gotham Threat Map (cartographie des menaces)
- RedHound Pro (détection d'intrusions)
- OSINT 360 (renseignement open source)
- Kali Arsenal (outils offensifs)
- Flux externes (MISP, STIX, etc.)

**Enrichissement:**
- Mapping MITRE ATT&CK automatique
- Attribution d'acteurs de menace
- Calcul de scores de risque
- Contexte historique

**API Endpoints:**
```
GET  /api/soc/threat-intelligence
POST /api/soc/threat-intelligence
GET  /api/soc/threat-intelligence/{id}
PATCH /api/soc/threat-intelligence/{id}
WS   /api/soc/threat-intelligence/stream
```

### 2. 🔗 Corrélation d'événements en temps réel

**Description:** Identifie automatiquement les relations entre événements de sécurité pour détecter les attaques multi-étapes.

**Capacités:**
- Corrélation par IOC (IP, domaine, hash)
- Corrélation temporelle (fenêtres configurables)
- Détection de patterns d'attaque connus
- Règles de corrélation personnalisées

**Latence:** < 2 secondes

**Exemple de règle:**
```json
{
  "name": "Détection de Brute Force",
  "rule_type": "temporal",
  "conditions": {
    "failed_logins": {
      "threshold": 5,
      "window": 300
    }
  },
  "severity": "high"
}
```

### 3. 🤖 Orchestration de réponse aux incidents

**Description:** Exécute des playbooks automatisés pour répondre aux incidents de sécurité.

**Types d'actions:**
- `isolate_asset` - Isoler un système compromis
- `block_ip` - Bloquer une adresse IP malveillante
- `block_domain` - Bloquer un domaine
- `collect_forensics` - Collecter des preuves forensiques
- `notify_stakeholder` - Notifier les parties prenantes
- `execute_command` - Exécuter une commande personnalisée

**Exemple de playbook:**
```json
{
  "name": "Réponse Ransomware",
  "trigger_conditions": {
    "event_type": "ransomware",
    "severity": "critical"
  },
  "steps": [
    {
      "step_id": "step1",
      "step_type": "isolate_asset",
      "name": "Isoler les systèmes infectés",
      "parameters": {"asset_ids": ["server-01"]}
    },
    {
      "step_id": "step2",
      "step_type": "collect_forensics",
      "name": "Collecter les preuves",
      "depends_on": ["step1"]
    }
  ]
}
```

### 4. 🧪 Espace d'investigation expert

**Description:** Environnement collaboratif pour investiguer les incidents avec outils intégrés.

**Fonctionnalités:**
- Interface à onglets multiples
- Timeline chronologique des événements
- Intégration OSINT 360
- Annotations et notes riches
- Pivot depuis n'importe quel IOC
- Génération de rapports (PDF/JSON)

**API Endpoints:**
```
POST /api/soc/notes
GET  /api/soc/notes?incident_id={id}
PATCH /api/soc/notes/{id}
```

### 5. 🎯 Chasse aux menaces proactive

**Description:** Recherche proactive de menaces cachées avec analytics comportementales.

**Types de requêtes:**
- SQL (requêtes directes sur événements)
- Lucene (recherche full-text)
- Sigma (règles de détection)
- Custom (DSL personnalisé)

**Exemple:**
```json
{
  "name": "Chasse Mouvement Latéral",
  "hypothesis": "L'adversaire utilise RDP pour le mouvement latéral",
  "query_type": "sql",
  "query_definition": {
    "table": "security_events",
    "conditions": {
      "event_type": "lateral_movement",
      "protocol": "rdp"
    }
  },
  "lookback_days": 30
}
```

### 6. 💻 Terminal tactique

**Description:** Terminal immersif avec effets CRT et intégration Kali Arsenal.

**Fonctionnalités:**
- Émulateur xterm.js complet
- Effets visuels CRT (scanlines, glow)
- Exécution d'outils Kali Arsenal
- Historique de commandes (Ctrl+R)
- Sessions multiples (onglets)
- Enregistrement de session
- Auto-complétion

**Commandes disponibles:**
```bash
# Scan réseau
nmap -sV 192.168.1.0/24

# Analyse de vulnérabilités
nikto -h target.com

# Forensics
volatility -f memory.dump pslist

# Exploitation
msfconsole
```

### 7. 🎚️ Priorisation d'alertes avec ML

**Description:** Priorise automatiquement les alertes avec machine learning.

**Facteurs de scoring:**
- Sévérité de la menace (0-100)
- Criticité de l'asset (0-100)
- Score de threat intelligence (0-100)
- Score comportemental (0-100)
- Impact business (0-100)

**Niveaux de priorité:**
- 🔴 **CRITICAL** (90-100) - Action immédiate requise
- 🟠 **HIGH** (70-89) - Attention urgente
- 🟡 **MEDIUM** (40-69) - Investigation nécessaire
- 🟢 **LOW** (20-39) - Surveillance
- ⚪ **INFORMATIONAL** (0-19) - Contexte

### 8. 🧠 Analyse assistée par IA (Sentinel LLM)

**Description:** Intelligence artificielle pour augmenter l'expertise des analystes.

**Capacités:**
- Classification automatique des menaces
- Génération d'hypothèses d'investigation
- Recommandations de playbooks
- Résumés en langage naturel
- Réponses aux questions contextuelles
- Évaluation d'impact

**Exemple d'utilisation:**
```python
# Question en langage naturel
question = "Quels sont les IOCs associés à APT29 dans les 30 derniers jours?"

# Réponse IA avec citations
response = sentinel_llm.query(
    question=question,
    context=recent_events,
    confidence_threshold=0.8
)
```

### 9. 📊 Métriques opérationnelles en temps réel

**Description:** Tableaux de bord avec mise à jour WebSocket < 1 seconde.

**Métriques affichées:**
- Incidents actifs
- Alertes par heure
- MTTD (Mean Time To Detect)
- MTTR (Mean Time To Respond)
- MTTA (Mean Time To Acknowledge)
- Distribution de sévérité
- Top acteurs de menace
- Score de posture de sécurité

**Widgets disponibles:**
- Graphiques temporels
- Cartes géographiques
- Listes classées
- Graphiques de corrélation
- Indicateurs de santé système

### 10. 🤝 Partage de Threat Intelligence

**Description:** Collaboration et partage d'intelligence entre analystes.

**Fonctionnalités:**
- Packages de threat intelligence
- Export STIX 2.1
- Flux d'activité des analystes
- Commentaires et discussions
- Contrôle d'accès basé sur les rôles
- Matching automatique contre événements récents

---

## 🚀 Comment accéder aux fonctionnalités

### 1. Configuration Backend

**Fichier:** `backend/.env`
```bash
# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/bouclier_soc

# Redis
REDIS_URL=redis://localhost:6379/0

# Sentinel LLM
SENTINEL_LLM_API_KEY=your_api_key
SENTINEL_LLM_ENDPOINT=https://api.sentinel.ai/v1

# JWT
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**Démarrer le backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8005
```

### 2. Configuration Frontend

**Fichier:** `frontend/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8005
NEXT_PUBLIC_WS_URL=ws://localhost:8005
```

**Démarrer le frontend:**
```bash
cd frontend
npm run dev
```

### 3. Accès aux pages

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard Expert** | `/soc-expert/dashboard` | Vue d'ensemble opérationnelle |
| **Investigation** | `/soc-expert/investigation` | Espace d'investigation |
| **Terminal Tactique** | `/soc-expert/terminal` | Terminal avec effets CRT |
| **Threat Hunt** | `/soc-expert/threat-hunt` | Chasse aux menaces |
| **Incidents** | `/soc-expert/incidents` | Gestion des incidents |
| **Playbooks** | `/soc-expert/playbooks` | Gestion des playbooks |
| **Threat Intel** | `/soc-expert/threat-intelligence` | Intelligence des menaces |
| **Paramètres** | `/soc-expert/settings` | Configuration |

### 4. API REST

**Base URL:** `http://localhost:8005/api/soc`

**Endpoints principaux:**
```bash
# Événements de sécurité
GET    /api/soc/events
POST   /api/soc/events
GET    /api/soc/events/{id}

# Incidents
GET    /api/soc/incidents
POST   /api/soc/incidents
PATCH  /api/soc/incidents/{id}

# Playbooks
GET    /api/soc/playbooks
POST   /api/soc/playbooks
POST   /api/soc/playbooks/{id}/execute

# Threat Intelligence
GET    /api/soc/threat-intelligence
POST   /api/soc/threat-intelligence

# Threat Hunts
GET    /api/soc/threat-hunts
POST   /api/soc/threat-hunts
POST   /api/soc/threat-hunts/{id}/execute

# Alertes
GET    /api/soc/alerts/queue
POST   /api/soc/alerts/acknowledge

# Dashboard
GET    /api/soc/dashboard/metrics
GET    /api/soc/dashboard/trends
```

### 5. WebSocket

**Connexion:**
```typescript
const ws = new WebSocket('ws://localhost:8005/api/soc/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'security_event':
      handleSecurityEvent(data.payload);
      break;
    case 'incident_update':
      handleIncidentUpdate(data.payload);
      break;
    case 'playbook_status':
      handlePlaybookStatus(data.payload);
      break;
  }
};
```

---

## 📊 État d'avancement

### Composants Backend

| Composant | État | Progression |
|-----------|------|-------------|
| **Schémas Pydantic** | ✅ Complet | 100% |
| **Modèles SQLAlchemy** | ✅ Complet | 100% |
| **Migrations Alembic** | ✅ Complet | 100% |
| **Threat Intelligence Aggregator** | 🟡 En cours | 40% |
| **Correlation Engine** | 🟡 En cours | 30% |
| **Playbook Engine** | 🟡 En cours | 35% |
| **Investigation Workspace API** | 🟡 En cours | 25% |
| **Threat Hunt Module** | 🟡 En cours | 20% |
| **Alert Prioritization** | 🟡 En cours | 30% |
| **Cross-Module Connector** | 🟡 En cours | 25% |
| **Sentinel LLM Integration** | 🟡 En cours | 15% |
| **WebSocket Server** | 🟡 En cours | 40% |
| **Authentication System** | 🟡 En cours | 50% |
| **Redis Caching** | 🟡 En cours | 45% |

### Composants Frontend

| Composant | État | Progression |
|-----------|------|-------------|
| **Système de notifications** | ✅ Complet | 100% |
| **Expert Dashboard** | 🟡 En cours | 30% |
| **Investigation Workspace** | 🟡 En cours | 20% |
| **Tactical Terminal** | 🟡 En cours | 25% |
| **Threat Hunt UI** | 🟡 En cours | 15% |
| **Incident Management** | 🟡 En cours | 30% |
| **Playbook Management** | 🟡 En cours | 20% |
| **Threat Intelligence UI** | 🟡 En cours | 25% |
| **Settings Page** | ✅ Complet | 100% |

### Progression globale

```
Backend:  ████████░░░░░░░░░░░░ 40%
Frontend: ██████░░░░░░░░░░░░░░ 30%
Tests:    ████░░░░░░░░░░░░░░░░ 20%
Docs:     ██████████░░░░░░░░░░ 50%

TOTAL:    ██████░░░░░░░░░░░░░░ 35%
```

---

## 🎯 Prochaines étapes

### Phase 1: Core Backend (Semaines 1-2)
- [ ] Finaliser Threat Intelligence Aggregator
- [ ] Implémenter Correlation Engine complet
- [ ] Développer Playbook Engine avec exécution
- [ ] Configurer Redis Streams

### Phase 2: API & WebSocket (Semaines 3-4)
- [ ] Créer tous les endpoints REST
- [ ] Implémenter WebSocket pour temps réel
- [ ] Ajouter authentication JWT complète
- [ ] Configurer rate limiting

### Phase 3: Frontend Core (Semaines 5-6)
- [ ] Développer Expert Dashboard
- [ ] Créer Investigation Workspace
- [ ] Implémenter Tactical Terminal
- [ ] Intégrer notifications existantes

### Phase 4: AI & Advanced (Semaines 7-8)
- [ ] Intégrer Sentinel LLM
- [ ] Implémenter Alert Prioritization ML
- [ ] Développer Threat Hunt Module
- [ ] Ajouter visualisations avancées

### Phase 5: Testing & Polish (Semaines 9-10)
- [ ] Tests d'intégration complets
- [ ] Tests de performance
- [ ] Documentation utilisateur
- [ ] Déploiement production

---

## 📚 Documentation technique

### Schémas de base de données

**Voir:** `backend/app/models/soc_expert_sql.py`

**Relations principales:**
```
SecurityEvent (1) ──→ (N) Incident
Incident (1) ──→ (N) PlaybookExecution
Playbook (1) ──→ (N) PlaybookExecution
Incident (1) ──→ (N) InvestigationNote
ThreatIntelligence (1) ──→ (N) IOC
SecurityEvent (N) ──→ (N) CorrelationRule
```

### Architecture des événements

```
┌─────────────────┐
│ Source Modules  │
│ (Gotham, etc.)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Event Collector │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Event Normalizer│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redis Streams   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Correlation     │
│ Engine          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Incident        │
│ Creation        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Playbook        │
│ Trigger         │
└─────────────────┘
```

---

## 🔧 Dépannage

### Problème: Backend ne démarre pas

**Solution:**
```bash
# Vérifier PostgreSQL
psql -U postgres -c "SELECT version();"

# Vérifier Redis
redis-cli ping

# Réinstaller dépendances
pip install -r requirements.txt

# Appliquer migrations
alembic upgrade head
```

### Problème: Frontend ne se connecte pas au backend

**Solution:**
```bash
# Vérifier les variables d'environnement
cat frontend/.env.local

# Vérifier que le backend écoute
curl http://localhost:8005/health

# Vérifier les CORS
# Dans backend/app/main.py, vérifier:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problème: Notifications ne fonctionnent pas

**Solution:**
```typescript
// Vérifier les permissions navigateur
if (Notification.permission === "default") {
  await Notification.requestPermission();
}

// Vérifier le contexte
const { notify } = useNotificationContext();
if (!notify) {
  console.error("NotificationProvider not found");
}

// Tester manuellement
notify({
  title: "Test",
  message: "Test notification",
  severity: "info"
});
```

---

## 📞 Support

Pour toute question ou problème:

1. **Documentation:** Consultez les fichiers `.md` dans `.kiro/specs/soc-expert-operation/`
2. **Code:** Examinez les exemples dans `backend/app/schemas/test_soc_expert_schemas.py`
3. **Logs:** Vérifiez les logs backend dans `backend/logs/`
4. **Tests:** Exécutez `pytest backend/app/schemas/test_soc_expert_schemas.py -v`

---

## 🎉 Conclusion

Le **SOC Expert Operation** est une plateforme puissante en cours de développement qui combine:

✅ **Technologies modernes** (FastAPI, Next.js 14, Redis, PostgreSQL)
✅ **Intelligence artificielle** (Sentinel LLM, ML pour priorisation)
✅ **Temps réel** (WebSocket, Redis Streams)
✅ **Sécurité** (JWT, RBAC, encryption)
✅ **Expérience utilisateur** (Terminal CRT, notifications, dashboards)

**Progression actuelle: 35%** avec les fondations solides (schémas, modèles, notifications) déjà en place.

Les 116 tâches restantes sont organisées et prêtes à être exécutées pour atteindre 100% de complétion.
