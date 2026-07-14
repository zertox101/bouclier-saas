# 🔧 Pages Restantes à Fixer - Bouclier SaaS

**Date:** 2026-05-20
**Statut:** En cours

---

## 📊 Résumé Exécutif

**Pages déjà corrigées:** ✅ 2/65
- ✅ Network Dissector - Capture réseau fonctionnelle
- ✅ Red Team Ops - Initialisation et scan Mythos

**Pages restantes à corriger:** 🔴 5 prioritaires

---

## 🎯 Pages Prioritaires à Corriger

### 1. 🗺️ Threat Map Pro (`/threat-map-pro`)

**Problème:** Pas d'analyse détaillée affichée quand on clique sur un événement

**État actuel:**
- ✅ Carte mondiale fonctionne
- ✅ Événements affichés en temps réel
- ✅ Sidebar avec liste des interceptions
- ❌ **Pas de panneau d'analyse détaillée**
- ❌ Bouton "DEPLOY_COUNTER_MEASURES" ne fait rien

**Ce qui manque:**
```typescript
// Quand on clique sur un événement, il faut afficher:
1. Panneau de détails complet (IP, pays, organisation, timestamp)
2. Analyse de la menace (type d'attaque, vecteur, CVE)
3. Recommandations de contre-mesures
4. Timeline de l'attaque
5. Graphe de corrélation avec autres événements
```

**Solution:**
- Créer un panneau latéral droit qui s'affiche quand `selectedEvent` existe
- Appeler l'API backend pour obtenir l'analyse complète
- Afficher les détails forensiques
- Implémenter le bouton "DEPLOY_COUNTER_MEASURES" pour bloquer l'IP

**Backend nécessaire:**
```python
# Endpoint à créer
GET /api/threat-analysis/{event_id}
POST /api/countermeasures/deploy
```

**Priorité:** 🔴 HAUTE (page critique pour SOC)

---

### 2. 🤖 AI Pentester (`/ai-pentester`)

**Problème:** Intégration Kali Arsenal incomplète

**État actuel:**
- 🟡 Page existe
- 🟡 Interface utilisateur présente
- ❌ Pas d'intégration réelle avec Kali Linux
- ❌ Outils ne s'exécutent pas vraiment

**Ce qui manque:**
```python
# Outils Kali à intégrer:
1. Nmap - Scan de ports
2. Nikto - Scan web
3. SQLMap - Injection SQL
4. Metasploit - Exploitation
5. Burp Suite - Proxy web
6. Hydra - Brute force
```

**Solution:**
- Créer router backend `/api/kali/tools`
- Implémenter exécution des outils via subprocess
- Parser les résultats et les retourner en JSON
- Ajouter logs en temps réel

**Backend nécessaire:**
```python
# backend/app/routers/kali_arsenal.py
POST /api/kali/nmap
POST /api/kali/nikto
POST /api/kali/sqlmap
POST /api/kali/metasploit
GET  /api/kali/tools/status
```

**Priorité:** 🟡 MOYENNE

---

### 3. 🧠 Sentinel AI Hub (`/sentinel`)

**Problème:** Intégration LLM manquante

**État actuel:**
- 🟡 Page existe
- 🟡 Interface chat présente
- ❌ Pas de connexion à un LLM
- ❌ Réponses vides ou simulées

**Ce qui manque:**
```python
# Intégration LLM nécessaire:
1. OpenAI GPT-4 ou Claude
2. Contexte SOC (alertes, logs, incidents)
3. Raisonnement sur les menaces
4. Recommandations automatiques
5. Génération de playbooks
```

**Solution:**
- Intégrer OpenAI API ou Claude API
- Créer système de prompts pour contexte SOC
- Implémenter RAG (Retrieval Augmented Generation) avec base de connaissances
- Ajouter streaming des réponses

**Backend nécessaire:**
```python
# backend/app/routers/sentinel_ai.py
POST /api/sentinel/chat
POST /api/sentinel/analyze-threat
POST /api/sentinel/generate-playbook
GET  /api/sentinel/context
```

