# 📚 Index Documentation - Système de Commission

## 🎯 Documentation Disponible

Cette documentation explique le système de commission de 2 crédits par trajet mis en place dans EcoRide.

---

## 📂 Pour les Utilisateurs

### 🌟 Guide Simple (Débutants)
📄 **Fichier** : `document/guides/COMMISSION-GUIDE-SIMPLE.md`

**Pour qui ?** Chauffeurs et passagers non techniques

**Contenu** :
- Explication simple de la commission
- Exemples concrets
- Tableaux de répartition
- Questions fréquentes

**Durée de lecture** : 5 minutes

---

## 📂 Pour les Développeurs

### 🔧 Guide Technique Complet
📄 **Fichier** : `document/securite/SYSTEME-COMMISSION-TRAJETS.md`

**Pour qui ?** Développeurs backend/frontend

**Contenu** :
- Règles de commission détaillées
- Implémentation backend (creditModel.js)
- Avertissements frontend
- Structure base de données
- Tests et validation
- Notes de version

**Durée de lecture** : 15 minutes

---

### 📝 Résumé des Modifications
📄 **Fichier** : `document/securite/RESUME-COMMISSION-TRAJETS.md`

**Pour qui ?** Développeurs souhaitant une vue d'ensemble rapide

**Contenu** :
- Liste des fichiers modifiés
- Résumé des changements
- Tableau de répartition
- Guide de test

**Durée de lecture** : 3 minutes

---

### 🔄 Guide de Migration
📄 **Fichier** : `document/securite/GUIDE-MIGRATION-COMMISSION.md`

**Pour qui ?** Développeurs intégrant le système

**Contenu** :
- Détails techniques de `processBooking()`
- Cas d'usage avec code
- Gestion des erreurs
- Intégration avec routes
- Points d'attention

**Durée de lecture** : 10 minutes

---

### 📊 Diagrammes et Visuels
📄 **Fichier** : `document/securite/DIAGRAMMES-COMMISSION.md`

**Pour qui ?** Tous (visuels explicatifs)

**Contenu** :
- Diagrammes Mermaid
- Flux de paiement
- Schémas base de données
- Graphiques de revenus
- Interfaces utilisateur

**Durée de lecture** : 5 minutes

---

## 📂 Tests

### 🧪 Tests Unitaires
📄 **Fichier** : `server/__tests__/unit/models/creditModel.commission.test.js`

**Pour qui ?** Développeurs testant le système

**Contenu** :
- Tests prix > 2 crédits
- Tests prix ≤ 2 crédits
- Tests gestion d'erreurs
- Tests intégrité transactions

**Comment lancer** :
```bash
cd server
npm test -- creditModel.commission.test.js
```

---

## 📂 Historique

### 📋 Changelog
📄 **Fichier** : `document/git-workflow/CHANGELOG.md`

**Section** : [Unreleased] - Système de Commission

**Contenu** :
- Date d'implémentation
- Liste des ajouts
- Fichiers modifiés
- Documentation créée

---

## 🗺️ Navigation Rapide

### Par Niveau de Compétence

#### 🌟 Débutant (Utilisateurs)
1. → `COMMISSION-GUIDE-SIMPLE.md`
2. → `DIAGRAMMES-COMMISSION.md` (partie visuels)

#### 🔧 Intermédiaire (Développeurs)
1. → `RESUME-COMMISSION-TRAJETS.md`
2. → `GUIDE-MIGRATION-COMMISSION.md`
3. → `SYSTEME-COMMISSION-TRAJETS.md`

#### 🚀 Avancé (Architectes)
1. → `SYSTEME-COMMISSION-TRAJETS.md`
2. → `creditModel.js` (code source)
3. → Tests unitaires

---

### Par Besoin

#### 💡 "Je veux comprendre rapidement"
→ `RESUME-COMMISSION-TRAJETS.md` (3 min)

#### 🎓 "Je suis chauffeur/passager"
→ `COMMISSION-GUIDE-SIMPLE.md` (5 min)

#### 🔨 "Je dois implémenter dans mon code"
→ `GUIDE-MIGRATION-COMMISSION.md` (10 min)

#### 📚 "Je veux tout savoir"
→ `SYSTEME-COMMISSION-TRAJETS.md` (15 min)

#### 🎨 "Je préfère les visuels"
→ `DIAGRAMMES-COMMISSION.md` (5 min)

#### 🧪 "Je veux tester"
→ `creditModel.commission.test.js`

---

## 📁 Arborescence Complète

