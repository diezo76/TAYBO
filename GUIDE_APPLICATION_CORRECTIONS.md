# Guide d'Application des Corrections - TAYBO

## 🚀 Actions Requises Pour Finaliser

Voici les étapes à suivre pour que toutes les corrections prennent effet :

---

## 1️⃣ Appliquer les Migrations SQL

### Étape 1.1 : Migration 014 - Images de profil utilisateur

1. Ouvrez Supabase Dashboard : https://supabase.com/dashboard
2. Sélectionnez votre projet TAYBO
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Créez une nouvelle query
5. Copiez-collez le contenu de `supabase/migrations/014_add_user_image_url.sql`
6. Cliquez sur **Run** (Exécuter)
7. Vérifiez que la migration s'est exécutée sans erreur

### Étape 1.2 : Migration 015 - Correction politiques RLS

1. Toujours dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez-collez le contenu de `supabase/migrations/015_fix_rls_policies.sql`
4. Cliquez sur **Run** (Exécuter)
5. Vérifiez que la migration s'est exécutée sans erreur

**Note** : Si des erreurs apparaissent du type "policy already exists", c'est normal. Les migrations gèrent cela.

---

## 2️⃣ Créer le Bucket Storage `user-images`

1. Dans Supabase Dashboard, allez dans **Storage**
2. Cliquez sur **New bucket** (Nouveau bucket)
3. Remplissez les informations :
   - **Name** (Nom) : `user-images`
   - **Public bucket** : ✅ Cochez la case (OUI)
   - **File size limit** : `5242880` (5 MB en octets)
   - **Allowed MIME types** : `image/jpeg,image/png,image/webp`
4. Cliquez sur **Create bucket** (Créer)
5. Le bucket est créé ! ✅

---

## 3️⃣ Vérifier les Autres Buckets

Assurez-vous que ces buckets existent aussi :

### ✅ `restaurant-images` (Public)
- Public : ✅ Oui
- File size limit : 5 MB
- MIME types : `image/jpeg,image/png,image/webp`

### ✅ `menu-images` (Public)
- Public : ✅ Oui
- File size limit : 5 MB
- MIME types : `image/jpeg,image/png,image/webp`

### ✅ `passports` (Privé)
- Public : ❌ Non
- File size limit : 10 MB
- MIME types : `image/jpeg,image/png,application/pdf`

Si un bucket manque, créez-le avec les mêmes paramètres.

---

## 4️⃣ Redémarrer l'Application

Une fois les migrations et buckets créés :

```bash
# Dans le terminal, dans le dossier Taybo
npm run dev
```

L'application va redémarrer avec toutes les corrections appliquées ! 🎉

---

## 5️⃣ Tester les Corrections

### Test 1 : Images de Profil Utilisateur ✅

1. Connectez-vous en tant que client
2. Allez sur **Mon Profil** (`/client/profile`)
3. Cliquez sur l'icône caméra (coin bas-droit de l'avatar)
4. Sélectionnez une photo
5. ✅ La photo s'affiche immédiatement
6. Rafraîchissez la page → ✅ La photo reste

### Test 2 : Plus de Déconnexions ✅

1. Connectez-vous
2. Naviguez dans l'application
3. Attendez 5-10 minutes
4. ✅ Vous restez connecté !

### Test 3 : Images Restaurants et Menu ✅

1. Page d'accueil → ✅ Images restaurants visibles
2. Cliquez sur un restaurant → ✅ Images de plats visibles
3. Allez dans Favoris → ✅ Toutes les images visibles

### Test 4 : Console Sans Erreurs ✅

Ouvrez la console (F12) :
- ✅ Pas d'erreurs 406
- ✅ Pas d'erreurs 400
- ✅ Logs `[imageUtils]` et `[AuthContext]` visibles

---

## 📊 Checklist Finale

Avant de dire que tout est OK, vérifiez :

- [ ] Migration 014 appliquée dans Supabase
- [ ] Migration 015 appliquée dans Supabase
- [ ] Bucket `user-images` créé (public, 5MB max)
- [ ] Buckets `restaurant-images` et `menu-images` existent
- [ ] Bucket `passports` existe (privé)
- [ ] Application redémarrée (`npm run dev`)
- [ ] Test upload image de profil → OK
- [ ] Test navigation sans déconnexion → OK
- [ ] Images visibles partout → OK
- [ ] Console sans erreurs critiques → OK

---

## 🆘 En Cas de Problème

### Problème : Migration 014 échoue

**Solution** :
```sql
-- Essayez cette commande simplifiée
ALTER TABLE users ADD COLUMN image_url TEXT;
```

### Problème : Bucket `user-images` existe déjà

**Solution** : Parfait ! Passez à l'étape suivante.

### Problème : Les images ne s'affichent toujours pas

**Solution** :
1. Ouvrez la console (F12)
2. Cherchez les logs `[imageUtils]` pour voir l'URL générée
3. Copiez l'URL et testez-la directement dans le navigateur
4. Si l'URL ne fonctionne pas, vérifiez que le bucket est bien **PUBLIC**

### Problème : Toujours des déconnexions

**Solution** :
1. Videz le cache du navigateur (Ctrl+Shift+Delete)
2. Déconnectez-vous complètement
3. Reconnectez-vous
4. Ouvrez la console et surveillez les logs `[AuthContext]`

---

## 📞 Support

Si un problème persiste :

1. Ouvrez la console du navigateur (F12)
2. Notez toutes les erreurs en rouge
3. Cherchez les logs commençant par `[AuthContext]`, `[imageUtils]`, etc.
4. Partagez ces informations pour diagnostic

---

## ✅ C'est Fini !

Une fois toutes les étapes validées, votre application TAYBO est :

- ✅ **Stable** - Plus de déconnexions
- ✅ **Complète** - Images de profil utilisateur fonctionnelles
- ✅ **Optimisée** - Toutes les images s'affichent correctement
- ✅ **Sécurisée** - Politiques RLS robustes

**Bravo ! 🎉**

---

**Pour plus de détails, consultez** : `COMPTE_RENDU_CORRECTIONS_FINALES.md`

