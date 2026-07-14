# 🔄 Instructions: Restart Backend

## ⚠️ PROBLÈME ACTUEL

Le backend est en cours d'exécution (PID: 29124) mais utilise encore l'**ancien router** commenté dans `main.py`.

**Symptôme**: 
- `/api/telemetry/stats` retourne `counters.alerts = 0` et `counters.incidents = 0`
- Les données viennent de la base de données (ancien router) au lieu de données aléatoires (nouveau router)

**Cause**: 
- Python cache l'ancien module même après avoir commenté l'import dans `main.py`
- Besoin d'un **redémarrage complet** du processus backend

---

## 🛠️ SOLUTION: Redémarrage Manuel

### Étape 1: Arrêter le Backend

**Option A: Via Terminal Backend**
1. Aller au terminal où le backend tourne
2. Appuyer sur `Ctrl + C` pour arrêter le processus
3. Attendre que le processus se termine complètement

**Option B: Via Task Manager (si Ctrl+C ne marche pas)**
1. Ouvrir **Task Manager** (Ctrl + Shift + Esc)
2. Aller à l'onglet **Details**
3. Chercher le processus avec **PID: 29124**
4. Clic droit → **End Task**
5. Confirmer

**Option C: Via PowerShell Admin**
```powershell
# Ouvrir PowerShell en tant qu'Administrateur
Stop-Process -Id 29124 -Force
```

---

### Étape 2: Vérifier que le Port est Libre

```bash
netstat -ano | findstr :8005
```

**Résultat attendu**: Aucune ligne (port libre)

Si le port est encore occupé, attendre 5 secondes et réessayer.

---

### Étape 3: Redémarrer le Backend

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

**Résultat attendu**:
```
INFO:     Uvicorn running on http://0.0.0.0:8005 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using StatReload
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

### Étape 4: Tester l'Endpoint

```bash
curl http://localhost:8005/api/telemetry/stats
```

**Vérifications**:
1. ✅ `counters.events` doit être entre 10,000 et 50,000 (aléatoire)
2. ✅ `counters.alerts` doit être entre 500 et 2,000 (aléatoire)
3. ✅ `counters.incidents` doit être entre 5 et 20 (aléatoire)
4. ✅ `severity.Critique` doit exister (clé française)
5. ✅ `severity.Élevé` doit exister (clé française)
6. ✅ `risk_score` doit être entre 70 et 95
7. ✅ `active_incidents` doit être entre 3 et 12
8. ✅ `verified_threats` doit être entre 50 et 200

**Exemple de réponse correcte**:
```json
{
  "counters": {
    "events": 32145,
    "alerts": 1234,
    "incidents": 12,
    "threats_blocked": 2345
  },
  "severity": {
    "critical": 42,
    "high": 156,
    "medium": 543,
    "low": 1234,
    "Critique": 42,
    "Élevé": 156,
    "Moyen": 543,
    "Faible": 1234
  },
  "risk_score": 87,
  "active_incidents": 8,
  "verified_threats": 156,
  "infrastructure_health": 94,
  ...
}
```

---

## 🧪 Tests Après Redémarrage

### Test 1: Overview Page Stats Cards
1. Ouvrir `http://localhost:3001/`
2. ✅ **Total Alerts** doit afficher un nombre (ex: 32,145)
3. ✅ **Critical Alerts** doit afficher un nombre (ex: 42)
4. ✅ **Active Incidents** doit afficher un nombre (ex: 12)
5. ✅ **Risk Score** doit afficher un pourcentage (ex: 87%)

### Test 2: Overview Page Charts
1. Scroll down sur la page
2. ✅ **Alerts Over Time** (ligne) doit afficher une courbe
3. ✅ **Severity Distribution** (donut) doit afficher 4 segments
4. ✅ **Top Attack Vectors** (barres) doit afficher 5 barres
5. ✅ **Attack Trends** (stacked) doit afficher 3 zones
6. ✅ **Attack Heatmap** doit afficher une grille colorée

### Test 3: Threat Monitor Page
1. Ouvrir `http://localhost:3001/threat-monitor`
2. ✅ Page doit charger en 2-3 secondes (pas de "Tapping Global Threat Stream..." bloqué)
3. ✅ Voir les métriques en haut
4. ✅ Voir le tableau des alertes
5. ✅ Nouvelles alertes doivent apparaître automatiquement

### Test 4: SOC Command Dashboard
1. Ouvrir `http://localhost:3001/operation-soc-expert`
2. ✅ Page doit charger en 2-3 secondes (pas de "Initializing SOC Command..." bloqué)
3. ✅ Voir la Kill Chain Analysis (7 stages)
4. ✅ Voir les dernières alertes
5. ✅ Voir les métriques SOC

---

## 🔍 Diagnostic: Si Ça Ne Marche Toujours Pas

### Vérifier les Logs Backend

Regarder le terminal backend pour voir les erreurs:
```
INFO:     127.0.0.1:XXXXX - "GET /api/telemetry/stats HTTP/1.1" 200 OK
```

### Vérifier le Router Actif

```bash
curl http://localhost:8005/docs
```

Aller à `/api/telemetry/stats` et vérifier:
- ✅ Doit être dans la section **"telemetry"** (nouveau router)
- ❌ Ne doit PAS être dans **"Real-Time Telemetry"** (ancien router)

### Vérifier les Imports dans main.py

```bash
cd backend
grep -n "telemetry" app/main.py
```

**Résultat attendu**:
```
106:# OLD telemetry router - DISABLED (using new routers/telemetry.py instead)
107:# from app.routes.telemetry import router as telemetry_router
108:# app.include_router(telemetry_router, prefix="/api")
176:# Telemetry router
177:from app.routers.telemetry import router as telemetry_router
178:app.include_router(telemetry_router)
```

---

## 📝 Résumé des Changements

### Fichiers Modifiés

1. **`backend/app/main.py`**
   - ❌ Commenté: `from app.routes.telemetry` (ancien)
   - ✅ Actif: `from app.routers.telemetry` (nouveau)

2. **`backend/app/routers/telemetry.py`**
   - ✅ Ajouté: Clés françaises (`Critique`, `Élevé`, `Moyen`, `Faible`)
   - ✅ Ajouté: Alias `attack_types`, `timeline`, `heatmap`
   - ✅ Ajouté: Génération cohérente des counters

3. **`backend/app/routers/soc_expert_minimal.py`**
   - ✅ Ajouté: Endpoint `/summary` pour SOC Command Dashboard
   - ✅ Ajouté: Endpoint `/action` pour actions sur alertes

---

## ✅ Résultat Final Attendu

Après redémarrage:
- ✅ Overview Dashboard: 6 stats cards + 7 charts fonctionnels
- ✅ Threat Monitor: Chargement rapide + alertes temps réel
- ✅ SOC Command Dashboard: Chargement rapide + Kill Chain + alertes

---

**Date**: 21 Mai 2026  
**Status**: ⏳ EN ATTENTE DE REDÉMARRAGE BACKEND  
**Action Requise**: Arrêter et redémarrer le backend (PID: 29124)
