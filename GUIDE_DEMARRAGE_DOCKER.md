# 🐳 GUIDE DE DÉMARRAGE DOCKER - BOUCLIER SAAS

## 📋 PROBLÈME ACTUEL

**Statut**: ❌ Aucun container Docker n'est démarré

```bash
docker ps -a
# Résultat: CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (vide)
```

---

## 🚀 SOLUTION: DÉMARRER TOUS LES SERVICES

### Étape 1: Vérifier les prérequis

```bash
# Vérifier que Docker est installé
docker --version
# Résultat attendu: Docker version 20.x.x ou supérieur

# Vérifier que Docker Compose est installé
docker-compose --version
# Résultat attendu: docker-compose version 1.29.x ou supérieur

# Vérifier que Docker Desktop est démarré (Windows)
# Ouvrir Docker Desktop et attendre qu'il soit "Running"
```

### Étape 2: Naviguer vers le dossier du projet

```bash
cd C:\Users\ASUS\Desktop\cyberattack\bouclier-saas
```

### Étape 3: Créer les fichiers .env nécessaires

```bash
# Copier les fichiers d'exemple
copy .env.example .env
copy .env.app.example .env.app
copy .env.ai.example .env.ai
copy .env.core.example .env.core
```

**OU créer manuellement le fichier `.env` principal**:

```bash
# Créer .env avec le contenu suivant
echo DB_HOST=db > .env
echo DB_PORT=5432 >> .env
echo DB_USER=bouclier_user >> .env
echo DB_PASSWORD=bouclier_password_prod >> .env
echo DB_NAME=bouclier_data >> .env
echo REDIS_HOST=redis >> .env
echo REDIS_PORT=6379 >> .env
echo LLM_BASE_URL=http://ai-gateway:8200 >> .env
echo LLM_MODEL=llama3.2:3b >> .env
echo TOOLS_API_SECRET=BOUCLIER_ALPHA_SESSION_2026 >> .env
```

### Étape 4: Construire les images Docker

```bash
# Construire toutes les images (première fois uniquement)
docker-compose build

# OU construire sans cache (si problèmes)
docker-compose build --no-cache
```

**Temps estimé**: 10-20 minutes (première fois)

### Étape 5: Démarrer tous les services

```bash
# Démarrer tous les containers en arrière-plan
docker-compose up -d

# OU démarrer avec logs visibles (pour debug)
docker-compose up
```

**Services qui vont démarrer**:
- ✅ **gateway** (Nginx) - Port 80
- ✅ **frontend** (Next.js) - Port 3001
- ✅ **backend** (FastAPI) - Port 8005
- ✅ **db** (PostgreSQL) - Port 5432
- ✅ **redis** (Redis) - Port 6379
- ✅ **ai-gateway** (Ollama) - Port 8200
- ✅ **tools-api** (Offensive Tools) - Port 8100
- ✅ **kali-scanner** (Kali Linux)
- ✅ **qdrant** (Vector DB) - Port 6333

### Étape 6: Vérifier que les containers sont démarrés

```bash
# Voir tous les containers en cours d'exécution
docker ps

# Résultat attendu:
# CONTAINER ID   IMAGE                    STATUS         PORTS                    NAMES
# xxxxxxxxxxxx   bouclier-frontend        Up 2 minutes   0.0.0.0:3001->3000/tcp   shield-frontend-ui
# xxxxxxxxxxxx   bouclier-backend         Up 2 minutes   0.0.0.0:8005->8000/tcp   shield-backend-api
# xxxxxxxxxxxx   postgres:15              Up 2 minutes   0.0.0.0:5432->5432/tcp   shield-postgres-db
# xxxxxxxxxxxx   redis:7-alpine           Up 2 minutes   0.0.0.0:6379->6379/tcp   shield-redis-cache
# xxxxxxxxxxxx   ollama/ollama:latest     Up 2 minutes   0.0.0.0:8200->11434/tcp  shield-ai-gateway
# ...
```

### Étape 7: Vérifier les logs

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-gateway

