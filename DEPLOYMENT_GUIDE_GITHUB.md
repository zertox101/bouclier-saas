# 🚀 Bouclier SaaS - GitHub Deployment & Production Guide

Had l-guide ghadi y-werrik kifach t-hett l-projet dialk f **GitHub** w kifach t-deployih f server (VPS/Cloud).

---

## 📦 Part 1: Push to GitHub (Awel Marra)

Bach t-sauvegarder l-code dialk f GitHub w y-b9a 3ndek version control.

### 1. Préparez l-Environnement
T-2akked ana `.gitignore` m-reguel (deja dert lik had l-etape). Kay-bloqué l-files li ma khass-homch y-tla3o bhal `node_modules`, `.env`, w `databases`.

### 2. Initier Git (Terminal)
F l-dossier racine `bouclier-saas`, lansi had l-awamir:

```powershell
# 1. Initier repository local
git init

# 2. Ajouté ga3 l-fichiers (Git ghadi y-ignorer li f .gitignore)
git add .

# 3. Créer l-commit l-lwel
git commit -m "🚀 Initial Release: Bouclier SaaS Platform v2.0"

# 4. Renommer l-branche l-preicinpale "main"
git branch -M main
```

### 3. Connecter m3a GitHub
1. Sir l [GitHub New Repository](https://github.com/new).
2. Semmih `bouclier-saas-platform`.
3. Khlih **Public** aw **Private** (3la hssabk).
4. **Ma t-zid walo** (la README la License), dir "Create repository".
5. Copier dak l-lien li ghadi y-3tiwuk (e.g., `https://github.com/USER/bouclier-saas.git`).

Rje3 l-terminal w dir:

```powershell
# Remplacer URL b lien dialk
git remote add origin https://github.com/VOTRE_USERNAME/bouclier-saas-platform.git

# Pushé l-code l-clouds
git push -u origin main
```

---

## 🔄 Part 2: Updates (Kifach t-zid modifs)

Mli t-koun kheddam w t-bghit t-sauvegarder l-khidma jdida:

```powershell
# 1. Chouf chno tbddel
git status

# 2. Ajouté l-modifications
git add .

# 3. Commit (b message mfhoum)
git commit -m "✨ Feature: Zedt l-AI Agent f dashboard"

# 4. Sifet l GitHub
git push
```

---

## 🌍 Part 3: Production Deployment (VPS / Ubuntu)

Ila bghiti t-hott s-site "Live" bach nass y-dekhlou lih (3la server Ubuntu bhal DigitalOcean, AWS, etc.).

### 1. Pré-requis Server
- Server Ubuntu 22.04 LTS (min 4GB RAM hit endek AI).
- Docker & Docker Compose m-installyin.

### 2. Installation f Server
Dkhol l-server b SSH w dir:

```bash
# 1. Jab l-code mn GitHub
git clone https://github.com/VOTRE_USERNAME/bouclier-saas-platform.git
cd bouclier-saas-platform

# 2. Créer fichier .env (Hada ma kay-tla3ch f GitHub, khass t-souboh manuel)
nano .env
# (Copier dakchi li f .env.example w 3emmer l-mot de passes s7a7)

# 3. Demarrer l-Platform
docker-compose up -d --build
```

### 3. Maintencance
Bach t-dir mise-à-jour f server:

```bash
git pull origin main
docker-compose up -d --build
docker system prune -f  # Bach t-mseh les images l-9dam
```

---

## 🛡️ Best Practices

1. **Jamais t-uploadé `.env`**: Mots de passe, API Keys, w Secret Keys khasshom y-b9aw f local.
2. **Branching**: Ila kounti ghadi t-dir modif kbira, dir branch jdida: `git checkout -b feature-new-ui`.
3. **Database**: `dev.db` (SQLite) mzyana l dev, walakin f Prod sta3mel PostgreSQL (deja m-configuré f docker-compose).

---
**Bouclier Dev Ops Team** 🇲🇦
