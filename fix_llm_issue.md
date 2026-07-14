# 🔧 FIX: Problème LLM "invalid JSON format"

## 🎯 DIAGNOSTIC

**Erreur**: `[LLM_RESPONSE][!] AI returned invalid JSON format: Expecting value: line 1 column 1 (char 0)`

**Cause identifiée**: 
- L'AI Gateway timeout lors de la génération de réponses
- Le modèle Ollama `llama3.2:3b` est présent mais prend trop de temps à répondre
- Timeout configuré à 30 secondes, mais la génération prend plus de temps

## ✅ SOLUTIONS

### Solution 1: Augmenter le timeout (RAPIDE - 2 minutes)

Le timeout actuel est de 60 secondes dans le code, mais Ollama peut prendre plus de temps pour les prompts complexes.

**Fichier à modifier**: `tools-api/app.py` ligne 203

```python
# AVANT
timeout = httpx.Timeout(60.0, connect=10.0)

# APRÈS
timeout = httpx.Timeout(180.0, connect=10.0)  # 3 minutes au lieu de 1
```

### Solution 2: Utiliser un modèle plus rapide (RECOMMANDÉ - 5 minutes)

Le modèle `llama3.2:3b` est lent. Utiliser `tinyllama` pour les analyses rapides.

**Fichier à modifier**: `.env.ai`

```bash
# AVANT
LLM_MODEL=llama3.2:3b

# APRÈS
LLM_MODEL=tinyllama
```

Puis redémarrer:
```bash
docker restart shield-tools-engine shield-ai-gateway
```

### Solution 3: Télécharger tinyllama (SI PAS PRÉSENT)

```bash
docker exec shield-ollama-core ollama pull tinyllama
```

### Solution 4: Désactiver l'analyse AI temporairement (WORKAROUND)

Si vous voulez juste tester Mythos sans l'analyse AI:

**Fichier à modifier**: `tools-api/app.py` ligne 750

```python
# Commenter la ligne d'analyse AI
# analysis = _call_llm(prompt, system_prompt)
analysis = '{"findings": []}'  # Désactiver temporairement
```

## 🚀 SOLUTION RAPIDE RECOMMANDÉE

Exécuter ces commandes:

```bash
# 1. Télécharger tinyllama (plus rapide)
docker exec shield-ollama-core ollama pull tinyllama

# 2. Redémarrer les services
docker restart shield-tools-engine shield-ai-gateway shield-ollama-core

# 3. Attendre 30 secondes
Start-Sleep -Seconds 30

# 4. Tester
curl http://localhost:8100/health
```

## 📊 VÉRIFICATION

Après le fix, tester avec:

```bash
# Test 1: Vérifier que tinyllama est disponible
docker exec shield-ollama-core ollama list

# Test 2: Tester l'AI Gateway
docker exec shield-tools-engine python -c "import httpx; r = httpx.post('http://ai-gateway:8200/api/generate', json={'model': 'tinyllama', 'prompt': 'test', 'stream': False}, timeout=60); print(r.status_code)"

# Test 3: Lancer un scan Mythos
# Aller sur http://localhost:3001/mythos-intelligence
# Entrer une cible: scanme.nmap.org
# Cliquer sur "Deploy"
```

## 🎯 RÉSULTAT ATTENDU

Après le fix:
- ✅ L'AI répond en moins de 30 secondes
- ✅ Les scans Mythos génèrent des rapports avec analyse AI
- ✅ Plus d'erreur "invalid JSON format"

## 📝 NOTES

- **tinyllama** est 5x plus rapide que llama3.2:3b
- **llama3.2:3b** donne de meilleurs résultats mais est plus lent
- Pour la production, utiliser llama3.2:3b avec timeout de 180s
- Pour les tests, utiliser tinyllama avec timeout de 60s

---

**BOUCLIER | Advanced Cyber Defense Platform**
*Fix LLM Issue - Version 1.0*
*Date: 20 Mai 2026*
