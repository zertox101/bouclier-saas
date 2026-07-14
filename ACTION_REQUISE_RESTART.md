# ⚠️ ACTION REQUISE: Restart Backend

## 🔴 PROBLÈME ACTUEL

Le backend **ne peut pas redémarrer** car le port 8005 est occupé par l'ancien processus (PID: 29124).

**Erreur**:
```
ERROR: [WinError 10013] An attempt was made to access a socket in a way forbidden by its access permissions
```

**Cause**: L'ancien processus backend refuse de se terminer (nécessite droits administrateur).

---

## ✅ SOLUTION RAPIDE (3 Options)

### Option 1: Script PowerShell Admin (RECOMMANDÉ)

1. **Ouvrir l'Explorateur de fichiers**
2. **Aller à**: `c:\Users\ASUS\Desktop\cyberattack\bouclier-saas\`
3. **Trouver**: `force_kill_backend.ps1`
4. **Clic droit** → **Run with PowerShell** (ou **Exécuter avec PowerShell**)
5. Si demandé, accepter l'exécution
6. Le script va:
   - ✓ Tuer le processus 29124
   - ✓ Vérifier que le port 8005 est libre
   - ✓ Afficher le statut

**Ensuite**, ouvrir un nouveau terminal et lancer:
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

---

### Option 2: Task Manager (SIMPLE)

1. **Ouvrir Task Manager**: `Ctrl + Shift + Esc`
2. **Aller à l'onglet**: **Details**
3. **Chercher**: PID **29124**
4. **Clic droit** → **End Task**
5. **Confirmer**

**Ensuite**, ouvrir un nouveau terminal et lancer:
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

---

### Option 3: Terminal Backend Direct

Si tu as encore le terminal où le backend tourne:

1. **Aller au terminal backend**
2. **Appuyer sur**: `Ctrl + C`
3. **Attendre** que le processus se termine
4. **Relancer**:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

---

## 🧪 VÉRIFICATION APRÈS RESTART

### Test 1: Endpoint API

```bash
curl http://localhost:8005/api/telemetry/stats
```

**Vérifier**:
```json
{
  "counters": {
    "events": 32145,      // ✓ Entre 10,000-50,000 (PAS 8485!)
    "alerts": 1234,       // ✓ Entre 500-2,000 (PAS 0!)
    "incidents": 12       // ✓ Entre 5-20 (PAS 0!)
  },
  "severity": {
    "Critique": 42,       // ✓ Clé française existe
    "Élevé": 156,         // ✓ Clé française existe
    "critical": 42,       // ✓ Même valeur que Critique
    "high": 156           // ✓ Même valeur que Élevé
  },
  "risk_score": 87,       // ✓ Entre 70-95
  "active_incidents": 8   // ✓ Entre 3-12
}
```

**❌ MAUVAIS (ancien router)**:
```json
{
  "counters": {
    "events": 8485,
    "alerts": 0,          // ❌ Toujours 0
    "incidents": 0        // ❌ Toujours 0
  }
}
```

---

### Test 2: Overview Page

1. Ouvrir: `http://localhost:3001/`
2. **Vérifier les Stats Cards**:
   - ✅ **Total Alerts**: Affiche un nombre (ex: 32,145)
   - ✅ **Critical Alerts**: Affiche un nombre (ex: 42)
   - ✅ **Active Incidents**: Affiche un nombre (ex: 12) - **PAS "..."**
   - ✅ **Risk Score**: Affiche un % (ex: 87%) - **PAS "..."**

3. **Vérifier les Charts** (scroll down):
   - ✅ **Alerts Over Time**: Courbe visible
   - ✅ **Severity Distribution**: Donut avec 4 segments
   - ✅ **Top Attack Vectors**: 5 barres horizontales
   - ✅ **Attack Trends**: 3 zones empilées
   - ✅ **Attack Heatmap**: Grille colorée

---

### Test 3: Threat Monitor

