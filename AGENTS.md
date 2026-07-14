## Goal
Autonomous Multi-Agent Cyber Defense Platform — Dockerized, real Kali tools, local LLM.

## Constraints & Preferences
- `nomic-embed-text` embeddings (768-dim, 2s/call) remplace `llama3.2:3b` (12.9s/call)
- NVD API timeout depuis Docker → fallback CVE sample data
- Frontend production build (no volume mounts) → rebuild complet après modif React
- Backend/tools-api volume-mountés → restart suffit

## Progress
### Done
- ✅ **RAPTOR AI integration** (`/raptor`) : Autonomous Security Research Framework — 5 modes (scan, agentic, sca, understand, validate), live terminal 500 lignes, findings/exploits/patches panels, progress bar, elapsed timer, export TXT, threat model toggle, mode selector visuel avec icônes, keyboard shortcuts Ctrl+Enter/Escape
- ✅ **RAPTOR backend** : `raptor_scan` dans arsenal_tools.py + `_build_command` avec fallback simulation (Semgrep/CodeQL/exploit/patch flow), action WebSocket `raptor_scan` avec polling job 3s, timeout 6min, streaming logs/progress/complete
- ✅ **RAPTOR frontend WebSocket** : `startRaptorScan()` dans useOffensiveWS, auto-connect, message queuing, messages `raptor_*` filtrés
- ✅ **RAPTOR navigation** : sidebar "RAPTOR AI" badge AI, middleware `/raptor/:path*`, commande `/raptor` dans GlobalCommandTerminal
- ✅ **Neural Pentest Suite** (improved) : MITRE ATT&CK heatmap, CircularGauges (Bypass/Compute/Velocity), Kill Chain 7 phases event-driven, Scan Results table triable, Target Vulnerabilities modal PoC/remediation, Live Attack Stream, nmap/masscan selector, export JSON/TXT, target history localStorage, keyboard shortcuts
- ✅ **OWASP WSTG Scanner** (`/wstg-scanner/`) : URL + options (threads/timeout/delay/insecure), 13 modules WSTG avec détection automatique, terminal live 500 lignes, timer, compteur findings, export TXT, progress bar animée
- ✅ **WSTG-Scan integration** : git clone + pip install dans tools-api Dockerfile, `wstg_scan` dans arsenal_tools.py, `_build_command` dans app.py (batch mode), action `wstg_scan` + `run_wstg_scan()` async dans offensive_ws.py
- ✅ **WebSocket hook** (`useOffensiveWS`) : auto-reconnect exponential backoff, message queuing, `startScan()` auto-connect, `startWstgScan()`, `startRaptorScan()`, support `raptor_*`/`wstg_*` messages, flushQueue safe
- ✅ **Backend WebSocket** (`offensive_ws.py`) : stats streaming, scan execution via tools-api avec fallback simulation nmap/masscan, mythos_analyze, wstg_scan, raptor_scan
- ✅ **Mythos AI** : REST + WebSocket Cyber Kill Chain 5 phases
- ✅ **Phase 3 Exploitation réelle** : nuclei (CVE), hydra (brute-force), sqlmap (auto-dump), nikto, searchsploit, CTF flag hunter — exécutés sur cible réelle avec parsing déterministique
- ✅ **Findings déterministiques** : construits depuis vrais outputs outils (nmap/nikto/nuclei), LLM tinyllama utilisé uniquement pour narrative enrichie
- ✅ **Bug fixes critiques** : LLM désactivé → réactivé, URL Ollama corrigée, duplicata 237 lignes supprimé, `deterministic_findings` initialisé avant Phase 3, polling backend 300 itérations (600s)
- ✅ **Timeouts Phase 3 optimisés** : nuclei 25s, hydra 12s, sqlmap 25s+20s, nikto 20s, searchsploit 8s
- ✅ **Prompt LLM CTF/Bug Bounty** : demande exploit command, flags/secrets, privesc path, one-liner fix
- ✅ **Auto-remediation endpoint** : `/remediation/execute` protégé HMAC, exécute scripts bash/PowerShell
- ✅ **E2E pipeline validé** : 7 findings en 195s sur scanme.nmap.org — tous les outils réels tournent sans timeout
- ✅ **DVWA target** : conteneur `bouclier-dvwa` (vulnerables/web-dvwa, port 30080, réseau bouclier-net)
- ✅ **Auth automatique web** : détection `/login.php`, login admin:password, extraction PHPSESSID, set security=low
- ✅ **Phase 3 étendue** : sqlmap avec cookie auth + `--drop-set-cookie`, nikto avec path scanning auth'd, nuclei avec Cookie header
- ✅ **Prompt LLM CTF** : demande exploit command + flags + privesc + fix one-liner
- ✅ **Tests** : 51/53 passent (2 timing pré-existants)

