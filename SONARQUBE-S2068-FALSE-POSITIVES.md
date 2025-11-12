# Configuration SonarQube - Exclusions de faux positifs
# Ce fichier documente les faux positifs S2068 (Hard-coded passwords)

## Contexte

Le projet EcoRide contient plusieurs occurrences de SonarQube S2068 qui sont des **FAUX POSITIFS**.
Il ne s'agit PAS de mots de passe codés en dur, mais de validations de formulaire standard.

---

## Faux positifs S2068 identifiés

### 1. `public/js/pages/auth/creation-compte.js`

**Ligne détectée :**
```javascript
if (!doPasswordsMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
}
```

**Analyse :**
- ✅ **Pas de secret** : Aucun mot de passe réel n'est codé en dur
- ✅ **Validation formulaire** : Comparaison de deux champs saisis par l'utilisateur
- ✅ **Fonction dédiée** : `doPasswordsMatch()` extrait dans module validation
- ✅ **Documentation** : Commentaires explicites ajoutés

**Justification :**
Il s'agit d'une validation standard lors de l'inscription où l'utilisateur doit confirmer son mot de passe.
Les deux valeurs proviennent du formulaire HTML (`formData.password` et `formData.confirmPassword`).

**Statut :** SAFE - Marquer comme "Won't Fix" dans SonarQube

---

### 2. `server/create-test-booking.js`

**Ligne détectée :**
```javascript
passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456'
```

**Analyse :**
- ✅ **Script de test** : Uniquement pour développement
- ✅ **Hash bcrypt** : Pas de mot de passe en clair
- ✅ **Protection** : `ensureDevelopmentEnvironment()` empêche exécution en production
- ✅ **Documentation** : README dédié aux scripts de test
- ✅ **Données fictives** : Email @ecoride.fr, hash de "test123"

**Justification :**
Hash bcrypt de données de test dans un script de développement protégé contre l'exécution en production.
Voir `server/TEST-SCRIPTS-README.md` pour documentation complète.

**Statut :** SAFE - Marquer comme "Won't Fix" dans SonarQube

---

### 3. `server/config/test-data.js`

**Lignes détectées :**
```javascript
exports.TEST_DRIVER = {
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456'
};

exports.TEST_PASSENGER = {
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456'
};
```

**Analyse :**
- ✅ **Module de configuration test** : Données centralisées pour scripts de dev
- ✅ **Hash bcrypt** : Pas de mot de passe en clair
- ✅ **Protection** : Fonction `ensureDevelopmentEnvironment()` fournie
- ✅ **Documentation** : Commentaires ⚠️ explicites dans le fichier
- ✅ **Avertissements** : "NE JAMAIS UTILISER EN PRODUCTION"

**Justification :**
Module de configuration centralisé pour les données de test avec protections multiples.
Contient uniquement des hashes bcrypt de "test123" pour environnement de développement.

**Statut :** SAFE - Marquer comme "Won't Fix" dans SonarQube

---

## Configuration SonarQube recommandée

### Option 1 : Exclusion de fichiers dans sonar-project.properties

```properties
# Exclure les scripts de test de l'analyse S2068
sonar.issue.ignore.multicriteria=e1,e2

sonar.issue.ignore.multicriteria.e1.ruleKey=javascript:S2068
sonar.issue.ignore.multicriteria.e1.resourceKey=server/create-test-*.js

sonar.issue.ignore.multicriteria.e2.ruleKey=javascript:S2068
sonar.issue.ignore.multicriteria.e2.resourceKey=server/config/test-data.js
```

### Option 2 : Commentaire NoSonar (déconseillé ici)

```javascript
// Ne PAS utiliser - Préférer marquage manuel dans dashboard SonarQube
passwordHash: '$2a$10$abc...' // NOSONAR - Test data, not real credential
```

### Option 3 : Marquage manuel dans SonarQube (RECOMMANDÉ)

1. Ouvrir le dashboard SonarQube
2. Aller dans "Security Hotspots"
3. Pour chaque occurrence :
   - Cliquer sur "Review"
   - Sélectionner "Safe"
   - Justification : "Form validation - no hardcoded password" ou "Test data - development only"
   - Marquer comme "Won't Fix"

---

## Vérifications effectuées

- [x] Aucun mot de passe réel en clair dans le code
- [x] Aucune clé API réelle
- [x] Aucun token d'authentification réel
- [x] Scripts de test protégés par vérification environnement
- [x] Documentation complète des cas légitimes
- [x] Commentaires explicatifs dans le code
- [x] Modules de validation sécurisés créés

---

## Ressources

- [SonarQube S2068](https://rules.sonarsource.com/javascript/RSPEC-2068)
- [OWASP - Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- `server/TEST-SCRIPTS-README.md` - Documentation scripts de test
- `public/js/common/validation.js` - Module de validation sécurisé

---

**Dernière mise à jour :** 12 novembre 2025  
**Responsable :** Équipe de développement EcoRide
