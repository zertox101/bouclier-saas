# 🚀 QUICK START - SYSTÈME DE NOTIFICATIONS

**Temps estimé**: 10 minutes  
**Prérequis**: Node.js, npm installés

---

## ✅ ÉTAPE 1: VÉRIFIER L'INSTALLATION

```bash
cd c:\Users\ASUS\Desktop\cyberattack\bouclier-saas\frontend
npm list sonner
```

**Résultat attendu**: `sonner@1.x.x` (déjà installé ✅)

---

## ✅ ÉTAPE 2: DÉMARRER LE FRONTEND

```bash
cd c:\Users\ASUS\Desktop\cyberattack\bouclier-saas\frontend
npm run dev
```

**URL**: http://localhost:3000

---

## ✅ ÉTAPE 3: TESTER LE SYSTÈME

### A. Accéder à la page de configuration
```
URL: http://localhost:3000/settings/notifications
```

### B. Tester les notifications
1. Cliquer sur **"Test INFO"** → Notification bleue
2. Cliquer sur **"Test MEDIUM"** → Notification jaune
3. Cliquer sur **"Test HIGH"** → Notification orange
4. Cliquer sur **"Test CRITICAL"** → Notification rouge

### C. Vérifier les canaux
- ✅ **Son**: Beep synthétique joué
- ✅ **Toast**: Notification apparaît en haut à droite
- ⏳ **Desktop**: Cliquer "Grant Permission" si demandé

---

## ✅ ÉTAPE 4: CONFIGURER

### A. Activer/Désactiver les canaux
```
1. Toggle "Sound Alerts" → ON/OFF
2. Toggle "Desktop Notifications" → ON/OFF
3. Toggle "In-App Notifications" → ON/OFF
```

### B. Ajuster le volume
```
Slider "Volume" → 0% à 100%
```

### C. Choisir la sévérité minimale
```
Cliquer sur: INFO | MEDIUM | HIGH | CRITICAL
```

### D. Sauvegarder
```
Cliquer "Save Changes" (apparaît automatiquement si modifications)
```

---

## ✅ ÉTAPE 5: INTÉGRER DANS VOS PAGES

### A. World Monitor

**Fichier**: `frontend/src/app/(dashboard)/world-monitor/page.tsx`

**Ajouter en haut**:
```typescript
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
```

**Ajouter dans le composant**:
```typescript
const { notify } = useNotificationContext();
```

**Ajouter dans useEffect (après fetchRealThreats)**:
```typescript
useEffect(() => {
  // Notifier pour les attaques critiques
  activeAttacks.forEach(attack => {
    if (attack.severity === 'Critical' && !notifiedIds.has(attack.id)) {
      notify({
        id: attack.id || String(Date.now()),
        type: attack.type,
        severity: 'CRITICAL',
        message: `${attack.type} detected from ${attack.country}`,
        src_ip: attack.src_ip,
        country: attack.country,
        timestamp: new Date().toISOString()
      });
      notifiedIds.add(attack.id);
    }
  });
}, [activeAttacks, notify]);

// Ajouter en haut du composant
const notifiedIds = useRef(new Set<string>());
```

### B. Threat Monitor

**Fichier**: `frontend/src/app/(dashboard)/threat-monitor/page.tsx`

**Ajouter en haut**:
```typescript
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
```

**Ajouter dans le composant**:
```typescript
const { notify } = useNotificationContext();
```

**Modifier le SSE handler**:
```typescript
sse.addEventListener('events', (e: any) => {
  try {
    const data = JSON.parse(e.data);
    
    // ... code existant pour créer newEvt ...
    
    // Notifier si HIGH ou CRITICAL
    if (newEvt.severity === 'HIGH' || newEvt.severity === 'CRITICAL') {
      notify({
        id: newEvt.id,
        type: newEvt.eventType,
        severity: newEvt.severity,
        message: newEvt.description,
        src_ip: newEvt.sourceIp,
        country: newEvt.geo,
        timestamp: new Date().toISOString()
      });
    }
    
    setLiveEvents(prev => [newEvt, ...prev.slice(0, 49)]);
  } catch {}
});
```

---

## ✅ ÉTAPE 6: AJOUTER DES SONS PERSONNALISÉS (OPTIONNEL)

### A. Télécharger des sons
**Sources gratuites**:
- https://freesound.org/
- https://www.zapsplat.com/
- https://notificationsounds.com/

### B. Placer les fichiers
```
frontend/public/sounds/alert-critical.mp3
frontend/public/sounds/alert-high.mp3
frontend/public/sounds/alert-medium.mp3
frontend/public/sounds/alert-info.mp3
```

