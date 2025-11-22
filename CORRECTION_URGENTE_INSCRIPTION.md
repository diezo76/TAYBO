# 🚨 Correction Urgente Appliquée

## ✅ Problème Identifié et Résolu

### Erreur Rencontrée
```
StorageApiError: new row violates row-level security policy
```

### Cause
La fonction `extract_user_id_from_path()` extrayait incorrectement l'UUID :
- **Avant** : `0a488924` (seulement la première partie)
- **Après** : `0a488924-b39a-4846-9f56-31bfdfecac63` (UUID complet) ✅

### Format UUID
Les UUID ont **5 parties** séparées par des tirets :
```
8 caractères - 4 - 4 - 4 - 12 caractères
0a488924-b39a-4846-9f56-31bfdfecac63
```

### Correction Appliquée
✅ Migration `fix_extract_user_id_function` créée et appliquée
✅ La fonction extrait maintenant correctement les 5 parties de l'UUID
✅ Tests validés pour tous les formats (PNG, PDF, JPG)

---

## 🔄 Que Faire Maintenant ?

### Option 1 : Nettoyer et Réessayer (RECOMMANDÉ)

1. **Supprimer l'utilisateur en échec** (via Supabase Dashboard) :
   - Allez dans **Authentication** → **Users**
   - Cherchez `diezoweez@gmail.com`
   - Supprimez l'utilisateur

2. **Réessayer l'inscription** :
   - Retournez sur http://localhost:5173/restaurant/signup
   - Remplissez le formulaire avec les mêmes informations
   - Cette fois, l'upload du passport **fonctionnera** ✅

### Option 2 : Script de Nettoyage SQL

Si vous préférez nettoyer via SQL :

```sql
-- Dans Supabase SQL Editor
DELETE FROM auth.users WHERE email = 'diezoweez@gmail.com';
DELETE FROM restaurants WHERE email = 'diezoweez@gmail.com';
```

Puis réessayez l'inscription.

---

## ✅ Ce Qui Fonctionne Maintenant

### Fonction Corrigée
```sql
SELECT extract_user_id_from_path('0a488924-b39a-4846-9f56-31bfdfecac63-1763506256490.PNG');
-- Résultat: 0a488924-b39a-4846-9f56-31bfdfecac63 ✅
```

### Tests Validés
- ✅ Avec chemin complet : `passports/uuid-timestamp.PNG`
- ✅ Format PNG : `uuid-timestamp.PNG`
- ✅ Format PDF : `uuid-timestamp.pdf`
- ✅ Format JPG : `uuid-timestamp.jpg`

### Politiques Storage
Les 5 politiques Storage fonctionnent maintenant correctement :
- ✅ SELECT : Voir ses documents
- ✅ INSERT : Uploader ses documents
- ✅ UPDATE : Modifier ses documents
- ✅ DELETE : Supprimer ses documents
- ✅ Admin SELECT : Les admins voient tout

---

## 🎯 Test Final

Après nettoyage, l'inscription devrait réussir avec :
- ✅ Création du compte Auth
- ✅ Insertion dans la table `restaurants`
- ✅ Upload du document d'identité réussi
- ✅ URL du document dans `passport_document_url`
- ✅ Connexion possible immédiatement

---

## 📝 Résumé des Erreurs Résolues

| Erreur | Status | Solution |
|--------|--------|----------|
| 406 (Not Acceptable) | ✅ Résolu | Politiques RLS SELECT créées |
| 400 (Bad Request) Storage | ✅ Résolu | Fonction extract_user_id corrigée |
| RLS policy violation | ✅ Résolu | UUID complet extrait correctement |

---

## 🚀 Prochaine Étape

1. ✅ Nettoyez l'utilisateur en échec (Option 1 ou 2 ci-dessus)
2. ✅ Réessayez l'inscription via l'interface web
3. ✅ L'upload du passport devrait maintenant fonctionner !

---

**Migration créée** : `fix_extract_user_id_function.sql`  
**Fonction corrigée** : `extract_user_id_from_path(TEXT)`  
**Statut** : ✅ Prêt pour réessayer l'inscription

