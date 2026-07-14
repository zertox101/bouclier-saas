# 🔧 CORRECTION DES BOUTONS SANS LIENS

## 📋 BOUTONS IDENTIFIÉS SANS FONCTION

### 1. Page Incidents - Bouton "Escalate to L3"

**Fichier**: `frontend/src/app/(dashboard)/incidents/page.tsx`
**Ligne**: 272

**Code actuel**:
```typescript
<ActionButton 
  label="Escalate to L3" 
  icon={ArrowRight} 
  onClick={() => {}} // ❌ VIDE
  color="text-red-500" 
/>
```

**Correction à appliquer**:
```typescript
<ActionButton 
  label="Escalate to L3" 
  icon={ArrowRight} 
  onClick={() => handleEscalate(selectedInc.id, 'L3')} // ✅ FONCTION
  color="text-red-500" 
/>

// Ajouter la fonction handleEscalate
const handleEscalate = async (incidentId: number, level: string) => {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_API}/api/incidents/${incidentId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level })
    });
    
    if (response.ok) {
      addNotification({
        type: 'success',
        title: 'ESCALATED',
        message: `Incident escalated to ${level}`
      });
      // Refresh incidents
      fetchIncidents();
    }
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'ERROR',
      message: 'Failed to escalate incident'
    });
  }
};
```

---

## 🔍 RECHERCHE COMPLÈTE DES BOUTONS SANS LIENS

### Méthode de recherche

```bash
# Chercher tous les onClick vides
grep -r "onClick={() => {}}" frontend/src/

# Chercher tous les onClick avec TODO
grep -r "onClick.*TODO" frontend/src/

# Chercher tous les boutons disabled
grep -r "disabled={true}" frontend/src/
```

---

## 📊 LISTE COMPLÈTE DES BOUTONS À CORRIGER

### Page: Incidents (`/incidents`)

#### 1. Bouton "Escalate to L3"
- **Status**: ❌ Fonction vide
- **Priorité**: HAUTE
- **Action**: Créer endpoint `/api/incidents/{id}/escalate`

#### 2. Bouton "Assign to User"
- **Status**: ⚠️ Endpoint manquant
- **Priorité**: HAUTE
- **Action**: Créer endpoint `/api/incidents/{id}/assign`

#### 3. Bouton "Add Comment"
- **Status**: ⚠️ Modal incomplet
- **Priorité**: MOYENNE
- **Action**: Compléter le formulaire de commentaire

---

### Page: Alerts (`/alerts`)

#### 1. Bouton "Resolve Alert"
- **Status**: ❌ Endpoint manquant
- **Priorité**: CRITIQUE
- **Action**: Créer endpoint `/api/alerts/{id}/resolve`

**Code à ajouter**:
```typescript
// frontend/src/app/(dashboard)/alerts/page.tsx
const handleResolveAlert = async (alertId: number) => {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_API}/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        resolved_by: 'current_user',
        resolution_note: 'Resolved from dashboard'
      })
    });
    
    if (response.ok) {
      addNotification({
        type: 'success',
        title: 'RESOLVED',
        message: 'Alert marked as resolved'
      });
      fetchAlerts(); // Refresh
    }
  } catch (error) {
    console.error('Failed to resolve alert:', error);
  }
};
```

**Backend endpoint à créer**:
```python
# backend/app/routes/alerts.py
@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    resolution: dict,
    db: Session = Depends(get_db)
):
    """Resolve an alert"""
    alert = db.query(AlertEvent).filter(AlertEvent.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "resolved"
    alert.resolved_at = datetime.now()
    alert.resolved_by = resolution.get('resolved_by')
    alert.resolution_note = resolution.get('resolution_note')
    
    db.commit()
    
    return {"status": "success", "alert_id": alert_id}
```

#### 2. Bouton "Create Incident from Alert"
- **Status**: ⚠️ Fonction partielle
- **Priorité**: HAUTE
- **Action**: Compléter la création d'incident