### C. Spécifications
- **Format**: MP3
- **Durée**: 0.2s - 2s
- **Taille**: < 100KB par fichier
- **Qualité**: 128kbps minimum

**Note**: Si les fichiers ne sont pas présents, le système utilise des beeps synthétiques (Web Audio API).

---

## 🧪 TESTS

### Test 1: Sons
```
1. Aller sur /settings/notifications
2. Volume à 50%
3. Cliquer "Test CRITICAL"
4. Vérifier: Son joué ✅
```

### Test 2: Desktop
```
1. Cliquer "Grant Permission" (si demandé)
2. Accepter les notifications
3. Cliquer "Test HIGH"
4. Vérifier: Notification desktop ✅
```

### Test 3: Toast
```
1. Cliquer "Test MEDIUM"
2. Vérifier: Toast en haut à droite ✅
3. Cliquer "View Details" → Redirige vers /incidents/test-xxx
4. Cliquer "Dismiss" → Toast disparaît
```

### Test 4: Filtrage
```
1. Sévérité minimale: HIGH
2. Cliquer "Test INFO" → Pas de notification ✅
3. Cliquer "Test HIGH" → Notification ✅
```

### Test 5: Configuration
```
1. Désactiver "Sound Alerts"
2. Cliquer "Save Changes"
3. Cliquer "Test CRITICAL"
4. Vérifier: Pas de son ✅
5. Vérifier: Toast affiché ✅
```

---

## 🐛 TROUBLESHOOTING

### Problème: Pas de son
**Solutions**:
1. Vérifier que "Sound Alerts" est activé
2. Vérifier le volume (> 0%)
3. Vérifier le volume système
4. Tester dans un autre navigateur
5. Vérifier la console (F12) pour erreurs

### Problème: Pas de notification desktop
**Solutions**:
1. Cliquer "Grant Permission"
2. Vérifier les paramètres du navigateur
3. Chrome: chrome://settings/content/notifications
4. Firefox: about:preferences#privacy
5. Autoriser les notifications pour localhost

### Problème: Toast ne s'affiche pas
**Solutions**:
1. Vérifier que "In-App Notifications" est activé
2. Vérifier la console (F12) pour erreurs
3. Rafraîchir la page (Ctrl+F5)
4. Vérifier que sonner est installé: `npm list sonner`

### Problème: Configuration ne se sauvegarde pas
**Solutions**:
1. Vérifier localStorage: F12 → Application → Local Storage
2. Vérifier que le bouton "Save Changes" apparaît
3. Cliquer explicitement sur "Save Changes"
4. Rafraîchir la page et vérifier

---

## 📊 VÉRIFICATION FINALE

### Checklist
- [ ] Frontend démarre sans erreur
- [ ] Page /settings/notifications accessible
- [ ] Test INFO fonctionne
- [ ] Test MEDIUM fonctionne
- [ ] Test HIGH fonctionne
- [ ] Test CRITICAL fonctionne
- [ ] Sons jouent (ou beeps synthétiques)
- [ ] Toasts s'affichent
- [ ] Desktop notifications (si permission)
- [ ] Configuration se sauvegarde
- [ ] Filtrage par sévérité fonctionne
- [ ] Volume ajustable

### Si tout est ✅
**Félicitations! Le système de notifications est opérationnel! 🎉**

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consulter:
- `NOTIFICATION_SYSTEM_BUILD_COMPLETE.md` - Documentation technique
- `DOCUMENTATION_CARTE_3D_ALARMES.md` - Intégration avec les cartes
- `BUILD_SUMMARY_COMPLETE.md` - Résumé complet

---

## 🆘 BESOIN D'AIDE?

### Console Browser (F12)
```javascript
// Tester manuellement
import { notificationOrchestrator } from '@/lib/notifications';

notificationOrchestrator.testNotification('CRITICAL');
```

### Vérifier l'installation
```bash
cd frontend
npm list sonner framer-motion lucide-react
```

### Réinstaller si nécessaire
```bash
cd frontend
npm install sonner framer-motion lucide-react --force
```

---

## 🎉 PROCHAINES ÉTAPES

1. ✅ Système testé et fonctionnel
2. ⏳ Intégrer dans World Monitor
3. ⏳ Intégrer dans Threat Monitor
4. ⏳ Ajouter sons personnalisés
5. ⏳ Backend Email/Slack

---

**Temps total**: ~10 minutes  
**Difficulté**: ⭐⭐☆☆☆ (Facile)  
**Statut**: ✅ **READY TO USE**

---

*🛡️ BOUCLIER - Advanced Notification System*  
*Quick Start Guide*
