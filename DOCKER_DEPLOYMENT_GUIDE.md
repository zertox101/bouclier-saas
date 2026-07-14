# 🛡️ BOUCLIER SOC — Docker Deployment Guide
> Documentation complète pour le déploiement containerisé de la plateforme Bouclier SOC.

---

## 📋 Table des Matières

1. [Architecture des Services](#architecture)
2. [Prérequis](#prerequisites)
3. [Structure des Fichiers Docker](#structure)
4. [Configuration de l'Environnement (.env)](#env-config)
5. [Déploiement Standard (Dev)](#deploy-dev)
6. [Déploiement Production](#deploy-prod)
7. [Déploiement avec Traefik Gateway](#deploy-traefik)
8. [Commandes Utiles](#commands)
9. [Health Checks & Monitoring](#health)
10. [Troubleshooting](#troubleshooting)
11. [Données Persistantes (Volumes)](#volumes)

---

## 🏗️ Architecture des Services {#architecture}

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOUCLIER SOC PLATFORM                        │
├──────────────────┬──────────────────┬───────────────────────────┤
│   FRONTEND UI    │   BACKEND API    │     OFFENSIVE ENGINE      │
│  Next.js 22      │  FastAPI + AI    │    Kali Linux Base        │
│  Port: 3001      │  Port: 8005      │    Port: 8100             │
├──────────────────┼──────────────────┼───────────────────────────┤
│  REDHOUND PRO   │   VECTOR MEMORY  │    MYTHOS ENGINE          │
│  Active Defense  │  Qdrant DB       │    Neural Pentest         │
│  Port: 5000      │  Port: 6333      │    Port: 8101             │
├──────────────────┼──────────────────┼───────────────────────────┤
│   PostgreSQL     │     Redis        │    AI/LLM (Ollama)        │
│  Port: 5432      │  Port: 6379      │  Port: 11434 (HOST)       │
│  (internal)      │  (internal)      │  Runs on HOST machine     │
└──────────────────┴──────────────────┴───────────────────────────┘
```

### Mapping des Ports (Accès Externe)

| Service | Port Externe | Port Interne | Description |
|---------|-------------|--------------|-------------|
| **Frontend UI** | `3001` | `3000` | Dashboard Next.js (Production) |
| **Backend API** | `8005` | `8005` | FastAPI + ML Engine |
| **Tools API** | `8100` | `8100` | Kali Linux Offensive Engine |
| **RedHound Pro** | `5000` | `5000` | Active Defense & Exploit Intel |
| **Qdrant Vector DB** | `6333` | `6333` | Mémoire AI / RAG |
| **Redis** | `6379` | `6379` | Cache + Message Broker |
| **Ollama LLM** | `11434` | — | Tourne sur la machine HOST |

---

## ✅ Prérequis {#prerequisites}

### Logiciels Requis

| Outil | Version Min | Vérification |
|-------|-------------|--------------|
| **Docker Desktop** | 24.x+ | `docker --version` |
| **Docker Compose** | 2.x+ | `docker compose version` |
| **Git** | 2.x+ | `git --version` |
| **Ollama** *(optionnel)* | Latest | `ollama --version` |

### Ressources Matérielles Recommandées

| Ressource | Minimum | Recommandé |
|-----------|---------|-----------|
| **RAM** | 8 GB (Calibrated) | 16 GB |
| **CPU** | 4 cores | 8 cores |
| **Disque** | 20 GB libre | 50 GB libre |
| **OS** | Windows 10/11 (WSL2), Linux, macOS | — |

### Vérifier Docker avant de commencer

```powershell
# Vérifier que Docker tourne
docker info

# Vérifier Docker Compose
docker compose version
```

> [!IMPORTANT]
> Sur Windows, Docker Desktop doit être **démarré et en cours d'exécution** avant toute commande.

---

## 📁 Structure des Fichiers Docker {#structure}

```
cyberattack/
├── docker-compose.gateway.yml          ← Traefik Gateway (racine projet)
├── .env.gateway                        ← Config Traefik (TLS, Auth)
│
└── bouclier-saas/
    ├── docker-compose.yml              ← Compose DEV (simple, ports exposés)
    ├── docker-compose.prod.yml         ← Compose PRODUCTION (healthchecks, volumes)
    ├── docker-compose.traefik.yml      ← Override Traefik (routing HTTPS)
    ├── docker-compose.academy.yml      ← Mode académique (labs)
    │
    ├── .env.docker                     ← Template de configuration
    ├── .env                            ← Ton fichier de config (à créer)
    │
    ├── backend/
    │   └── Dockerfile                  ← Python 3.10-slim, FastAPI
    │
    ├── frontend/
    │   └── Dockerfile                  ← Node 22 Alpine, Multi-stage build
    │
    ├── tools-api/
    │   └── Dockerfile                  ← Kali Linux Rolling, outils offensifs
    │
    └── services/
        ├── redhound-pro/Dockerfile     ← RedHound Active Defense
        ├── wiretapper/Dockerfile       ← OSINT Signal Intelligence
        └── worldmonitor/Dockerfile     ← Monitoring Global
```

---

## ⚙️ Configuration de l'Environnement {#env-config}

### Étape 1 : Créer le fichier `.env`

```powershell
# Depuis le dossier bouclier-saas/
cd C:\Users\ASUS\Desktop\cyberattack\bouclier-saas
copy .env.docker .env
```

### Étape 2 : Éditer le fichier `.env`

Ouvre `.env` et configure ces valeurs :

```env
# ── PORTS ─────────────────────────────────────────────────────
FRONTEND_PORT=3001
BACKEND_PORT=8005
TOOLS_PORT=8100
REDHOUND_PORT=5000

# ── BASE DE DONNÉES ───────────────────────────────────────────
DB_USER=bouclier_user
DB_PASSWORD=bouclier_password_prod     # ← CHANGE EN PRODUCTION
DB_NAME=bouclier_data

# ── COMPTE ADMIN (créé automatiquement au démarrage) ──────────
ADMIN_USER=admin
ADMIN_PASS=bouclier2026!              # ← CHANGE EN PRODUCTION
ADMIN_EMAIL=admin@bouclier.local

# ── SÉCURITÉ ──────────────────────────────────────────────────
TOOLS_API_KEY=BOUCLIER_ALPHA_SESSION_2026   # ← CHANGE EN PRODUCTION
JWT_SECRET=change_me_to_a_random_long_secret_in_production
CORS_ORIGINS=http://localhost:3001,http://localhost:3002

# ── OUTILS OFFENSIFS ──────────────────────────────────────────
ALLOW_PUBLIC_TARGETS=1
SAFE_MODE=false

# ── AI / LLM (Ollama tourne sur le HOST) ──────────────────────
LLM_PROVIDER=ollama
LLM_BASE_URL=http://host.docker.internal:11434
LLM_MODEL=llama3.2:3b
```

> [!WARNING]
> Ne commite **jamais** le fichier `.env` dans Git. Il est déjà dans `.gitignore`.

---

## 🚀 Déploiement Standard — Mode Dev {#deploy-dev}

Utilise `docker-compose.yml` — simple, rapide, sans healthchecks complexes.

```powershell
cd C:\Users\ASUS\Desktop\cyberattack\bouclier-saas

# 1. Démarrer tous les services
docker compose up -d

# 2. Vérifier que tout tourne
docker compose ps

# 3. Voir les logs en temps réel
docker compose logs -f
```

### Accès après démarrage

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3002 |
| API Backend | http://localhost:8005 |
| API Docs (Swagger) | http://localhost:8005/docs |
| Tools Engine | http://localhost:8100 |
| Qdrant UI | http://localhost:6333/dashboard |

---

## 🏭 Déploiement Production {#deploy-prod}

Utilise `docker-compose.prod.yml` — avec healthchecks, volumes persistants, et config robuste.

### Méthode 1 : Script automatique (Recommandé)

```powershell
cd C:\Users\ASUS\Desktop\cyberattack\bouclier-saas

# Double-clic ou exécuter dans PowerShell :
.\START_DOCKER.bat
```

Le script fait automatiquement :
1. ✅ Vérifie que Docker tourne
2. ✅ Crée `.env` depuis `.env.docker` si absent
3. ✅ Pull les images de base (postgres, redis, qdrant)
4. ✅ Build et démarre tous les containers

### Méthode 2 : Commandes manuelles

```powershell
cd C:\Users\ASUS\Desktop\cyberattack\bouclier-saas

# Pull images de base
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull qdrant/qdrant:latest

# Build et démarrer (première fois : 5-15 min)
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Vérifier le statut
docker compose -f docker-compose.prod.yml ps
```

### Accès Production

| Service | URL | Notes |
|---------|-----|-------|
| **Dashboard** | http://localhost:3001 | Interface principale |
| **API Backend** | http://localhost:8005 | FastAPI REST |
| **Swagger Docs** | http://localhost:8005/docs | Documentation API interactive |
| **Tools Engine** | http://localhost:8100 | Kali Linux tools |
| **RedHound Pro** | http://localhost:5000 | Active defense |
| **Qdrant** | http://localhost:6333/dashboard | Vector DB UI |

---

## 🌐 Déploiement avec Traefik Gateway {#deploy-traefik}

Mode avancé : HTTPS automatique, routing intelligent, dashboard Traefik.

### Prérequis Traefik

```powershell
# 1. Créer le réseau Docker partagé (une seule fois)
docker network create proxy

# 2. Configurer le fichier gateway .env
cd C:\Users\ASUS\Desktop\cyberattack
copy .env.gateway.example .env.gateway
# Éditer .env.gateway avec tes valeurs
```

### Démarrer Traefik Gateway

```powershell
cd C:\Users\ASUS\Desktop\cyberattack

docker compose -f docker-compose.gateway.yml --env-file .env.gateway up -d
```

### Démarrer Bouclier avec Traefik Override

```powershell
cd C:\Users\ASUS\Desktop\cyberattack\bouclier-saas

docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.traefik.yml \
  --env-file .env \
  up -d --build
```

### Accès avec Traefik

| Service | URL (HTTPS) |
|---------|------------|
| **Dashboard Bouclier** | https://localhost |
| **API Backend** | https://localhost/api |
| **Tools Engine** | https://localhost/tools |
| **Traefik Dashboard** | https://localhost:8080 (admin/admin) |
| **World Monitor** | https://monitor.localhost |

> [!NOTE]
> Le certificat TLS est auto-signé en développement. Le navigateur affichera un avertissement — clique sur "Avancer quand même".

---

## 🔧 Commandes Utiles {#commands}

### Gestion des Containers

```powershell
# Voir tous les containers en cours
docker compose -f docker-compose.prod.yml ps

# Démarrer les services
docker compose -f docker-compose.prod.yml up -d

# Arrêter les services (sans supprimer les données)
docker compose -f docker-compose.prod.yml down

# Arrêter ET supprimer les volumes (⚠️ perte de données)
docker compose -f docker-compose.prod.yml down -v

# Redémarrer un service spécifique
docker compose -f docker-compose.prod.yml restart backend

# Rebuilder un service après modification du code
docker compose -f docker-compose.prod.yml up -d --build backend
```

### Voir les Logs

```powershell
# Logs de tous les services (live)
docker compose -f docker-compose.prod.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f tools-api

# Dernières 100 lignes
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Accéder à un Container (Shell)

```powershell
# Ouvrir un shell dans le backend
docker exec -it bouclier-backend bash

# Ouvrir un shell dans le tools-api (Kali Linux)
docker exec -it bouclier-tools-api bash

# Ouvrir psql dans la base de données
docker exec -it bouclier-db psql -U bouclier_user -d bouclier_data
```

### Nettoyage Docker

```powershell
# Supprimer les images non utilisées
docker image prune -f

# Supprimer les volumes orphelins
docker volume prune -f

# Nettoyage complet (DANGER : supprime tout ce qui est inutilisé)
docker system prune -af --volumes
```

---

## 🩺 Health Checks & Monitoring {#health}

### Vérifier la Santé des Services

```powershell
# Status de tous les containers
docker compose -f docker-compose.prod.yml ps

# Health check Backend
curl http://localhost:8005/api/health

# Health check Tools API
curl http://localhost:8100/health

# Health check Redis
docker exec bouclier-redis redis-cli ping
# Réponse attendue : PONG

# Health check PostgreSQL
docker exec bouclier-db pg_isready -U bouclier_user
```

### Endpoints de Santé dans le Navigateur

- **API Health** → http://localhost:8005/api/health *(doit retourner `{"status":"healthy"}`)* 
- **API Docs** → http://localhost:8005/docs
- **Tools Health** → http://localhost:8100/health
- **Qdrant** → http://localhost:6333/dashboard

### Surveiller les Ressources

```powershell
# Stats en temps réel (CPU, RAM, Network)
docker stats

# Vérifier le respect des limites (Isolated Core)
docker stats --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}"
```

---

## 🔴 Troubleshooting {#troubleshooting}

### ❌ Problème : "Port is already in use"

```powershell
# Trouver quel processus utilise le port (ex: 8005)
netstat -ano | findstr :8005

# Tuer le processus par son PID
taskkill /F /PID <PID>

# Ou stopper tous les containers Docker
docker compose -f docker-compose.prod.yml down
```

### ❌ Problème : Backend ne démarre pas (DB connection refused)

```powershell
# Vérifier que PostgreSQL est healthy
docker compose -f docker-compose.prod.yml ps db

# Voir les logs de la DB
docker compose -f docker-compose.prod.yml logs db

# Attendre que la DB soit prête (le backend a un depends_on avec healthcheck)
# Si ça persiste, redémarrer dans l'ordre :
docker compose -f docker-compose.prod.yml up -d db redis
# Attendre 10 secondes
Start-Sleep -Seconds 10
docker compose -f docker-compose.prod.yml up -d backend
```

### ❌ Problème : Frontend Build échoue

```powershell
# Voir les logs de build
docker compose -f docker-compose.prod.yml logs frontend

# Rebuilder seulement le frontend
docker compose -f docker-compose.prod.yml up -d --build frontend

# Vérifier les erreurs Prisma
docker exec -it bouclier-frontend npx prisma generate
```

### ❌ Problème : Tools-API (Kali) ne démarre pas

```powershell
# Voir les logs détaillés
docker compose -f docker-compose.prod.yml logs tools-api

# Le build Kali Linux prend du temps (10-20 min la 1ère fois)
# Vérifier si Nuclei a bien été téléchargé
docker exec -it bouclier-tools-api nuclei --version
```

### ❌ Problème : Sentinel AI ne répond pas

```powershell
# Vérifier qu'Ollama tourne sur le HOST
curl http://localhost:11434/api/tags

# Télécharger le modèle si absent
ollama pull llama3.2:3b

# Le backend utilise host.docker.internal pour accéder à Ollama
# Vérifier la variable LLM_BASE_URL dans .env
```

### ❌ Problème : Erreur "network proxy not found" (mode Traefik)

```powershell
# Créer le réseau Traefik proxy
docker network create proxy

# Vérifier que le réseau existe
docker network ls | findstr proxy
```

### ❌ Problème : Données perdues après `docker compose down`

> [!CAUTION]
> `docker compose down` sans `-v` **ne supprime pas** les volumes. Les données sont persistées.
> `docker compose down -v` **supprime tout**. Ne l'utilise qu'intentionnellement.

---

## 💾 Données Persistantes (Volumes) {#volumes}

Les données importantes sont stockées dans des volumes Docker nommés :

| Volume | Contenu | Container |
|--------|---------|-----------|
| `bouclier_postgres_data` | Base de données complète | `bouclier-db` |
| `bouclier_redis_data` | Cache et sessions | `bouclier-redis` |
| `bouclier_qdrant_data` | Mémoire vectorielle AI | `bouclier-qdrant` |
| `bouclier_logs` | Logs applicatifs | `bouclier-backend` |
| `bouclier_ai_models` | Modèles ML entraînés | `bouclier-backend` |

### Lister les volumes

```powershell
docker volume ls | findstr bouclier
```

### Backup de la Base de Données

```powershell
# Exporter la DB
docker exec bouclier-db pg_dump -U bouclier_user bouclier_data > backup_$(Get-Date -Format 'yyyyMMdd').sql

# Restaurer depuis un backup
Get-Content backup.sql | docker exec -i bouclier-db psql -U bouclier_user -d bouclier_data
```

---

## 🔑 Informations de Connexion par Défaut

> [!CAUTION]
> Change **obligatoirement** ces credentials en production !

| Service | Utilisateur | Mot de passe |
|---------|------------|--------------|
| **Dashboard Web** | `admin` | `bouclier2026!` |
| **PostgreSQL** | `bouclier_user` | `bouclier_password_prod` |
| **Traefik Dashboard** | `admin` | `admin` |
| **Grafana** | `admin` | `admin` |

---

## 📊 Récapitulatif des Fichiers Compose

| Fichier | Usage | Commande |
|---------|-------|---------|
| `docker-compose.yml` | Développement local rapide | `docker compose up -d` |
| `docker-compose.prod.yml` | Production (recommandé) | `docker compose -f docker-compose.prod.yml up -d --build` |
| `docker-compose.traefik.yml` | Override Traefik HTTPS | Combiné avec prod.yml |
| `docker-compose.gateway.yml` | Gateway Traefik (racine) | Démarré séparément |
| `docker-compose.academy.yml` | Mode académique / labs | `docker compose -f docker-compose.academy.yml up -d` |

---

*Documentation générée le 28 Avril 2026 — Bouclier SOC Platform*  
*Projet original par **Zouhair Elomari** 🇲🇦*
