# 🔴 GUIDE D'UTILISATION - OUTILS OFFENSIFS BOUCLIER

## 📋 TABLE DES MATIÈRES
1. [Vue d'ensemble](#vue-densemble)
2. [Pages Offensives Disponibles](#pages-offensives-disponibles)
3. [Mythos Intelligence Scanner](#mythos-intelligence-scanner)
4. [Arsenal Tools](#arsenal-tools)
5. [Red Team Operations](#red-team-operations)
6. [Comment Exécuter un Scan](#comment-exécuter-un-scan)
7. [Outils Kali Linux Intégrés](#outils-kali-linux-intégrés)
8. [Sécurité et Permissions](#sécurité-et-permissions)

---

## 🎯 VUE D'ENSEMBLE

BOUCLIER intègre une suite complète d'outils offensifs professionnels pour les tests de pénétration, l'audit de sécurité et les opérations Red Team. Le système utilise:

- **Mythos AI Engine** - Scanner autonome avec IA (Llama3.2 / Gemini / GPT-4)
- **Arsenal Tools** - 60+ outils Kali Linux intégrés
- **Real Kali Scanner** - Container Kali Linux dédié avec tous les outils
- **Policy Engine** - Contrôle d'accès et mode sécurisé

---

## 📍 PAGES OFFENSIVES DISPONIBLES

### 1. **Mythos Intelligence** (`/mythos-intelligence`)
**URL**: http://localhost:3001/mythos-intelligence

**Description**: Scanner autonome avec IA qui exécute un Cyber Kill Chain complet en 5 phases.

**Fonctionnalités**:
- ✅ Reconnaissance OSINT automatique
- ✅ Scan et énumération des services
- ✅ Exploitation automatique (SQLi, XSS, RCE)
- ✅ Analyse de persistence
- ✅ Techniques d'évasion
- ✅ Rapport HTML professionnel généré

**Comment utiliser**:
1. Ouvrir http://localhost:3001/mythos-intelligence
2. Dans le panneau "Mythos Active Deployment", entrer l'IP ou domaine cible
3. Cliquer sur **"Deploy"**
4. Le scan démarre automatiquement et affiche les résultats en temps réel

---

### 2. **Arsenal Tools** (`/arsenal`)
**URL**: http://localhost:3001/arsenal

**Description**: Bibliothèque de 60+ outils offensifs avec interface graphique.

**Catégories d'outils**:
- 🔍 **Network** - Nmap, Masscan, Netdiscover
- 🌐 **Web** - SQLmap, Nikto, Gobuster, Nuclei
- 🔐 **Audit** - Hydra, Medusa, CrackMapExec
- 🕵️ **OSINT** - theHarvester, Amass, Shodan, Maltego
- 💣 **Exploit** - SearchSploit, Metasploit, Armitage
- 📱 **Mobile** - MobSF, Frida, Androguard
- 🎯 **Post-Exploitation** - Empire, BloodHound, Pypykatz
- 📡 **Wireless** - Reaver, Kismet, Aircrack-ng
- 🔬 **Reverse Engineering** - Ghidra, Radare2, Checksec

**Comment utiliser**:
1. Ouvrir http://localhost:3001/arsenal
2. Parcourir les outils par catégorie
3. Cliquer sur un outil pour voir ses paramètres
4. Remplir les champs requis (target, options)
5. Cliquer sur **"Execute"** ou **"Launch"**
6. Voir les résultats en temps réel

---

### 3. **Red Team Operations** (`/red-team`)
**URL**: http://localhost:3001/red-team

**Description**: Interface de gestion des opérations Red Team avec orchestration multi-outils.

**Fonctionnalités**:
- Mission planning et tracking
- Orchestration de campagnes multi-phases
- Gestion des payloads et exploits
- Reporting automatique

---

## 🚀 MYTHOS INTELLIGENCE SCANNER

### Qu'est-ce que Mythos?

Mythos est un **scanner autonome avec IA** qui exécute automatiquement un Cyber Kill Chain complet:

```
PHASE 1: RECONNAISSANCE (OSINT)
├── WHOIS lookup
├── DNS enumeration (A, MX, TXT)
└── HTTP banner grabbing

PHASE 2: SCAN & ENUMERATION
├── Nmap service detection
├── Web service discovery
├── Directory bruteforce (Gobuster/Dirsearch)
└── Technology fingerprinting

PHASE 3: EXPLOITATION
├── SQLmap injection testing
├── Nikto vulnerability scan
├── CISA KEV correlation
└── Network audit scripts

PHASE 4: PERSISTENCE
├── SSH key injection vectors
├── Crontab backdoors
├── Systemd service persistence
└── SUID backdoor analysis

PHASE 5: COVER TRACKS
├── Log evasion techniques
├── History clearing
├── Timestomping
└── Anti-forensics
```

### Comment Exécuter Mythos

#### Méthode 1: Via l'interface Mythos Intelligence

```bash
# 1. Ouvrir le navigateur
http://localhost:3001/mythos-intelligence

# 2. Dans le panneau "Mythos Active Deployment"
Target: 192.168.1.100  # ou example.com
Mode: mythos

# 3. Cliquer sur "Deploy"
```

#### Méthode 2: Via l'API Backend

```bash
# Endpoint
POST http://localhost:8005/api/saas/control/redteam/mythos

# Body
{
  "target": "192.168.1.100"
}

# Exemple avec curl
curl -X POST http://localhost:8005/api/saas/control/redteam/mythos \
  -H "Content-Type: application/json" \
  -d '{"target":"192.168.1.100"}'
```

#### Méthode 3: Via Tools API (Direct)

```bash
# Endpoint
POST http://localhost:8200/agent/analyze

# Body
{
  "target": "192.168.1.100",
  "mode": "mythos"
}

# Avec authentification HMAC
curl -X POST http://localhost:8200/agent/analyze \
  -H "Content-Type: application/json" \
  -H "X-Shield-Signature: <signature>" \
  -H "X-Shield-Timestamp: <timestamp>" \
  -H "X-Shield-Nonce: <nonce>" \
  -d '{"target":"192.168.1.100","mode":"mythos"}'
```

### Résultats Mythos

Le scanner génère:

1. **Logs en temps réel** - Affichés dans l'interface
2. **Structured Findings** - JSON avec:
   - Nom de la vulnérabilité
   - Sévérité (Critical/High/Medium/Low)
   - CWE et CVSS
   - Exploit PoC
   - Chemin de privilege escalation
   - Commandes de persistence
   - Techniques d'évasion
   - Remédiation

3. **Rapport HTML Professionnel** - Généré automatiquement dans `tools-api/reports/`

---

## 🛠️ ARSENAL TOOLS - GUIDE D'UTILISATION

### Outils Réseau

#### **Nmap Advanced Scan**
```
Tool ID: nmap_advanced
Inputs:
  - target: 192.168.1.0/24 ou example.com
  - ports: 1-1000 (optionnel)

Exemple:
  Target: 192.168.1.100
  Ports: 1-65535
  
Résultat: Liste des ports ouverts avec services et versions
```

#### **Masscan Fast Scanner**
```
Tool ID: masscan_fast
Inputs:
  - target: 192.168.1.0/24
  - ports: 1-1000

Exemple:
  Target: 10.0.0.0/8
  Ports: 80,443,8080
  
Résultat: Scan ultra-rapide de réseaux entiers
```

### Outils Web

#### **SQLmap Injection Scanner**
```
Tool ID: sqlmap_advanced
Inputs:
  - url: http://target.com/page?id=1
  - level: 1-5 (optionnel)

Exemple:
  URL: http://example.com/product.php?id=1
  Level: 2
  
Résultat: Détection SQLi + extraction de bases de données
```

#### **Nikto Web Scanner**
```
Tool ID: nikto_webscan
Inputs:
  - target: https://target.com

Exemple:
  Target: https://example.com
  
Résultat: CVEs, misconfigurations, vulnérabilités web
```

#### **Gobuster Directory Bruteforce**
```
Tool ID: gobuster_dir
Inputs:
  - url: https://target.com
  - wordlist: /usr/share/wordlists/dirb/common.txt (optionnel)

Exemple:
  URL: https://example.com
  Wordlist: (default)
  
Résultat: Répertoires et fichiers cachés découverts
```

### Outils OSINT

#### **theHarvester**
```
Tool ID: theharvester_osint
Inputs:
  - domain: example.com
  - limit: 50 (optionnel)

Exemple:
  Domain: example.com
  Limit: 100
  
Résultat: Emails, sous-domaines, noms de personnes
```

#### **Shodan Enterprise**
```
Tool ID: shodan_enterprise
Inputs:
  - query: apache country:MA
  - api_key: YOUR_SHODAN_KEY
  - monitoring: true/false

Exemple:
  Query: port:22 country:US
  API Key: ABC123...
  Monitoring: true
  
Résultat: Devices IoT exposés + monitoring réseau
```

### Outils d'Audit

#### **Hydra Password Auditor**
```
Tool ID: hydra_bruteforce
Inputs:
  - target: 192.168.1.100
  - username: admin
  - passlist: /usr/share/wordlists/rockyou.txt (optionnel)

Exemple:
  Target: 192.168.1.100
  Username: root
  Passlist: (default rockyou.txt)
  
Résultat: Mots de passe découverts pour SSH/FTP/HTTP
```

### Outils Post-Exploitation

#### **BloodHound Data Collector**
```
Tool ID: bloodhound_collect
Inputs:
  - domain: corp.local
  - username: domain\user
  - password: P@ssw0rd

Exemple:
  Domain: contoso.local
  Username: CONTOSO\administrator
  Password: P@ssw0rd123
  
Résultat: Données Active Directory pour analyse d'attaque
```

#### **Empire PowerShell Agent**
```
Tool ID: empire_powershell
Inputs:
  - listener: http
  - command: uselistener http

Exemple:
  Listener: http
  Command: agents
  
Résultat: Gestion d'agents PowerShell pour lateral movement
```

---

## 🐧 OUTILS KALI LINUX INTÉGRÉS

BOUCLIER inclut un **container Kali Linux dédié** avec tous les outils pré-installés.

### Container Kali

```yaml
Service: kali-scanner
Port: N/A (internal)
Image: kalilinux/kali-rolling
Tools: 300+ outils Kali pré-installés
```

### Outils Disponibles

```bash
# Information Gathering
nmap, masscan, netdiscover, sparta, dnsmap, amass, theharvester

# Vulnerability Analysis
nikto, nuclei, openvas, wapiti

# Web Applications
sqlmap, gobuster, ffuf, burpsuite, wpscan

# Password Attacks
hydra, medusa, john, hashcat, cewl

# Wireless Attacks
aircrack-ng, reaver, kismet, wifite

# Exploitation
metasploit, searchsploit, armitage

# Post Exploitation
empire, bloodhound, mimikatz, pypykatz, crackmapexec

# Forensics
foremost, volatility, autopsy

# Reverse Engineering
ghidra, radare2, gdb, checksec

# Social Engineering
set (Social Engineering Toolkit)
```

### Exécuter un Outil Kali Personnalisé

Via l'Arsenal:

```
Tool: Custom Kali Command
Tool ID: kali_custom_tool

Input:
  command: nmap -sV -sC 192.168.1.100

Résultat: Sortie brute de la commande
```

---

## 🔐 SÉCURITÉ ET PERMISSIONS

### Policy Engine

BOUCLIER utilise un **Policy Engine** pour contrôler l'accès aux outils offensifs:

```python
# Fichier: backend/app/core/policy/engine.py

Modes:
  - SAFE_MODE: Scans limités, timeouts courts
  - OFFENSIVE_MODE: Accès complet aux outils

Règles:
  - Blocage des cibles publiques (optionnel)
  - Limitation des threads/rate
  - Timeouts forcés
  - Logging de toutes les actions
```

### Configuration

```bash
# Fichier: backend/.env

# Mode sécurisé (désactive les outils dangereux)
SAFE_MODE=false

# Autoriser les cibles publiques
TOOLS_ALLOW_PUBLIC_TARGETS=1

# Limites de sécurité
TOOLS_MAX_SNIFF_DURATION=300
TOOLS_MAX_HYDRA_THREADS=4
TOOLS_MAX_MASSCAN_RATE=5000
TOOLS_CMD_TIMEOUT=180
```

### Authentification HMAC

Toutes les requêtes vers Tools API sont signées avec HMAC:

```python
# Headers requis
X-Shield-Signature: <HMAC-SHA256>
X-Shield-Timestamp: <Unix timestamp>
X-Shield-Nonce: <UUID unique>

# Secret partagé
TOOLS_API_SECRET=BOUCLIER_ALPHA_SESSION_2026
```

---

## 📊 EXEMPLES D'UTILISATION

### Exemple 1: Scan Complet d'un Réseau

```bash
# 1. Découverte réseau
Tool: Netdiscover ARP Scan
Range: 192.168.1.0/24

# 2. Scan de ports
Tool: Nmap Advanced Scan
Target: 192.168.1.100
Ports: 1-65535

# 3. Énumération web
Tool: Gobuster Directory Bruteforce
URL: http://192.168.1.100

# 4. Test d'injection
Tool: SQLmap Injection Scanner
URL: http://192.168.1.100/page?id=1

# 5. Audit de mots de passe
Tool: Hydra Password Auditor
Target: 192.168.1.100
Username: admin
```

### Exemple 2: Audit OSINT d'une Organisation

```bash
# 1. Harvesting d'emails
Tool: theHarvester OSINT
Domain: example.com
Limit: 100

# 2. Énumération DNS
Tool: Amass DNS Enumeration
Domain: example.com

# 3. Recherche Shodan
Tool: Shodan Enterprise
Query: org:"Example Corp"
API Key: YOUR_KEY

# 4. Recherche d'exploits
Tool: SearchSploit Exploit Search
Query: Apache 2.4.49
```

### Exemple 3: Test de Pénétration Web Complet

```bash
# 1. Reconnaissance
Tool: Nikto Web Scanner
Target: https://example.com

# 2. Découverte de contenu
Tool: Gobuster Directory Bruteforce
URL: https://example.com
Wordlist: /usr/share/wordlists/dirb/big.txt

# 3. Scan de vulnérabilités
Tool: Nuclei Vulnerability Scanner
URL: https://example.com
Severity: critical,high

# 4. Test d'injection SQL
Tool: SQLmap Injection Scanner
URL: https://example.com/product?id=1
Level: 3

# 5. Audit de sécurité
Tool: Wapiti Web Security Audit
URL: https://example.com
```

---

## 🎯 MYTHOS PLAYBOOKS

Mythos inclut des **playbooks automatisés** pour des scénarios complexes:

### Playbook 1: Perimeter Sweep
```
ID: mythos_playbook_perimeter
Description: Balayage périmétrique complet

Phases:
  1. Network Audit (ports, services)
  2. CISA KEV correlation
  3. Port Discovery (Nmap)
  4. OSINT Correlation (DNS, WHOIS)

Input:
  target: example.com

Résultat: Carte complète de la surface d'attaque externe
```

### Playbook 2: Lateral Discovery
```
ID: mythos_playbook_lateral
Description: Découverte de mouvement latéral

Phases:
  1. SMB Audit
  2. Active Directory Recon
  3. Credential Hunting
  4. Privilege Escalation Paths

Input:
  target_network: 10.0.0.0/24

Résultat: Chemins d'attaque internes + credentials
```

### Playbook 3: Cloud Asset Audit
```
ID: mythos_playbook_cloud
Description: Audit d'assets cloud

Phases:
  1. S3 Bucket Hunting
  2. Exposed Secrets Detection
  3. Dependency Vulnerability Chain
  4. IAM Misconfiguration Analysis

Input:
  cloud_provider: aws
  domain: example.com

Résultat: Vulnérabilités cloud + secrets exposés
```

---

## 📝 NOTES IMPORTANTES

### ⚠️ Avertissements Légaux

1. **Autorisation Requise**: N'utilisez ces outils QUE sur des systèmes que vous possédez ou pour lesquels vous avez une autorisation écrite explicite.

2. **Responsabilité**: L'utilisation non autorisée de ces outils est ILLÉGALE et peut entraîner des poursuites pénales.

3. **Environnement de Test**: Utilisez un lab isolé pour les tests (VirtualBox, VMware, AWS sandbox).

### 🔧 Dépannage

#### Problème: "Binary not found"
```bash
# Solution: Vérifier que le container Kali est démarré
docker ps | grep kali-scanner

# Redémarrer si nécessaire
docker-compose restart kali-scanner
```

#### Problème: "HMAC Signature Failed"
```bash
# Solution: Vérifier que le secret est synchronisé
# Backend: backend/.env
# Tools API: tools-api/.env

TOOLS_API_SECRET=BOUCLIER_ALPHA_SESSION_2026
```

#### Problème: "Target validation failed"
```bash
# Solution: Vérifier le format de la cible
# Valide: 192.168.1.100, example.com, 10.0.0.0/24
# Invalide: http://example.com, example.com:8080
```

---

## 📞 SUPPORT

Pour toute question ou problème:

1. Vérifier les logs:
   ```bash
   # Backend logs
   docker logs bouclier-backend
   
   # Tools API logs
   docker logs bouclier-tools-api
   
   # Kali scanner logs
   docker logs bouclier-kali-scanner
   ```

2. Consulter la documentation API:
   - Backend: http://localhost:8005/docs
   - Tools API: http://localhost:8200/docs

3. Vérifier le statut des services:
   ```bash
   # Dashboard
   http://localhost:3001/saas-control
   
   # Health check
   curl http://localhost:8005/api/saas/control/health
   ```

---

## 🚀 PROCHAINES ÉTAPES

1. **Démarrer les services**:
   ```bash
   cd bouclier-saas
   docker-compose up -d
   ```

2. **Accéder au dashboard**:
   ```
   http://localhost:3001
   ```

3. **Tester Mythos**:
   ```
   http://localhost:3001/mythos-intelligence
   Target: scanme.nmap.org
   Deploy
   ```

4. **Explorer l'Arsenal**:
   ```
   http://localhost:3001/arsenal
   ```

---

**BOUCLIER | Advanced Cyber Defense Platform**
*Version 2.0 - Mythos Edition*