```
EcoRide/
├── document/
│   ├── guides/
│   │   └── COMMISSION-GUIDE-SIMPLE.md          [👥 Utilisateurs]
│   │
│   ├── securite/
│   │   ├── SYSTEME-COMMISSION-TRAJETS.md       [🔧 Technique complet]
│   │   ├── RESUME-COMMISSION-TRAJETS.md        [📝 Résumé rapide]
│   │   ├── GUIDE-MIGRATION-COMMISSION.md       [🔄 Guide intégration]
│   │   └── DIAGRAMMES-COMMISSION.md            [📊 Visuels]
│   │
│   └── git-workflow/
│       └── CHANGELOG.md                         [📋 Historique]
│
├── server/
│   ├── models/
│   │   └── creditModel.js                       [⚙️ Code source]
│   │
│   └── __tests__/
│       └── unit/
│           └── models/
│               └── creditModel.commission.test.js [🧪 Tests]
│
└── public/
    └── js/
        ├── proposer-covoiturage.js              [🎨 Frontend old]
        └── pages/
            └── rides/
                └── proposer-covoiturage.js      [🎨 Frontend new]
```

---

## 🔍 Recherche par Mot-clé

| Mot-clé | Où chercher |
|---------|-------------|
| **Commission** | Tous les documents |
| **processBooking** | Guide Migration, Système Complet |
| **Prix bas** | Guide Simple, Tests |
| **Avertissement** | Système Complet, Frontend |
| **Transactions** | Système Complet, Diagrammes |
| **Tests** | Tests unitaires |
| **Exemples** | Guide Simple, Diagrammes |

---

## 📖 Glossaire Rapide

| Terme | Définition |
|-------|------------|
| **Commission** | 2 crédits prélevés par EcoRide sur chaque trajet |
| **Prix bas** | Prix ≤ 2 crédits (cas particulier) |
| **processBooking()** | Fonction backend gérant la répartition |
| **Transaction** | Enregistrement MySQL d'un mouvement de crédits |
| **Avertissement** | Message frontend si prix ≤ 2 |

---

## 🎯 Parcours Recommandés

### 🚀 Quick Start (10 minutes)
1. `RESUME-COMMISSION-TRAJETS.md`
2. `DIAGRAMMES-COMMISSION.md` (partie flux)
3. Test manuel sur l'interface

### 📚 Formation Complète (30 minutes)
1. `COMMISSION-GUIDE-SIMPLE.md`
2. `SYSTEME-COMMISSION-TRAJETS.md`
3. `GUIDE-MIGRATION-COMMISSION.md`
4. Lancer les tests

### 🔧 Développeur Pressé (5 minutes)
1. `RESUME-COMMISSION-TRAJETS.md`
2. Lire le code dans `creditModel.js`
3. GO !

---

## 📞 Support

### Questions sur l'utilisation ?
→ Consultez `COMMISSION-GUIDE-SIMPLE.md`

### Questions techniques ?
→ Consultez `GUIDE-MIGRATION-COMMISSION.md`

### Bug ou problème ?
→ Vérifiez les tests unitaires et les logs

### Documentation manquante ?
→ Contactez l'équipe de développement

---

## ✅ Checklist Validation

Avant de considérer que vous maîtrisez le système, vérifiez :

- [ ] Je comprends la règle des 2 crédits
- [ ] Je sais ce qui se passe si prix ≤ 2
- [ ] J'ai lu au moins un guide complet
- [ ] J'ai regardé les diagrammes
- [ ] J'ai lancé les tests (dev uniquement)
- [ ] Je peux expliquer le système à un utilisateur

---

## 🎓 Niveaux de Maîtrise

### Niveau 1 - Utilisateur ⭐
- Comprend la commission de 2 crédits
- Sait qu'il faut éviter prix ≤ 2

**Document clé** : Guide Simple

---

### Niveau 2 - Développeur ⭐⭐
- Connaît `processBooking()`
- Sait intégrer dans son code
- Comprend les transactions MySQL

**Documents clés** : Résumé + Guide Migration

---

### Niveau 3 - Expert ⭐⭐⭐
- Maîtrise toute l'architecture
- Peut modifier le système
- Sait écrire de nouveaux tests

**Documents clés** : Tous + Code source

---

## 📊 Statistiques Documentation

| Type | Nombre | Pages équivalentes |
|------|--------|-------------------|
| Guides utilisateurs | 1 | 5 |
| Guides techniques | 3 | 20 |
| Diagrammes | 1 | 10 |
| Tests | 1 | 5 |
| **TOTAL** | **6** | **≈40 pages** |

---

## 🔄 Mise à Jour

Cette documentation a été créée le **25 novembre 2025**.

Pour toute modification du système de commission, pensez à mettre à jour :
1. ✅ Le code (`creditModel.js`)
2. ✅ Les tests
3. ✅ Cette documentation
4. ✅ Le CHANGELOG
5. ✅ Les avertissements frontend

---

**Version de l'Index** : 1.0  
**Dernière mise à jour** : 25 novembre 2025  
**Mainteneur** : EcoRide Team
