# Proposition de Conseil - Amelioration de la Detection Cyber

Client: [Nom de l'entreprise]
Date: [JJ/MM/AAAA]
Contact: [Nom, Fonction, Email]

## 1) Contexte et problemes a resoudre
Les organisations SOC font face a une hausse continue du volume d'alertes, souvent accompagnee de faux positifs, d'un manque de contexte exploitable et d'une lenteur dans le triage. Les impacts typiques sont:
- Fatigue des analystes et perte de signaux critiques.
- Delais dans l'identification et la reponse (MTTD/MTTR eleves).
- Couverture MITRE ATT&CK inegale et non priorisee.

Objectif: livrer un PoC operationnel et une feuille de route MITRE-alignee pour accelerer la detection, reduire le bruit et augmenter la qualite des investigations.

## 2) Portee (Scope)
- Approche defensive uniquement: lecture de logs, telemetry, metriques, alertes.
- Aucune action offensive ou test d'intrusion sans autorisation ecrite explicite.
- Collecte et traitement en lecture seule, respectant les politiques internes de securite et conformite.

## 3) Methodologie par phases
### Phase 1 - Detection Assessment
Objectif: comprendre l'etat actuel, mesurer la couverture MITRE et identifier les gaps prioritaires.
- Revue des sources de telemetry (EDR, firewall, IAM, DNS, proxy, cloud).
- Cartographie des detections existantes sur MITRE ATT&CK (tactiques/techniques).
- Analyse de qualite d'alertes (precision, bruit, latence).
- Definition des priorites detection en fonction du risque metier.

### Phase 2 - PoC de detection en temps reel
Objectif: deployer un PoC mesurable, integre et actionnable.
- Ingestion logs et normalisation.
- Correlation via Redis Streams + worker, enrichissement GeoIP.
- Carte geo temps reel via SSE (Arc map) et dashboard.
- Endpoint d'explication RAG avec citations.
- Integration ticketing ou webhook (option).
- Optional ML (RandomForest / GRU Autoencoder) en mode assist.

### Phase 3 - Tuning et Handover
Objectif: stabiliser les detections et transferer la competence.
- Tuning regles, seuils, correlation et enrichment.
- Playbooks et procedures d'escalade.
- Formation analystes (triage, investigation, workflow).
- Definition des KPIs et reporting.

## 4) Livrables
- Rapport d'assessment detection (coverage MITRE, gaps, priorites).
- Dashboards operatoires (alertes, geo, flux, KPIs).
- PoC detection temps reel (ingest + correlation + geo map + explain).
- Playbooks SOC (triage, investigation, escalade).
- Guide de tuning (seuils, regles, suppression de bruit).
- Roadmap detection 3-6-12 mois.

## 5) KPIs proposes
- MTTD (Mean Time To Detect) par famille d'attaques.
- Qualite d'alerte (proxy precision: ratio alertes actionnables / total).
- Couverture MITRE (techniques couvertes par criticite).
- Latence pipeline (ingest -> detection -> visualisation).
- Taux de faux positifs et effort analyste par alerte.

## 6) Gouvernance et securite des donnees
- Redaction PII et minimisation des champs sensibles.
- Retention et rotation definies (ex: 30/90/180 jours).
- Chiffrement en transit et au repos (TLS, stockage chiffre).
- Controle d'acces base sur roles (RBAC).
- Journalisation et audit de l'acces aux donnees.

## 7) Planning et effort (exemple)
Semaine 1:
- Kickoff, collecte des exigences, acces techniques.
- Inventaire telemetry et dependances.

Semaine 2:
- Assessment detection, cartographie MITRE, analyse qualite alertes.
- Rapport preliminaire et priorites.

Semaine 3:
- PoC ingestion + pipeline Redis Streams + correlation worker.
- Enrichissement GeoIP + stockage.

Semaine 4:
- Dashboard temps reel (SSE, carte geo, triage).
- Endpoint explain (RAG) + integration ticketing.

Semaine 5:
- Tuning regles/seuils, tests de charge, stabilization.

Semaine 6:
- Handover, playbooks, formation, KPIs et roadmap.

Effort estime:
- 1x Consultant SOC senior (lead)
- 1x Data/ML engineer (part-time selon option ML)
- 1x DevOps/Platform (support infra)

## 8) Acces et inputs requis
- Acces read-only aux logs (SIEM, EDR, firewall, cloud, IAM, DNS, proxy).
- Inventaire des assets et criticite metier.
- Liste des incidents recents et priorites.
- Acces aux environnements de test/staging.
- Contact operatoire SOC pour validation.

## 9) Options de pricing
Option A - Prix fixe par phase:
- Phase 1: [Prix fixe]
- Phase 2: [Prix fixe]
- Phase 3: [Prix fixe]

Option B - Retainer mensuel:
- Retainer mensuel pour operations, tuning continu, detection engineering.
- SLA et volume d'alertes a definir.

## 10) Appendix: Architecture technique (haut niveau)
Composants principaux:
- Ingestion logs -> Normalisation -> Redis Streams.
- Workers de correlation + enrichissement GeoIP (City + ASN).
- Stockage (PostgreSQL) et API REST/SSE.
- Dashboard (Streamlit/pydeck) + carte des flux temps reel.
- Module RAG Explain avec citations.
- Optional ML: RandomForest / GRU Autoencoder pour detection assist.

Flux de donnees:
1) Logs -> Ingestion (read-only)
2) Redis Streams -> Workers -> Correlation + enrichissement
3) API -> SSE map + dashboards
4) Explain -> RAG + citations
5) Outputs -> Ticketing / alerts / reporting

---
Signature:
[Nom, Fonction]
[Entreprise]
[Email / Telephone]