**Priorité:** 🟡 MOYENNE

---

### 4. 🔍 Investigation Workspace (`/cases/[id]`)

**Problème:** Workflow forensique incomplet

**État actuel:**
- 🟡 Page existe
- 🟡 Affichage des cas
- ❌ Pas de timeline d'investigation
- ❌ Pas de gestion des preuves
- ❌ Pas de corrélation d'événements

**Ce qui manque:**
```typescript
// Fonctionnalités forensiques:
1. Timeline interactive des événements
2. Graphe de corrélation (qui a attaqué quoi, quand)
3. Gestion des preuves (upload, tagging, chain of custody)
4. Notes d'investigation
5. Export de rapport forensique
6. Collaboration en temps réel
```

**Solution:**
- Créer composant Timeline avec D3.js ou Recharts
- Implémenter graphe de corrélation avec vis.js
- Ajouter système de preuves avec upload S3
- Créer système de notes avec Markdown
- Implémenter export PDF

**Backend nécessaire:**
```python
# backend/app/routers/investigation.py
GET  /api/investigation/{case_id}/timeline
GET  /api/investigation/{case_id}/correlation-graph
POST /api/investigation/{case_id}/evidence
POST /api/investigation/{case_id}/notes
GET  /api/investigation/{case_id}/export-report
```

**Priorité:** 🟡 MOYENNE

---

### 5. 🎮 Operation SOC Expert (`/operation-soc-expert`)

**Problème:** Backend à 35% seulement (116 tâches restantes)

**État actuel:**
- 🟡 Page existe
- 🟡 Interface complète
- ❌ Backend incomplet (35%)
- ❌ 116 tâches restantes dans le spec

**Ce qui manque:**
Voir le fichier: `.kiro/specs/soc-expert-operation/tasks.md`

**Solution:**
- Exécuter les 116 tâches du spec
- Compléter tous les endpoints API
- Implémenter tous les sous-modules:
  - Dashboard Expert
  - Investigation Workspace
  - Tactical Terminal
  - Threat Hunt
  - Incident Management
  - Playbook Management

**Priorité:** 🔴 HAUTE (feature principale)

---

## 📋 Pages Secondaires à Améliorer

### 6. 🌐 WireTapper SIGINT (`/wiretapper`)
- **Problème:** Capture réseau simulée
- **Solution:** Intégrer Scapy pour vraie capture
- **Priorité:** 🟢 BASSE

### 7. 🦠 Malware Lab (`/malware-lab`)
- **Problème:** Sandbox non fonctionnel
- **Solution:** Intégrer Cuckoo Sandbox
- **Priorité:** 🟢 BASSE

### 8. 🎯 Mission Command (`/mission-command`)
- **Problème:** Orchestration manquante
- **Solution:** Implémenter workflow engine
- **Priorité:** 🟢 BASSE

### 9. 📚 Academy (`/academy`)
- **Problème:** Contenu de formation vide
- **Solution:** Ajouter modules de formation
- **Priorité:** 🟢 BASSE

### 10. 🔐 GRC (`/grc`)
- **Problème:** Conformité non implémentée
- **Solution:** Ajouter frameworks (ISO 27001, NIST, etc.)
- **Priorité:** 🟢 BASSE

---

## 🚀 Plan d'Action Recommandé

### Phase 1: Corrections Critiques (Semaine 1)
**Objectif:** Rendre les pages critiques 100% fonctionnelles

1. **Threat Map Pro** (2 jours)
   - Créer panneau d'analyse détaillée
   - Implémenter API `/api/threat-analysis/{id}`
   - Ajouter bouton "DEPLOY_COUNTER_MEASURES"
   - Tests end-to-end

2. **Operation SOC Expert** (3 jours)
   - Exécuter les 116 tâches du spec
   - Compléter backend (35% → 100%)
   - Tests d'intégration

### Phase 2: Intégrations IA (Semaine 2)
**Objectif:** Ajouter intelligence artificielle

