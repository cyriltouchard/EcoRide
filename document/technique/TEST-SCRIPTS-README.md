# Scripts de Test EcoRide

## ⚠️  AVERTISSEMENT IMPORTANT

**Ces scripts sont destinés UNIQUEMENT au développement et aux tests.**

**NE JAMAIS exécuter ces scripts en environnement de production !**

---

## 📋 Scripts disponibles

### `create-test-booking.js`
Crée une réservation de test terminée pour valider le système de notation.

**Utilisation :**
```bash
node server/create-test-booking.js
```

**Ce que fait ce script :**
- Crée un chauffeur de test avec des credentials prédéfinis
- Crée un véhicule de test
- Crée un trajet de test
- Crée une réservation terminée

---

## 🔒 Sécurité

### Données de test

Les données de test sont centralisées dans `server/config/test-data.js` et contiennent :

- **Credentials de test** : Hash bcrypt de "test123"
- **Emails de test** : chauffeur@ecoride.fr, passager@ecoride.fr
- **Données de véhicule** : Renault Zoé fictive
- **Données de trajet** : Paris → Lyon

### Protection contre l'exécution en production

Tous les scripts de test incluent une vérification automatique :

```javascript
ensureDevelopmentEnvironment()
```

Cette fonction :
1. ✅ Vérifie que `NODE_ENV !== 'production'`
2. ❌ Lance une erreur critique si exécuté en production
3. ⚠️  Avertit si `NODE_ENV` n'est pas défini

---

## 🛡️ Bonnes pratiques

### 1. Configuration de l'environnement

**Toujours définir NODE_ENV dans votre fichier `.env` :**

```env
NODE_ENV=development
```

### 2. Avant d'exécuter un script de test

```bash
# Vérifier l'environnement
echo $env:NODE_ENV  # Windows PowerShell
echo $NODE_ENV      # Linux/Mac

# Doit afficher: development
```

### 3. En production

**Assurez-vous que ces scripts ne sont PAS déployés :**

```bash
# Dans .gitignore ou .dockerignore
server/create-test-*.js
server/config/test-data.js
```

Ou si déployés, **bloquez leur exécution** via la vérification `NODE_ENV=production`.

---

## 📝 SonarQube S2068 - Hardcoded Passwords

### Pourquoi des passwords codés en dur ?

Les scripts de test contiennent des **hashes bcrypt de "test123"** codés en dur :

```javascript
passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456'
```

**Justification :**
- ✅ **Context approprié** : Scripts de développement uniquement
- ✅ **Hash bcrypt** : Pas de mot de passe en clair
- ✅ **Données factices** : Emails fictifs (@ecoride.fr)
- ✅ **Protection** : Vérification environnement avant exécution
- ✅ **Documentation** : Commentaires explicites dans le code

### Marquage SonarQube

Ces points chauds S2068 dans les fichiers de test peuvent être marqués comme :

- **"Safe"** si protégés par `ensureDevelopmentEnvironment()`
- **"Won't Fix"** avec justification : "Test data - Development only"

### Alternative recommandée

Pour une sécurité maximale, utiliser des variables d'environnement :

```env
# .env.test
TEST_DRIVER_PASSWORD_HASH=$2a$10$abcdefghijklmnopqrstuvwxyz123456
```

```javascript
passwordHash: process.env.TEST_DRIVER_PASSWORD_HASH
```

---

## 🔄 Maintenance

### Mise à jour des données de test

Modifiez uniquement `server/config/test-data.js`.

### Ajout d'un nouveau script de test

1. Importer `ensureDevelopmentEnvironment()`
2. Appeler la fonction en début de script
3. Utiliser les constantes de `test-data.js`
4. Documenter dans ce README

---

## ✅ Checklist de sécurité

Avant de commiter un script de test :

- [ ] Import de `ensureDevelopmentEnvironment()`
- [ ] Appel de la fonction en début de script
- [ ] Utilisation des constantes de `test-data.js`
- [ ] Commentaires ⚠️  ATTENTION en haut du fichier
- [ ] Documentation dans ce README
- [ ] Pas de credentials réels
- [ ] Emails fictifs uniquement (@ecoride.fr ou @test.com)

---

## 📚 Ressources

- [Bcrypt - Password Hashing](https://www.npmjs.com/package/bcrypt)
- [SonarQube S2068](https://rules.sonarsource.com/javascript/RSPEC-2068)
- [OWASP - Credential Management](https://owasp.org/www-project-top-ten/)

---

**Dernière mise à jour :** 12 novembre 2025  
**Responsable :** Équipe de développement EcoRide