### In Progress
- *(none)*

### Done This Session
- ✅ **Attack Graph fix** — polling `tools/jobs/{id}` ; vrais ports ssh/http retournés
- ✅ **Planner Agent TOOLS fix** — `sslscan`→`nuclei_scan` ; commandes nikto/nuclei/nmap avec placeholders TARGET/URL
- ✅ **SearchSploit fix** — `--color`→`--json` ; parse vrais résultats ExploitDB (EDB-ID, Title)
- ✅ **Fix message trompeur** — `"Real exploitation executed"`→`"Exploit correlation and enumeration finished"`
- ✅ **Confidence scores dynamiques** — nikto:75%, searchsploit:55-75%, open ports:100%
- ✅ **Qdrant service** — `docker-compose.yml` + qdrant (port 6333, volume)
- ✅ **Vector Store VECTOR_SIZE fix** — 384→768 ; `_ensure_collection` recrée si dimension mismatch
- ✅ **Bulk ingestion endpoint** — `POST /api/vector/ingest/bulk` (10 CVEs + 200 MITRE ATT&CK techniques)
- ✅ **nomic-embed-text** — pulled 274MB, 2s/embedding vs 12.9s
- ✅ **Qdrant client API** — `.search()`→`.query_points()` (compatibilité ancienne lib)
- ✅ **Attack Graph button** — `/ai-pentester` lien vers `/attack-path?target=X`
- ✅ **CVE Reference Cards** — sélection vulnérabilité → vector search → 4 CVEs
- ✅ **Frontend rebuild** — 118 pages, 0 erreurs ; `/ai-pentester` 13.9 kB**
- ✅ **Planner Agent nmap fix** — extraction host:port ; nmap reçoit `host.docker.internal -p 30080` au lieu de `host.docker.internal:30080`
- ✅ **Planner Agent nikto parsing fix** — `\+ \[\d+\]` regex capture les findings Nikto (brackets avec OSVDB codes)
- ✅ **Planner Agent searchsploit fix** — recherche par technologie (apache/php) au lieu du hostname brut
- ✅ **Planner Agent test DVWA** — validé : 1 port (30080/tcp http), 13 vulns Nikto, 0 exploits (searchsploit cherche "apache")
- ✅ **MITRE Navigator real data** — backend sert 200 techniques depuis Qdrant au lieu de 20 hardcodées random ; tactic names normalisées (stealth→defense-evasion, etc.)
- ✅ **Planner Agent fix nmap** — extraction `host:port` ; nmap reçoit `host -p 30080`
- ✅ **Planner Agent fix nikto parsing** — `\+ \[\d+\]` regex capture findings Nikto
- ✅ **Planner Agent fix searchsploit** — recherche par technologie (apache) au lieu du hostname

### Blocked
- *(none)*

## Key Decisions
- **RAPTOR via tools-api** : le frontend envoie `raptor_scan` via WS → backend poll tools-api job → logs streamés. Simulation fallback si raptor.py pas trouvé dans `/opt/raptor-main/`
- **RAPTOR modes** : 5 modes distincts (scan/agentic/sca/understand/validate) avec `--threat-model` optionnel, envoyés comme paramètres à tools-api
- **Phase advancement event-driven** : findings/exploits/patches panels se remplissent en temps réel via regex matching sur les logs streamés
- **Frontend 118 pages** : `/neural-pentest` 15.2 kB (148 kB), `/raptor` 8.84 kB (139 kB), `/wstg-scanner` 9.06 kB (139 kB)
- **nomic-embed-text remplace llama3.2:3b** pour embeddings (768-dim, 5x plus rapide)
- **Qdrant collections auto-recreate** si dimension mismatch détecté
- **SearchSploit `--json`** avec parsing structuré (pas `--color` qui affichait help text)

## Next Steps
1. Tester sur cible CTF réelle (HackTheBox, VulnHub) pour valider exploitation complète
2. Améliorer LLM → GPU si dispo (llama3.2:3b CPU ~1s/token)
3. CI/CD pipeline GitHub Actions
4. Intégrer MITRE ATT&CK Timeline dynamique dans `/ai-pentester`
5. Ajouter PDF Export enrichi avec CVE Reference Cards

