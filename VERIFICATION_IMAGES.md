# Guide de Vérification - Images Storage

## ✅ Les Policies sont Créées !

**15 policies Storage créées avec succès.**

Maintenant, vérifions que tout fonctionne correctement.

---

## 🔍 Étape 1 : Vérifier dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **Taybo**
3. Allez dans **Storage** > **Policies**
4. Vérifiez que vous voyez bien **15 policies** listées

---

## 🌐 Étape 2 : Vérifier dans l'Application

### Test 1 : Page d'Accueil

1. **Ouvrez votre application** :
   - En développement : http://localhost:5173
   - En production : votre URL de production

2. **Videz le cache du navigateur** :
   - **Windows/Linux** : Ctrl+F5
   - **Mac** : Cmd+Shift+R

3. **Vérifiez la page d'accueil** :
   - Les images des restaurants devraient s'afficher
   - Plus d'icônes cassées ou d'images manquantes

### Test 2 : Console du Navigateur

1. **Ouvrez les outils de développement** :
   - Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
   - Allez dans l'onglet **Console**

2. **Vérifiez les erreurs** :
   - ❌ **Avant** : Erreurs 403 (Forbidden) pour les images
   - ✅ **Maintenant** : Plus d'erreurs 403

3. **Vérifiez l'onglet Network** :
   - Allez dans l'onglet **Network**
   - Filtrez par **Img**
   - Les images devraient avoir un statut **200** (OK) au lieu de **403**

---

## 🧪 Étape 3 : Tests Fonctionnels

### Test Upload Image Restaurant

1. **Connectez-vous en tant que restaurant**
2. **Allez dans les paramètres du restaurant**
3. **Essayez d'uploader une nouvelle image**
4. ✅ L'upload devrait fonctionner sans erreur

### Test Upload Image Menu

1. **Dans la gestion du menu**
2. **Ajoutez une image à un plat**
3. ✅ L'image devrait s'afficher après l'upload

### Test Upload Image Profil

1. **Connectez-vous en tant qu'utilisateur**
2. **Allez dans votre profil**
3. **Changez votre photo de profil**
4. ✅ La nouvelle photo devrait s'afficher

---

## ✅ Résultats Attendus

### ✅ Succès

- Images des restaurants visibles sur la page d'accueil
- Plus d'erreurs 403 dans la console
- Upload d'images fonctionne
- Images se chargent rapidement

### ❌ Si ça ne fonctionne toujours pas

1. **Vérifiez que les buckets existent** :
   - Supabase Dashboard > Storage > Buckets
   - Les 4 buckets doivent exister :
     - `restaurant-images` (Public)
     - `menu-images` (Public)
     - `user-images` (Public)
     - `passports` (Private)

2. **Vérifiez que les buckets sont publics** :
   - `restaurant-images`, `menu-images`, `user-images` doivent être marqués comme **Public**
   - `passports` doit être **Private**

3. **Vérifiez les policies** :
   - Supabase Dashboard > Storage > Policies
   - Vous devriez voir 15 policies

4. **Videz complètement le cache** :
   - Fermez complètement le navigateur
   - Rouvrez-le
   - Ou utilisez le mode navigation privée

5. **Vérifiez les logs Supabase** :
   - Supabase Dashboard > Logs > Postgres
   - Cherchez des erreurs récentes

---

## 📊 Checklist Complète

- [x] 15 policies créées dans Supabase
- [ ] Images se chargent sur la page d'accueil
- [ ] Plus d'erreurs 403 dans la console
- [ ] Images ont un statut 200 dans Network
- [ ] Upload d'images restaurant fonctionne
- [ ] Upload d'images menu fonctionne
- [ ] Upload d'images profil fonctionne

---

## 🎯 Si Tout Fonctionne

✅ **Parfait ! Les policies Storage sont correctement configurées.**

Vous pouvez maintenant :
1. Continuer à utiliser l'application normalement
2. Passer au déploiement des Edge Functions
3. Exécuter les tests E2E pour vérifier que tout fonctionne

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Consultez `SOLUTION_ERREUR_STORAGE_POLICIES.md`
2. Vérifiez les logs Supabase
3. Vérifiez la console du navigateur pour les erreurs spécifiques

---

**Les policies sont créées. Maintenant, testez votre application ! 🚀**