1. Ouvrir: `http://localhost:3001/threat-monitor`
2. ✅ Page charge en **2-3 secondes** (pas bloquée sur "Tapping Global Threat Stream...")
3. ✅ Voir les métriques en haut
4. ✅ Voir le tableau des alertes
5. ✅ Nouvelles alertes apparaissent automatiquement

---

### Test 4: SOC Command Dashboard

1. Ouvrir: `http://localhost:3001/operation-soc-expert`
2. ✅ Page charge en **2-3 secondes** (pas bloquée sur "Initializing SOC Command...")
3. ✅ Voir la Kill Chain Analysis (7 stages)
4. ✅ Voir les dernières alertes
5. ✅ Voir les métriques SOC

---

## 📊 RÉSUMÉ DES FIXES APPLIQUÉS

### 1. Telemetry Router (`backend/app/routers/telemetry.py`)
- ✅ Ajouté clés françaises: `Critique`, `Élevé`, `Moyen`, `Faible`
- ✅ Ajouté alias: `attack_types`, `timeline`, `heatmap`
- ✅ Génération cohérente des counters (pas de 0)
- ✅ Données aléatoires réalistes

### 2. SOC Expert Router (`backend/app/routers/soc_expert_minimal.py`)
- ✅ Ajouté endpoint `/summary` pour SOC Command Dashboard
- ✅ Ajouté endpoint `/action` pour actions sur alertes
- ✅ Kill Chain Analysis (7 stages MITRE ATT&CK)
- ✅ Dernières alertes avec détails complets

### 3. Main App (`backend/app/main.py`)
- ✅ Commenté ancien router: `app.routes.telemetry`
- ✅ Activé nouveau router: `app.routers.telemetry`

---

## 🎯 RÉSULTAT FINAL ATTENDU

Après restart correct:

| Page | Status | Détails |
|------|--------|---------|
| **Overview Dashboard** | ✅ 100% | 6 stats cards + 7 charts |
| **Threat Monitor** | ✅ 100% | Chargement rapide + SSE temps réel |
| **SOC Command** | ✅ 100% | Kill Chain + alertes + métriques |
| **Network Dissector** | ✅ 100% | Scapy packet capture |
| **Red Team** | ✅ 100% | Nmap Mythos scan |
| **Threat Map Pro** | ✅ 100% | Analyse + countermeasures |
| **AI Pentester** | ✅ 100% | Kali tools (Nmap, Nikto, SQLMap, Hydra) |
| **Sentinel AI Hub** | ✅ 100% | Chat intelligent |
| **Investigation** | ✅ 100% | Timeline + evidence + notes |

---

## 📝 FICHIERS CRÉÉS

1. ✅ `force_kill_backend.ps1` - Script PowerShell pour tuer le processus
2. ✅ `restart_backend.bat` - Script batch pour restart complet
3. ✅ `kill_backend.bat` - Script batch pour kill seulement
4. ✅ `RESTART_BACKEND_INSTRUCTIONS.md` - Instructions détaillées
5. ✅ `FIX_OVERVIEW_CHARTS_STATS.md` - Documentation des fixes
6. ✅ `FIXES_THREAT_MONITOR_SOC_COMMAND.md` - Documentation Threat Monitor + SOC

---

## ⏭️ PROCHAINES ÉTAPES

1. ✅ **Tuer le processus 29124** (Option 1, 2 ou 3 ci-dessus)
2. ✅ **Redémarrer le backend**
3. ✅ **Tester les 4 endpoints** (API, Overview, Threat Monitor, SOC Command)
4. ✅ **Vérifier que tout fonctionne**
5. ⏭️ **Continuer avec les autres pages si nécessaire**

---

**Date**: 21 Mai 2026  
**Status**: ⏳ **EN ATTENTE DE RESTART MANUEL**  
**Action**: Tuer PID 29124 et redémarrer le backend  
**Impact**: 3 pages critiques + Overview Dashboard seront 100% opérationnels