## Critical Context
- **Backend** : http://localhost:8005 (Docker)
- **Frontend** : http://localhost:3002 (Docker production build — NO volume mount)
- **WebSocket** : `ws://localhost:8005/api/offensive/ws` — actions : `stats`, `subscribe`, `scan`, `mythos_analyze`, `wstg_scan`, `raptor_scan`, `ping`
- **RAPTOR** : dans `/opt/raptor-main/raptor.py` (tools-api Kali), modes : `scan` (Semgrep+CodeQL), `agentic` (full pipeline), `sca` (dependencies), `understand` (attack surface), `validate` (exploitability)
- **WSTG-Scan** : clone dans `/opt/wstg-scan/wstg-scan.py` (tools-api Kali), batch mode via `--url URL --batch`
- **Frontend build** : 118 pages, 0 erreurs — `/raptor` 8.84 kB (139 kB), `/neural-pentest` 15.2 kB (148 kB), `/wstg-scanner` 9.06 kB (139 kB)
- **Pytest** : `docker compose exec backend python -m pytest tests/ -v` (40 tests)
- **Integration** : `docker compose exec backend timeout 60 python /app/test_integration.py` (53 tests)
- **Tools-api** : `http://tools-api:8100/tools/run` + `/agent/analyze` — `X-Api-Key: BOUCLIER_ALPHA_SESSION_2026` — 104 tools disponibles
- **Docker Engine only** : `docker compose build --no-cache` réussi sans Docker Desktop (14 juin 2026), tools-api contient désormais raptor-main + wstg-scan intégrés
- **Secrets** : `docker-compose.yml` utilise `${VAR:-default}` via `.env` — plus aucun secret hardcodé
- **Deployment** : `deploy.ps1` automatisé (build → start → healthcheck), `deployments/docker-compose.yml` synchronisé
- **Healthchecks** : postgres (pg_isready), redis (redis-cli ping), ollama (ollama list), backend (curl /health), gateway (wget /health)
- **Qdrant** : service ajouté au `docker-compose.yml`, port 6333, volume `qdrant_data`, réseau `bouclier-net` ; VECTOR_SIZE=768
- **Embeddings** : `nomic-embed-text` via Ollama, 768-dim, 2s/call
- **Vector store** : `POST /api/vector/ingest/bulk` (10 CVEs + 200 MITRE), `POST /api/vector/search` (semantic cosine search), `GET /api/vector/ingest/status`
- **Attack Graph** : `POST /api/attack-graph/generate?target=X` avec polling jobs ; retourne nodes/edges pour ECharts force-directed
- **Planner Agent** : observe→plan→act→verify→report ; commandes outils avec placeholders `TARGET`/`URL` ; `POST /agent/planner/start`

## Relevant Files
- `frontend/src/app/(dashboard)/raptor/page.tsx` : **NOUVEAU** — RAPTOR AI page (5 modes, terminal, findings/exploits/patches panels, export, keyboard shortcuts)
- `frontend/src/hooks/useOffensiveWS.ts` : **MODIFIÉ** — ajout `startRaptorScan()`, support messages `raptor_*`
- `frontend/src/components/layout/Sidebar.tsx` : **MODIFIÉ** — ajout "RAPTOR AI" badge AI
- `frontend/src/components/layout/GlobalCommandTerminal.tsx` : **MODIFIÉ** — ajout `/raptor`
- `frontend/src/middleware.ts` : **MODIFIÉ** — ajout `/raptor/:path*`
- `tools-api/arsenal_tools.py` : **MODIFIÉ** — ajout tool `raptor_scan`
- `tools-api/app.py` : **MODIFIÉ** — ajout `_build_command` pour `raptor_scan` avec fallback simulation ; SearchSploit `--color`→`--json` ; message "Real exploitation executed"→"Exploit correlation and enumeration finished"
- `tools-api/planner_agent.py` : **MODIFIÉ** — TOOLS nikto/nuclei/nmap avec placeholders TARGET/URL ; sslscan retiré, nuclei_scan ajouté
- `backend/app/routes/offensive_ws.py` : **MODIFIÉ** — ajout action `raptor_scan` + `run_raptor_scan()` async
- `backend/app/routes/attack_graph/router.py` : **MODIFIÉ** — polling jobs, parse nmap output
- `backend/app/services/vector_store.py` : **MODIFIÉ** — VECTOR_SIZE=768, EMBED_MODEL=nomic-embed-text, `_ensure_collection` recrée si dimension mismatch
- `backend/app/routes/vector_store.py` : **NOUVEAU** — `POST /api/vector/ingest/bulk` + `GET /api/vector/ingest/status` + fallback sample CVEs/MITRE
- `backend/scripts/ingest_vector_data.py` : **NOUVEAU** — Script ingestion standalone
- `frontend/src/app/(dashboard)/neural-pentest/page.tsx` : event-driven kill chain, real metrics, sortable table, target history, JSON/TXT export ; Attack Graph button + CVE Reference Cards
- `frontend/src/app/(dashboard)/attack-path/page.tsx` : force-directed ECharts avec ports/services réels
- `frontend/src/app/(dashboard)/wstg-scanner/page.tsx` : OWASP WSTG Scanner (13 modules, terminal, progress, findings, export)
- `docker-compose.yml` : **MODIFIÉ** — service `qdrant` ajouté
- `AGENTS.md` : mis à jour complet
