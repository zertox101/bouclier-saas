# 📊 Asset Inventory CSV Export

## Vue d'ensemble

La fonctionnalité **Export Inventory (CSV)** permet d'exporter un snapshot complet de l'inventaire des assets de sécurité au format CSV. Cette fonctionnalité est accessible depuis la page **Security Tools**.

## 🎯 Utilisation

### Accès
1. Naviguez vers la page **Security Tools** (`/tools`)
2. Scrollez vers le bas jusqu'à la section **"Tools API"**
3. Cliquez sur le bouton vert **"Export Inventory (CSV)"**

### Résultat
Un fichier CSV sera automatiquement téléchargé avec le nom :
```
asset_inventory_YYYY-MM-DD_timestamp.csv
```

Exemple : `asset_inventory_2025-12-25_1703534711000.csv`

## 📋 Contenu du CSV

Le fichier CSV exporté contient les colonnes suivantes :

| Colonne | Description |
|---------|-------------|
| **Timestamp** | Date et heure de l'export (format ISO 8601) |
| **Asset Type** | Type d'asset (Security Tool, Network Traffic, AI Analysis, Threat, Recommendation, Scan Results) |
| **Name** | Nom de l'asset |
| **Category** | Catégorie (Local, Network, OSINT, SOC, etc.) |
| **Status** | Statut actuel (ready, blocked, Active, Completed, etc.) |
| **Risk Level** | Niveau de risque (low, medium, high) |
| **Description** | Description détaillée de l'asset |
| **Tags** | Tags séparés par des points-virgules |
| **Details** | Informations supplémentaires |

## 📦 Types d'Assets Exportés

### 1. **Security Tools** 🛠️
Tous les outils de pentesting disponibles avec leurs caractéristiques :
- Nom et catégorie
- Statut (ready, blocked, missing)
- Niveau de risque
- Description et tags
- Raison de blocage (si applicable)

### 2. **Network Traffic** 🌐
Statistiques de trafic réseau en temps réel :
- **Inbound Traffic** : Volume total, débit, nombre de paquets
- **Outbound Traffic** : Volume total, débit, nombre de paquets

### 3. **AI Analysis** 🧠
Résultats de l'analyse LLM (si disponible) :
- Résumé de l'analyse
- Score de risque (0-100%)
- Nombre de menaces détectées
- Nombre de recommandations

### 4. **Threats** ⚠️
Liste détaillée des menaces détectées par l'IA :
- Description de chaque menace
- Niveau de risque : high
- Tags : threat;detected

### 5. **Recommendations** 💡
Recommandations de sécurité générées par l'IA :
- Actions recommandées
- Niveau de risque : medium
- Tags : recommendation;action

### 6. **Scan Results** 📊
Résumé des résultats de scan :
- Nom de l'outil utilisé
- Nombre total de logs
- Statistiques : Erreurs, Warnings, Succès

## 🔍 Exemple de Données

```csv
Timestamp,Asset Type,Name,Category,Status,Risk Level,Description,Tags,Details
2025-12-25T20:05:11.000Z,Security Tool,Local Vulnerability Scanner,Local,ready,medium,"Scans local machine for open ports...",scanner;local;ports,
2025-12-25T20:05:11.000Z,Network Traffic,Inbound Traffic,Network,Active,low,"Total: 7.17 MB, Rate: 343 KB/s",traffic;inbound,14320 packets
2025-12-25T20:05:11.000Z,AI Analysis,Security Assessment,Analysis,Completed,medium,"Analyzed 12 log entries. Risk score: 45/100",ai;llm;analysis,"Threats: 2, Recommendations: 3"
2025-12-25T20:05:11.000Z,Threat,Threat 1,Security,Detected,high,"Open ports discovered - potential attack surface",threat;detected,
2025-12-25T20:05:11.000Z,Recommendation,Recommendation 1,Security,Pending,medium,"Review and close unnecessary ports",recommendation;action,
```

## 💼 Cas d'Usage

### 1. **Audit de Sécurité**
Exportez un snapshot de votre infrastructure de sécurité pour :
- Documentation d'audit
- Rapports de conformité
- Revues de sécurité périodiques

### 2. **Analyse Historique**
Conservez des exports réguliers pour :
- Suivre l'évolution des menaces
- Comparer les configurations dans le temps
- Analyser les tendances de sécurité

### 3. **Reporting**
Utilisez les données CSV pour :
- Créer des rapports personnalisés
- Générer des graphiques et visualisations
- Partager avec les équipes de sécurité

### 4. **Intégration SIEM**
Importez les données dans votre SIEM pour :
- Corrélation avec d'autres sources
- Alertes automatisées
- Tableaux de bord centralisés

## 🔧 Fonctionnalités Techniques

### Format CSV
- **Encodage** : UTF-8
- **Séparateur** : Virgule (,)
- **Échappement** : Guillemets doubles pour les champs contenant des virgules
- **Compatibilité** : Excel, Google Sheets, LibreOffice, outils d'analyse de données

### Gestion des Caractères Spéciaux
Les guillemets dans les descriptions sont automatiquement échappés :
```
"Description avec des ""guillemets"""
```

### Horodatage
Tous les timestamps utilisent le format ISO 8601 :
```
2025-12-25T20:05:11.000Z
```

## 📝 Console Log

Lors de l'export, un message est affiché dans la console du navigateur :
```
[8:05:11 PM] Exported asset inventory snapshot.
```

## 🚀 Améliorations Futures

- [ ] Export au format JSON
- [ ] Export au format Excel (.xlsx)
- [ ] Planification d'exports automatiques
- [ ] Filtres d'export personnalisables
- [ ] Compression des fichiers volumineux
- [ ] Upload direct vers cloud storage
- [ ] Intégration avec APIs SIEM

## 📞 Support

Pour toute question ou problème concernant l'export CSV, consultez :
- La documentation technique
- Les logs de la console navigateur
- L'équipe de support sécurité

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-12-25  
**Auteur** : Bouclier SaaS Security Team