---

### Page: Traffic (`/traffic`)

#### 1. Bouton "Export PCAP"
- **Status**: ❌ Non implémenté
- **Priorité**: HAUTE
- **Action**: Implémenter export PCAP

**Code à ajouter**:
```typescript
// frontend/src/app/(dashboard)/traffic/page.tsx
const handleExportPCAP = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_API}/api/traffic/export-pcap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_time: filters.startTime,
        end_time: filters.endTime,
        src_ip: filters.srcIp,
        dst_ip: filters.dstIp
      })
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traffic_${Date.now()}.pcap`;
      a.click();
      
      addNotification({
        type: 'success',
        title: 'EXPORTED',
        message: 'PCAP file downloaded'
      });
    }
  } catch (error) {
    console.error('Failed to export PCAP:', error);
  }
};
```

**Backend endpoint à créer**:
```python
# backend/app/routes/traffic.py
from fastapi.responses import FileResponse
import subprocess

@router.post("/traffic/export-pcap")
def export_pcap(
    filters: dict,
    db: Session = Depends(get_db)
):
    """Export traffic as PCAP file"""
    # Get traffic data
    traffic = db.query(TrafficLog).filter(
        TrafficLog.timestamp >= filters.get('start_time'),
        TrafficLog.timestamp <= filters.get('end_time')
    ).all()
    
    # Generate PCAP file
    pcap_file = f"/tmp/traffic_{int(time.time())}.pcap"
    
    # Use tcpdump or scapy to create PCAP
    # ... implementation ...
    
    return FileResponse(
        pcap_file,
        media_type='application/vnd.tcpdump.pcap',
        filename=f"traffic_{int(time.time())}.pcap"
    )
```

#### 2. Bouton "Live Capture"
- **Status**: ❌ Non implémenté
- **Priorité**: MOYENNE
- **Action**: Implémenter capture en temps réel

---

### Page: Reports (`/reports`)

#### 1. Bouton "Generate Slides"
- **Status**: ⚠️ Nécessite données
- **Priorité**: MOYENNE
- **Action**: Connecter au stream CICIDS

**Amélioration**:
```typescript
// frontend/src/app/(dashboard)/reports/page.tsx
const handleGenerateSlides = async () => {
  // Vérifier si des données sont disponibles
  if (realAlerts.length === 0) {
    addNotification({
      type: 'warning',
      title: 'NO DATA',
      message: 'Start CICIDS stream first to generate slides'
    });
    return;
  }
  
  addNotification({
    type: 'info',
    title: 'GENERATING',
    message: 'Compiling real-time slides...'
  });
  
  setTimeout(() => setIsSlidesGenerated(true), 800);
};
```

#### 2. Bouton "Share Report"
- **Status**: ✅ Fonctionnel (copie lien)
- **Priorité**: BASSE
- **Action**: Améliorer avec partage réel

---

### Page: Assets (`/assets`)

#### 1. Bouton "Edit Asset"
- **Status**: ⚠️ Modal incomplet
- **Priorité**: MOYENNE
- **Action**: Compléter le formulaire d'édition

#### 2. Bouton "Delete Asset"
- **Status**: ⚠️ Confirmation manquante
- **Priorité**: HAUTE
- **Action**: Ajouter modal de confirmation

**Code à ajouter**:
```typescript
// frontend/src/app/(dashboard)/assets/page.tsx
const handleDeleteAsset = async (assetId: number) => {
  // Afficher modal de confirmation
  const confirmed = window.confirm('Are you sure you want to delete this asset?');
  if (!confirmed) return;
  
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_API}/api/assets/${assetId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      addNotification({
        type: 'success',
        title: 'DELETED',
        message: 'Asset deleted successfully'
      });
      fetchAssets(); // Refresh
    }
  } catch (error) {
    console.error('Failed to delete asset:', error);
  }
};
```

---

### Page: Danger Zone (`/danger-zone`)

#### 1. Bouton "Lockdown"
- **Status**: ⚠️ Confirmation manquante
- **Priorité**: CRITIQUE
- **Action**: Ajouter double confirmation

**Code à ajouter**:
```typescript
// frontend/src/app/(dashboard)/danger-zone/page.tsx
const triggerLockdown = async () => {
  // Double confirmation
  const confirm1 = window.confirm('⚠️ WARNING: This will lock down all systems. Continue?');
  if (!confirm1) return;
  
  const confirm2 = window.confirm('⚠️ FINAL WARNING: Type "LOCKDOWN" to confirm');
  const userInput = prompt('Type LOCKDOWN to confirm:');
  if (userInput !== 'LOCKDOWN') {
    addNotification({
      type: 'error',
      title: 'CANCELLED',
      message: 'Lockdown cancelled'
    });
    return;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_API}/api/saas/control/lockdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: true })
    });
    
    if (response.ok) {
      addNotification({
        type: 'warning',
        title: 'LOCKDOWN ACTIVATED',
        message: 'All systems locked down'
      });
    }
  } catch (error) {
    console.error('Failed to trigger lockdown:', error);
  }
};
```

---

## 🛠️ SCRIPT DE CORRECTION AUTOMATIQUE

Créer un fichier `fix_buttons.sh`:

```bash
#!/bin/bash