# Voir les dernières 100 lignes
docker-compose logs --tail=100 backend
```

### Étape 8: Tester l'accès aux services

```bash
# Tester le frontend
curl http://localhost:3001

# Tester le backend
curl http://localhost:8005/api/saas/control/health

# Tester l'API docs
# Ouvrir dans le navigateur: http://localhost:8005/docs
```

---

## 🔧 COMMANDES DOCKER UTILES

### Gestion des containers

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart backend

# Arrêter et supprimer tout (y compris volumes)
docker-compose down -v

# Voir le statut de tous les services
docker-compose ps
```

### Logs et debugging

```bash
# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker logs shield-backend-api -f

# Dernières 50 lignes
docker logs shield-backend-api --tail=50

# Logs avec timestamps
docker logs shield-backend-api -f --timestamps
```

### Accès aux containers

```bash
# Entrer dans un container (bash)
docker exec -it shield-backend-api bash

# Entrer dans le container PostgreSQL
docker exec -it shield-postgres-db psql -U bouclier_user -d bouclier_data

# Entrer dans le container Redis
docker exec -it shield-redis-cache redis-cli

# Exécuter une commande dans un container
docker exec shield-backend-api python -c "print('Hello')"
```

### Nettoyage

```bash
# Supprimer les containers arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune

# Supprimer les volumes non utilisés
docker volume prune

# Nettoyage complet (ATTENTION: supprime tout)
docker system prune -a --volumes
```

---

## 🐛 RÉSOLUTION DES PROBLÈMES

### Problème 1: "Cannot connect to Docker daemon"

**Solution**:
```bash
# Windows: Démarrer Docker Desktop
# Ouvrir Docker Desktop et attendre qu'il soit "Running"

# Vérifier que Docker est démarré
docker info
```

### Problème 2: "Port already in use"

**Solution**:
```bash
# Trouver quel processus utilise le port
netstat -ano | findstr :3001
netstat -ano | findstr :8005

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F

# OU changer le port dans docker-compose.yml
# Exemple: "3002:3000" au lieu de "3001:3000"
```

### Problème 3: "Build failed" ou "Image not found"

**Solution**:
```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Supprimer les anciennes images
docker image prune -a

# Reconstruire un service spécifique
docker-compose build backend
```

### Problème 4: "Database connection failed"

**Solution**:
```bash
# Vérifier que PostgreSQL est démarré
docker ps | findstr postgres

# Vérifier les logs de la base de données
docker logs shield-postgres-db

# Recréer la base de données
docker-compose down -v
docker-compose up -d db
# Attendre 10 secondes
docker-compose up -d
```

### Problème 5: "Out of memory" ou "Container keeps restarting"

**Solution**:
```bash
# Augmenter la mémoire allouée à Docker Desktop
# Docker Desktop > Settings > Resources > Memory: 8GB minimum

# Vérifier les ressources utilisées
docker stats

# Redémarrer Docker Desktop
```

### Problème 6: "Network error" ou "Cannot reach service"

**Solution**:
```bash
# Recréer les réseaux Docker
docker-compose down
docker network prune
docker-compose up -d

# Vérifier les réseaux
docker network ls
```

---

## 📊 VÉRIFICATION POST-DÉMARRAGE

### Checklist de vérification

```bash
# 1. Tous les containers sont UP
docker ps
# ✅ Vérifier que STATUS = "Up X minutes" pour tous

# 2. Frontend accessible
curl http://localhost:3001
# ✅ Devrait retourner du HTML

# 3. Backend accessible
curl http://localhost:8005/api/saas/control/health
# ✅ Devrait retourner JSON avec status: "success"

# 4. Base de données accessible
docker exec shield-postgres-db psql -U bouclier_user -d bouclier_data -c "SELECT 1;"
# ✅ Devrait retourner "1"

# 5. Redis accessible
docker exec shield-redis-cache redis-cli PING
# ✅ Devrait retourner "PONG"

# 6. AI Gateway accessible
curl http://localhost:8200/health
# ✅ Devrait retourner status OK

# 7. Tools API accessible
curl http://localhost:8100/health
# ✅ Devrait retourner status OK
```

