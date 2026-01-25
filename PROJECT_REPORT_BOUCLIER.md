# 🛡️ Rapport Global : Plateforme Bouclier (CyberDetect)

## 🎯 Vision du Projet
Bouclier est un SaaS de cybersécurité de type **SOC-as-a-Service** (Security Operations Center) conçu pour les entreprises. Il combine la détection de menaces en temps réel, l'analyse par Intelligence Artificielle (IA) et une plateforme d'académie pour former les analystes.

---

## 🏗️ Architecture Technique (Stack)
- **Frontend** : Next.js 14, TailwindCSS, Framer Motion, Recharts.
- **Backend Core** : FastAPI (Python), SQLAlchemy, PostgreSQL (DB), Redis (Streams/Cache).
- **Intelligence Artificielle** : Ollama (Llama 3.2), Scikit-Learn (Anomalies comportementales).
- **Tooling Execution** : API Python isolée pour lancer des outils de sécurité (Nmap, Metasploit, etc.).
- **Simulateur d'Attaque** : Un container Kali Linux automatisé pour tester vos propres défenses.

---

## 🛠️ Modules et Outils Inclus

### 1. Console de Commandes (Dashboard)
- **Flux Temps-Réel** : Ingestion via Redis Streams & SSE pour afficher les attaques à la nanoseconde près.
- **KPIs Dynamiques** : Statistiques sur le taux de réussite des attaques interceptées.
- **Map Interactive** : Visualisation GPS des sources de menaces mondiales.

### 2. Arsenal de Sécurité (Tools)
La plateforme intègre nativement (via `tools-api`) :
- **Network Scanner** : Cartographie des services ouverts sur vos infrastructures.
- **Adversary Emulator** : Simulation d'attaques sécurisées pour valider les règles de détection.
- **Forensics Collector** : Récupération à distance des artefacts de compromission.
- **Connecteur SQL** : Ingestion sécurisée (AES-GCM) de bases de données externes pour analyse.

### 3. Intelligence Artificielle (Sentinel AI)
- **Copilot SOC** : Chatbot contextuel capable d'analyser une alerte et de suggérer une remédiation.
- **Détection d'Anomalies** : Modèles ML (GRU/Isolation Forest) qui détectent des comportements qu'un humain ou une règle statique ne verrait pas.

### 4. Académie (Training Hub)
- **Labs Gamifiés** : Parcours de formation interactifs (Bypass WAF, Exfiltration, IAM Escalation).
- **Progression** : Système de rang (de Junior à Senior Analyst) basé sur les labs complétés.

---

## 🔒 Sécurité et Gouvernance
- **Chiffrement au Repos** : Secrets DB stockés via AES-GCM avec clé maître.
- **Isolation SaaS** : Multi-tenancy simulé par `org_id` sur toutes les entités.
- **Audit Permanent** : Log de chaque action administrative (création de connecteur, exécution d'outil).

---

## 📂 Organisation des Fichiers
- `/frontend` : Interface utilisateur premium (3001).
- `/backend` : Logique métier, API, et gestion DB (8005).
- `/tools-api` : Exécuteur de commandes de sécurité (8100).
- `/kali` : Scripts d'attaque automatisés pour la télémétrie.

---
**Bouclier (CyberDetect) - 2026**
*Plateforme sécurisée par défaut, prête pour l'entreprise.*
