# Guide Étape par Étape - Déploiement et Tests

**Date** : Aujourd'hui

Ce guide vous accompagne pour :
1. ✅ Appliquer la migration Storage
2. ✅ Déployer les Edge Functions
3. ✅ Exécuter les tests

---

## 📋 Étape 1 : Appliquer la Migration Storage (5 minutes)

### Objectif
Résoudre le problème d'images qui ne se chargent pas en configurant les permissions Storage.

### Instructions

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet "Taybo"
   - Cliquez sur **SQL Editor** dans le menu de gauche

2. **Copier la Migration**
   - Ouvrez le fichier : `supabase/migrations/016_setup_storage_policies.sql`
   - Sélectionnez tout le contenu (Ctrl+A ou Cmd+A)
   - Copiez (Ctrl+C ou Cmd+C)

3. **Exécuter la Migration**
   - Collez le contenu dans le SQL Editor de Supabase (Ctrl+V ou Cmd+V)
   - Cliquez sur le bouton **"Run"** (ou appuyez sur F5)
   - ✅ Vérifiez qu'il affiche "Success" (pas d'erreurs en rouge)

4. **Vérifier le Résultat**
   - Retournez sur votre application (http://localhost:5173)
   - **Rafraîchissez la page** (Ctrl+F5 ou Cmd+Shift+R)
   - ✅ Les images devraient maintenant se charger !

### ⚠️ Si vous obtenez une erreur

**Erreur "must be owner of relation objects"** :
- Cela signifie que vous n'avez pas les permissions nécessaires pour créer des policies Storage via SQL
- **Solution** : Créez les policies via l'interface Supabase Dashboard
  - Allez dans **Storage** > **Policies**
  - Créez manuellement les policies selon le guide : `GUIDE_CREATION_POLICIES_STORAGE.md`

### ✅ Vérification

Après avoir appliqué la migration, vérifiez que :
- [ ] Aucune erreur dans le SQL Editor
- [ ] Les images se chargent sur la page d'accueil
- [ ] Aucune erreur dans la console navigateur (F12)

---

## 📋 Étape 2 : Déployer les Edge Functions (15 minutes)

### Objectif
Déployer les 4 Edge Functions de sécurité sur Supabase.

### Prérequis

1. **Installer Supabase CLI** (si pas déjà installé)
   ```bash
   npm install -g supabase
   ```

2. **Vérifier l'installation**
   ```bash
   supabase --version
   ```

### Instructions

1. **Se connecter à Supabase**
   ```bash
   supabase login
   ```
   - Cela ouvrira votre navigateur pour vous authentifier
   - Suivez les instructions à l'écran

2. **Lier votre projet**
   ```bash
   supabase link --project-ref votre-project-ref
   ```
   
   **Comment trouver votre project-ref ?**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet
   - L'URL sera : `https://supabase.com/dashboard/project/[VOTRE-PROJECT-REF]`
   - Ou allez dans **Settings** > **General** > **Reference ID**

3. **Déployer les Edge Functions**

   Déployez chaque fonction une par une :
   
   ```bash
   # 1. CSRF Token
   supabase functions deploy csrf-token
   
   # 2. Rate Limit
   supabase functions deploy rate-limit
   
   # 3. Validate Order
   supabase functions deploy validate-order
   
   # 4. Validate Payment
   supabase functions deploy validate-payment
   ```

   **Pour chaque fonction**, vous devriez voir :
   ```
   Deploying function csrf-token...
   Function csrf-token deployed successfully!
   ```

4. **Vérifier le Déploiement**

   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet
   - Allez dans **Edge Functions**
   - Vous devriez voir les 4 fonctions listées :
     - ✅ csrf-token
     - ✅ rate-limit
     - ✅ validate-order
     - ✅ validate-payment

### ⚠️ Si vous obtenez une erreur

**Erreur "Project not found"** :
- Vérifiez que vous avez utilisé le bon `project-ref`
- Vérifiez que vous êtes connecté avec le bon compte

**Erreur "Function not found"** :
- Vérifiez que les fichiers existent dans `supabase/functions/[nom-fonction]/index.ts`
- Vérifiez que vous êtes dans le répertoire racine du projet

**Erreur de déploiement** :
- Vérifiez que vous avez les permissions nécessaires sur le projet
- Vérifiez les logs dans Supabase Dashboard > Edge Functions > Logs

### ✅ Vérification

Après avoir déployé les fonctions, vérifiez que :
- [ ] Les 4 fonctions sont listées dans Supabase Dashboard
- [ ] Aucune erreur dans les logs de déploiement
- [ ] Les fonctions sont accessibles via leur URL

---

## 📋 Étape 3 : Exécuter les Tests (30 minutes)

### Objectif
Exécuter tous les tests pour identifier et corriger les bugs.

### Prérequis

1. **Installer les dépendances** (si pas déjà fait)
   ```bash
   npm install
   ```

2. **Vérifier que l'application peut démarrer**
   ```bash
   npm run dev
   ```
   - L'application devrait démarrer sur http://localhost:5173
   - Arrêtez-la avec Ctrl+C

### Instructions

#### 3.1 Tests Unitaires

1. **Exécuter les tests unitaires**
   ```bash
   npm run test
   ```

2. **Voir les résultats**
   - Les tests s'exécutent automatiquement
   - Vous verrez les résultats dans le terminal
   - Les tests qui échouent seront marqués en rouge

3. **Tests avec interface graphique** (optionnel)
   ```bash
   npm run test:ui
   ```
   - Ouvre une interface graphique dans le navigateur
   - Plus facile pour déboguer les tests

4. **Tests avec couverture** (optionnel)
   ```bash
   npm run test:coverage
   ```
   - Génère un rapport de couverture de code
   - Montre quelles parties du code sont testées

#### 3.2 Tests E2E (End-to-End)

Les tests E2E nécessitent que l'application soit en cours d'exécution.

**Option A : Tests automatiques** (recommandé)

```bash
npm run test:e2e
```

- Playwright démarre automatiquement l'application
- Exécute tous les tests E2E
- Génère un rapport HTML à la fin

**Option B : Tests avec interface graphique**

```bash
npm run test:e2e:ui
```

- Ouvre l'interface graphique de Playwright
- Permet de voir les tests s'exécuter en temps réel
- Utile pour déboguer

**Option C : Tests manuels** (si les tests automatiques ne fonctionnent pas)

1. **Démarrer l'application** (dans un terminal)
   ```bash
   npm run dev
   ```

2. **Exécuter les tests** (dans un autre terminal)
   ```bash
   npm run test:e2e
   ```

### Fichiers de Tests

**Tests unitaires** :
- `src/services/__tests__/notificationService.test.js`
- `src/services/__tests__/cacheService.test.js`
- `src/components/common/__tests__/Button.test.jsx`
- `src/components/common/__tests__/Input.test.jsx`
- `src/hooks/__tests__/useRealtimeOrders.test.js`
- `src/utils/__tests__/validation.test.js`

**Tests E2E** :
- `tests/e2e/order-flow.spec.js` - Test du parcours de commande complet
- `tests/e2e/restaurant-management.spec.js` - Test de gestion restaurant
- `tests/e2e/admin-validation.spec.js` - Test de validation admin

### ⚠️ Si vous obtenez une erreur

**Erreur "Cannot find module"** :
- Exécutez `npm install` pour installer les dépendances manquantes

**Erreur "Port already in use"** :
- Arrêtez l'application qui tourne déjà sur le port 5173
- Ou modifiez le port dans `vite.config.js`

**Tests E2E échouent** :
- Vérifiez que l'application démarre correctement (`npm run dev`)
- Vérifiez que les données de test existent dans Supabase
- Consultez les logs dans `tests/e2e/` pour plus de détails

### ✅ Vérification

Après avoir exécuté les tests, vérifiez que :
- [ ] Tous les tests unitaires passent (ou au moins la majorité)
- [ ] Les tests E2E passent (ou identifient les bugs à corriger)
- [ ] Aucune erreur critique dans les logs

---

## 📊 Résumé des Commandes

### Migration Storage
```bash
# Pas de commande - à faire manuellement dans Supabase Dashboard
# Voir Étape 1 ci-dessus
```

### Edge Functions
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Déployer les fonctions
supabase functions deploy csrf-token
supabase functions deploy rate-limit
supabase functions deploy validate-order
supabase functions deploy validate-payment
```

### Tests
```bash
# Tests unitaires
npm run test

# Tests avec interface graphique
npm run test:ui

# Tests avec couverture
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E avec interface graphique
npm run test:e2e:ui
```

---

## 🎯 Prochaines Étapes Après ces Actions

Une fois ces trois étapes complétées :

1. **Corriger les bugs trouvés** par les tests
2. **Déployer en production** sur Vercel
3. **Intégrer les systèmes de paiement** (Stripe, Paymob, Fawry)
4. **Optimiser les performances** supplémentaires

---

## 📚 Fichiers de Référence

- `INSTRUCTIONS_RESOLUTION_RAPIDE.md` - Solution rapide pour les images Storage
- `GUIDE_RESOLUTION_IMAGES_STORAGE.md` - Guide complet pour les images Storage
- `COMPTE_RENDU_PROCHAINES_ETAPES_DEPLOIEMENT.md` - Vue d'ensemble complète
- `SECURITY_AUDIT.md` - Audit de sécurité

---

**Bonne chance ! 🚀**

Si vous rencontrez des problèmes, consultez les fichiers de référence ou les guides de dépannage.