3. **AI Pentester** (2 jours)
   - Intégrer Kali Arsenal
   - Créer router `/api/kali/tools`
   - Tests avec vrais outils

4. **Sentinel AI Hub** (3 jours)
   - Intégrer OpenAI/Claude
   - Implémenter RAG
   - Tests de conversation

### Phase 3: Workflow Forensique (Semaine 3)
**Objectif:** Compléter investigation

5. **Investigation Workspace** (3 jours)
   - Timeline interactive
   - Graphe de corrélation
   - Gestion des preuves
   - Export de rapports

### Phase 4: Améliorations Secondaires (Semaine 4)
**Objectif:** Polir les pages restantes

6. **Pages secondaires** (5 jours)
   - WireTapper SIGINT
   - Malware Lab
   - Mission Command
   - Academy
   - GRC

---

## 📊 Statistiques de Progression

### État Actuel
```
✅ Pages corrigées:        2/65  (3%)
🟡 Pages partielles:      50/65  (77%)
🔴 Pages à corriger:       5/65  (8%)
🟢 Pages secondaires:      8/65  (12%)
```

### Après Phase 1
```
✅ Pages corrigées:        4/65  (6%)
🟡 Pages partielles:      48/65  (74%)
🔴 Pages à corriger:       3/65  (5%)
🟢 Pages secondaires:      8/65  (12%)
```

### Après Phase 4 (Objectif Final)
```
✅ Pages corrigées:       12/65  (18%)
🟡 Pages partielles:      45/65  (69%)
🔴 Pages à corriger:       0/65  (0%)
🟢 Pages secondaires:      8/65  (13%)
```

---

## 🎯 Prochaine Étape Immédiate

**RECOMMANDATION:** Commencer par **Threat Map Pro**

**Raison:**
1. Page critique pour SOC
2. Correction rapide (2 jours)
3. Impact visuel immédiat
4. Utilisée quotidiennement

**Commande pour démarrer:**
```bash
# 1. Créer le router backend
cd backend/app/routers
# Créer threat_analysis.py

# 2. Modifier le frontend
cd frontend/src/components/dashboard
# Modifier ThreatMapProClient.tsx

# 3. Tester
python test_threat_map_pro.py
```

---

## ✅ Checklist de Vérification

### Threat Map Pro
- [ ] Panneau d'analyse créé
- [ ] API `/api/threat-analysis/{id}` fonctionnelle
- [ ] Détails forensiques affichés
- [ ] Bouton "DEPLOY_COUNTER_MEASURES" opérationnel
- [ ] Tests end-to-end passés

### AI Pentester
- [ ] Router Kali créé
- [ ] Nmap intégré
- [ ] Nikto intégré
- [ ] Logs en temps réel
- [ ] Tests avec vrais outils

### Sentinel AI Hub
- [ ] LLM intégré (OpenAI/Claude)
- [ ] RAG implémenté
- [ ] Streaming fonctionnel
- [ ] Contexte SOC chargé
- [ ] Tests de conversation

### Investigation Workspace
- [ ] Timeline créée
- [ ] Graphe de corrélation
- [ ] Upload de preuves
- [ ] Notes Markdown
- [ ] Export PDF

### Operation SOC Expert
- [ ] 116 tâches complétées
- [ ] Backend à 100%
- [ ] Tous les sous-modules fonctionnels
- [ ] Tests d'intégration

---

## 📞 Support

**Documentation:**
- `PROBLEMES_PAGES_FIXES.md` - Problèmes déjà résolus
- `CORRECTIONS_APPLIQUEES.md` - Corrections appliquées
- `ETAT_PAGES_NAVIGATION.md` - État de toutes les pages

**Tests:**
- `test_fixes.py` - Tests automatisés existants
- `test_threat_map_pro.py` - À créer
- `test_ai_pentester.py` - À créer

---

**Dernière mise à jour:** 2026-05-20
**Auteur:** Kiro AI Assistant
**Statut:** 🔴 En attente d'exécution

