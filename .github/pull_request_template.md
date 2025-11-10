# 🔄 Pull Request

## 🎯 Description

<!-- Décrivez brièvement les changements apportés par cette PR -->

## 🔗 Issue Liée

<!-- Référencez l'issue liée si applicable -->
Closes #(numéro de l'issue)
<!-- ou -->
Related to #(numéro de l'issue)

## 📋 Type de Changement

<!-- Cochez les cases pertinentes -->

- [ ] 🐛 Correction de bug (fix)
- [ ] ✨ Nouvelle fonctionnalité (feature)
- [ ] 📖 Documentation (docs)
- [ ] 🎨 Style / UI (style)
- [ ] ♻️ Refactoring (refactor)
- [ ] ⚡ Performance (perf)
- [ ] ✅ Tests (test)
- [ ] 🔒 Sécurité (security)
- [ ] 🔧 Configuration (chore)

## 📝 Changements Détaillés

<!-- Listez les modifications principales -->

- 
- 
- 

## 🧪 Tests Effectués

<!-- Décrivez les tests que vous avez effectués -->

- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests d'intégration ajoutés/modifiés
- [ ] Tests manuels effectués
- [ ] Tous les tests passent (`npm test`)
- [ ] Scan de sécurité effectué (`npm run security-check`)

### Scénarios Testés

1. **Scénario 1** : 
   - Action : 
   - Résultat attendu : 
   - Résultat obtenu : ✅

2. **Scénario 2** : 
   - Action : 
   - Résultat attendu : 
   - Résultat obtenu : ✅

## 📸 Screenshots / Vidéos

<!-- Si changements UI/UX, ajoutez des captures d'écran -->

### Avant
<!-- Screenshot de l'état avant -->

### Après
<!-- Screenshot de l'état après -->

## ✅ Checklist

<!-- Vérifiez tous les points avant de soumettre la PR -->

### Code
- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté le code là où nécessaire
- [ ] Pas de code commenté inutile
- [ ] Pas de `console.log` en production
- [ ] Gestion des erreurs appropriée

### Tests
- [ ] J'ai ajouté des tests qui prouvent que mon correctif/feature fonctionne
- [ ] Les tests unitaires passent localement (`npm test`)
- [ ] Les tests existants passent toujours
- [ ] Coverage de tests maintenu ou amélioré

### Documentation
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai mis à jour le CHANGELOG.md
- [ ] J'ai mis à jour le README si nécessaire
- [ ] J'ai ajouté des commentaires JSDoc si applicable

### Sécurité
- [ ] Aucun secret ou mot de passe hardcodé
- [ ] Validation des entrées utilisateur
- [ ] Protection contre les injections (SQL/NoSQL)
- [ ] Scan de sécurité passé
- [ ] Dépendances à jour (`npm audit`)

### Base de Données
- [ ] Scripts de migration inclus si nécessaire
- [ ] Pas de perte de données
- [ ] Requêtes optimisées
- [ ] Index appropriés

### Performance
- [ ] Pas de régression de performance
- [ ] Code optimisé
- [ ] Pas de N+1 queries
- [ ] Assets optimisés (images, etc.)

## 🔍 Checklist pour le Reviewer

<!-- Points à vérifier lors de la review -->

- [ ] Le code est lisible et maintenable
- [ ] La logique métier est correcte
- [ ] Les tests couvrent les cas d'usage importants
- [ ] La documentation est claire et à jour
- [ ] Pas de régression fonctionnelle
- [ ] Performance acceptable
- [ ] Sécurité vérifiée
- [ ] Conventions de code respectées

## 📝 Notes pour le Reviewer

<!-- Informations supplémentaires pour faciliter la review -->

### Points d'Attention

- 
- 

### Questions

- 
- 

## 🚀 Déploiement

<!-- Si applicable, instructions de déploiement -->

- [ ] Migrations de base de données nécessaires
- [ ] Variables d'environnement à ajouter/modifier
- [ ] Configuration serveur à modifier
- [ ] Cache à vider

### Variables d'Environnement

```bash
# Nouvelles variables à ajouter dans .env
NOUVELLE_VAR=valeur
```

## 📊 Impact

<!-- Évaluez l'impact de ces changements -->

- **Impact utilisateur** : 🟢 Faible / 🟡 Moyen / 🔴 Élevé
- **Impact performance** : 🟢 Amélioration / 🟡 Neutre / 🔴 Dégradation
- **Breaking changes** : ✅ Non / ❌ Oui

### Breaking Changes

<!-- Si oui, décrivez-les -->

## 📚 Ressources

<!-- Liens utiles pour comprendre les changements -->

- [Lien vers documentation](url)
- [Lien vers design/mockup](url)
- [Lien vers issue/discussion](url)

## 🙏 Remerciements

<!-- Mentionnez les personnes qui ont aidé -->

---

**⚠️ Rappel** : Ne pas merger tant que tous les checks ne sont pas verts ! ✅