### Script de vérification automatique

```bash
# Créer un fichier check_services.bat
@echo off
echo Verification des services BOUCLIER...
echo.

echo [1/7] Verification des containers...
docker ps
echo.

echo [2/7] Test Frontend...
curl -s http://localhost:3001 > nul && echo OK || echo FAIL
echo.

echo [3/7] Test Backend...
curl -s http://localhost:8005/api/saas/control/health
echo.

echo [4/7] Test Database...
docker exec shield-postgres-db psql -U bouclier_user -d bouclier_data -c "SELECT 1;"
echo.

echo [5/7] Test Redis...
docker exec shield-redis-cache redis-cli PING
echo.

echo [6/7] Test AI Gateway...
curl -s http://localhost:8200/health
echo.

echo [7/7] Test Tools API...
curl -s http://localhost:8100/health
echo.

echo Verification terminee!
pause
```

---

## 🌐 ACCÈS AUX SERVICES

Une fois tous les containers démarrés:

### Interfaces Web

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | Interface principale BOUCLIER |
| **Backend API Docs** | http://localhost:8005/docs | Documentation API interactive |
| **Qdrant Dashboard** | http://localhost:6333/dashboard | Vector database UI |
| **Gateway** | http://localhost | Reverse proxy (redirige vers frontend) |

### APIs

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://localhost:8005/api | API principale |
| **Tools API** | http://localhost:8100 | API outils offensifs |
| **AI Gateway** | http://localhost:8200 | Ollama LLM |

### Bases de données

| Service | Connection String | Description |
|---------|-------------------|-------------|
| **PostgreSQL** | `postgresql://bouclier_user:bouclier_password_prod@localhost:5432/bouclier_data` | Base de données principale |
| **Redis** | `redis://localhost:6379/0` | Cache et streaming |
| **Qdrant** | `http://localhost:6333` | Vector database |

---

## 📝 COMMANDES RAPIDES

```bash
# Démarrage rapide
cd C:\Users\ASUS\Desktop\cyberattack\bouclier-saas
docker-compose up -d

# Vérification rapide
docker ps
curl http://localhost:3001
curl http://localhost:8005/api/saas/control/health

# Arrêt rapide
docker-compose down

# Redémarrage rapide
docker-compose restart

# Logs rapides
docker-compose logs -f --tail=50

# Nettoyage rapide
docker-compose down -v
docker system prune -f
```

---

## 🎯 PROCHAINES ÉTAPES

Après avoir démarré les services:

1. **Ouvrir le dashboard**:
   ```
   http://localhost:3001
   ```

2. **Vérifier le statut des services**:
   ```
   http://localhost:3001/saas-control
   ```

3. **Démarrer le stream CICIDS** (pour avoir des données):
   ```bash
   python start_cicids_stream.py
   ```

4. **Tester Mythos**:
   ```
   http://localhost:3001/mythos-intelligence
   Target: scanme.nmap.org
   Deploy
   ```

5. **Générer un rapport SOC**:
   ```
   http://localhost:3001/reports
   Export PDF
   ```

---

## 📞 SUPPORT

Si les containers ne démarrent toujours pas:

1. **Vérifier les logs d'erreur**:
   ```bash
   docker-compose logs
   ```

2. **Vérifier l'espace disque**:
   ```bash
   docker system df
   ```

3. **Vérifier la configuration Docker Desktop**:
   - Mémoire: 8GB minimum
   - CPU: 4 cores minimum
   - Disk: 50GB minimum

4. **Redémarrer Docker Desktop**:
   - Fermer Docker Desktop
   - Attendre 10 secondes
   - Rouvrir Docker Desktop
   - Attendre que le statut soit "Running"
   - Relancer `docker-compose up -d`

---

**BOUCLIER | Advanced Cyber Defense Platform**
*Guide de Démarrage Docker - Version 2.0*
*Date: 20 Mai 2026*
