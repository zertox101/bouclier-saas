# 🇲🇦 Bouclier Dev Studio (GitHub Codespaces)

Had l-config kat-khallik t-khdem b **Bouclier SaaS** f l-cloud direct mn GitHub beddoun ma t-instally walo f pc dialk.

## 🚀 Kifach t-ebda (How to Start)

1.  **Push to GitHub**: Ila mazal ma pushiti l-code, tbe3 [DEPLOYMENT_GUIDE_GITHUB.md](./DEPLOYMENT_GUIDE_GITHUB.md).
2.  **Open in Codespaces**:
    *   F l-repo dialk f GitHub, clicki 3la l-botona l-khdra `Code`.
    *   Khtar l-onglet `Codespaces`.
    *   Clicki `Create codespace on main`.
3.  **Wait for Build**: Codespace ghadi y-prepara l-environnement otomatikment (Docker-in-Docker).
4.  **Lansi l-Platform**:
    F l-terminal dial Codespaces, kteb:
    ```bash
    docker-compose up -d --build
    ```
5.  **Access the Dashboard**:
    Codespace ghadi y-dir "forward" l-port `3002`. Clicki 3la `Open in Browser` mli tla3 lik notification, aw chofha f l-onglet `Ports`.

## 🛠️ Ports Forwarded
- **3002**: Dashboard GUI (🇲🇦 BOUCLIER)
- **8005**: Intelligence Core API
- **8100**: Tactical Tools API
- **8081**: OWASP ZAP Proxy

---
**Bouclier Security Agency - Cloud Division**
