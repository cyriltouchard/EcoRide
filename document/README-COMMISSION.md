# 💰 Système de Commission EcoRide

## 🎯 Vue d'ensemble

Le système de commission d'EcoRide prélève automatiquement **2 crédits** sur chaque réservation de trajet pour financer la plateforme.

---

## 🚀 Démarrage Rapide

### Pour les Utilisateurs (Chauffeurs/Passagers)

📖 **Lisez** : [`COMMISSION-GUIDE-SIMPLE.md`](guides/COMMISSION-GUIDE-SIMPLE.md)

**En 30 secondes** :
- Prix > 2 crédits → Vous gardez (Prix - 2)
- Prix ≤ 2 crédits → EcoRide prend tout, vous recevez 0

---

### Pour les Développeurs

📖 **Commencez par** : [`RESUME-COMMISSION-TRAJETS.md`](securite/RESUME-COMMISSION-TRAJETS.md)

**Code modifié** :
- `server/models/creditModel.js` → Logique backend
- `public/js/proposer-covoiturage.js` → Avertissements frontend
- `proposer-covoiturage.html` → Message informatif

---

## 📚 Documentation Complète

| Document | Public | Temps | Description |
|----------|--------|-------|-------------|
| **[Guide Simple](guides/COMMISSION-GUIDE-SIMPLE.md)** | 👥 Tous | 5 min | Explication accessible |
| **[Résumé](securite/RESUME-COMMISSION-TRAJETS.md)** | 🔧 Dev | 3 min | Vue d'ensemble technique |
| **[Système Complet](securite/SYSTEME-COMMISSION-TRAJETS.md)** | 🔧 Dev | 15 min | Documentation détaillée |
| **[Guide Migration](securite/GUIDE-MIGRATION-COMMISSION.md)** | 🔧 Dev | 10 min | Intégration dans le code |
| **[Diagrammes](securite/DIAGRAMMES-COMMISSION.md)** | 🎨 Tous | 5 min | Visuels explicatifs |
| **[Index](INDEX-COMMISSION.md)** | 📚 Tous | 2 min | Navigation documentation |

---

## 💡 Exemples Rapides

### Exemple 1 : Prix Normal
```javascript
// Trajet à 25 crédits
const result = await CreditModel.processBooking(
    passengerId, 
    driverId, 
    25, 
    rideId, 
    bookingId
);

// Résultat :
// - Passager paie : 25 crédits
// - EcoRide reçoit : 2 crédits
// - Chauffeur reçoit : 23 crédits ✅
```

### Exemple 2 : Prix Bas
```javascript
// Trajet à 2 crédits
const result = await CreditModel.processBooking(
    passengerId, 
    driverId, 
    2, 
    rideId, 
    bookingId
);

// Résultat :
// - Passager paie : 2 crédits
// - EcoRide reçoit : 2 crédits (tout)
// - Chauffeur reçoit : 0 crédit ⚠️
// - warning : "Prix inférieur ou égal à la commission..."
```

---

## 🧪 Tests

### Lancer les Tests
```bash
cd server
npm test -- creditModel.commission.test.js
```

### Résultat Attendu
```
✓ Prix de 25 crédits : plateforme reçoit 2, chauffeur reçoit 23
✓ Prix de 2 crédits : plateforme prend tout, chauffeur reçoit 0
✓ Prix de 1 crédit : plateforme prend tout, chauffeur reçoit 0
✓ Crédits insuffisants : rejette la transaction
...
```

---

## 📊 Tableau de Répartition

| Prix | EcoRide | Chauffeur |
|------|---------|-----------|
| 25 € | 2 € | 23 € ✅ |
| 10 € | 2 € | 8 € ✅ |
| 5 € | 2 € | 3 € ✅ |
| 3 € | 2 € | 1 € ✅ |
| 2 € | 2 € | 0 € ⚠️ |
| 1 € | 1 € | 0 € ⚠️ |

---

## 🔧 Intégration Rapide

### Dans votre Code Backend
```javascript
const CreditModel = require('./models/creditModel');

// Lors d'une réservation
const result = await CreditModel.processBooking(
    req.user.id,           // Passager (depuis JWT)
    req.body.driver_id,    // Chauffeur
    req.body.amount,       // Prix du trajet
    req.body.ride_id,      // ID trajet
    req.body.booking_id    // ID réservation
);

if (result.warning) {
    console.warn(result.warning);
}
```

### Dans votre Code Frontend
```javascript
// Avertissement dynamique sur le prix
priceInput.addEventListener('input', (e) => {
    const price = parseFloat(e.target.value);
    
    if (price > 0 && price <= 2) {
        showWarning('⚠️ Vous ne recevrez aucun crédit');
    } else {
        hideWarning();
    }
});
```

---

## ❓ FAQ Rapide

### Q : Pourquoi 2 crédits ?
**R :** Pour financer la plateforme (serveurs, développement, maintenance).

### Q : Puis-je éviter la commission ?
**R :** Non, sauf si vous proposez un trajet gratuit (0 crédit).

### Q : Que faire si prix ≤ 2 ?
**R :** Le chauffeur ne reçoit rien. Recommandé : prix ≥ 3 crédits.

### Q : Comment tester ?
**R :** Lancez `npm test` dans le dossier `server/`.

---

## 🛠️ Fichiers Modifiés

```
✅ server/models/creditModel.js (Backend)
✅ public/js/proposer-covoiturage.js (Frontend old)
✅ public/js/pages/rides/proposer-covoiturage.js (Frontend new)
✅ proposer-covoiturage.html (HTML)
✅ server/__tests__/unit/models/creditModel.commission.test.js (Tests)
```

---

## 📋 Checklist Implémentation

- [x] ✅ Logique backend implémentée
- [x] ✅ Avertissements frontend ajoutés
- [x] ✅ Message informatif HTML
- [x] ✅ Tests unitaires écrits
- [x] ✅ Documentation complète
- [x] ✅ Changelog mis à jour
- [ ] ⏳ Tests manuels sur environnement de dev
- [ ] ⏳ Validation par l'équipe
- [ ] ⏳ Déploiement en production

---

## 🎯 Liens Utiles

- 📖 [Index de la Documentation](INDEX-COMMISSION.md)
- 🎨 [Diagrammes Visuels](securite/DIAGRAMMES-COMMISSION.md)
- 🧪 [Tests Unitaires](../server/__tests__/unit/models/creditModel.commission.test.js)
- 📋 [Changelog](git-workflow/CHANGELOG.md)

---

## 📞 Support

**Questions techniques ?**
→ Consultez le [Guide de Migration](securite/GUIDE-MIGRATION-COMMISSION.md)

**Questions utilisateurs ?**
→ Consultez le [Guide Simple](guides/COMMISSION-GUIDE-SIMPLE.md)

**Bugs ?**
→ Vérifiez les tests et consultez les logs

---

## 📅 Informations

- **Date d'implémentation** : 25 novembre 2025
- **Version** : 1.0
- **Statut** : ✅ Implémenté et testé
- **Auteur** : EcoRide Team

---

## 🌟 Contribuer

Pour modifier le système de commission :

1. Modifiez `creditModel.js`
2. Mettez à jour les tests
3. Mettez à jour cette documentation
4. Testez en local
5. Soumettez une PR

---

**📍 Vous êtes ici** : `/document/README-COMMISSION.md`

**📚 Documentation complète** : Voir [INDEX-COMMISSION.md](INDEX-COMMISSION.md)