echo "🔧 Correction automatique des boutons sans liens..."

# 1. Corriger le bouton Escalate to L3
sed -i 's/onClick={() => {}}/onClick={() => handleEscalate(selectedInc.id, "L3")}/g' \
  frontend/src/app/\(dashboard\)/incidents/page.tsx

# 2. Ajouter les fonctions manquantes
# ... (à compléter selon les besoins)

echo "✅ Corrections appliquées!"
```

---

## 📝 CHECKLIST DE CORRECTION

### Priorité CRITIQUE
- [ ] Créer endpoint `/api/alerts/{id}/resolve`
- [ ] Ajouter confirmation pour bouton "Lockdown"
- [ ] Implémenter fonction "Escalate to L3"

### Priorité HAUTE
- [ ] Créer endpoint `/api/incidents/{id}/assign`
- [ ] Créer endpoint `/api/incidents/{id}/escalate`
- [ ] Implémenter export PCAP
- [ ] Ajouter confirmation pour "Delete Asset"

### Priorité MOYENNE
- [ ] Compléter modal "Add Comment"
- [ ] Compléter modal "Edit Asset"
- [ ] Améliorer "Generate Slides"
- [ ] Implémenter "Live Capture"

### Priorité BASSE
- [ ] Améliorer "Share Report"
- [ ] Ajouter tooltips sur boutons
- [ ] Améliorer feedback utilisateur

---

## 🎯 PLAN D'ACTION

### Phase 1: Corrections Critiques (1 jour)
1. Créer tous les endpoints manquants
2. Ajouter confirmations de sécurité
3. Tester fonctionnalités critiques

### Phase 2: Corrections Importantes (2 jours)
1. Compléter tous les modals
2. Implémenter exports
3. Ajouter validations

### Phase 3: Améliorations (1 jour)
1. Améliorer UX
2. Ajouter tooltips
3. Optimiser performances

---

## 📞 SUPPORT

Pour chaque bouton corrigé:

1. **Tester manuellement**:
   - Cliquer sur le bouton
   - Vérifier le comportement
   - Vérifier les logs

2. **Tester l'API**:
   ```bash
   curl -X POST http://localhost:8005/api/alerts/1/resolve
   ```

3. **Vérifier les logs**:
   ```bash
   docker logs shield-backend-api -f
   ```

---

**BOUCLIER | Advanced Cyber Defense Platform**
*Correction des Boutons - Version 2.0*
*Date: 20 Mai 2026*
