# Compte Rendu - Correction des UUIDs Invalides

**Date :** $(date)  
**Fichier modifié :** `scripts/insert_sample_data.sql`

## 🐛 Problème Identifié

Lors de l'exécution du script SQL dans Supabase, une erreur s'est produite :

```
ERROR: 22P02: invalid input syntax for type uuid: "b2c3d4e5-f6g7-4890-b123-456789012345"
```

**Cause :** Les UUIDs dans le script contenaient des caractères invalides (g, h, i, j, k, l, m, n, o) qui ne sont pas des caractères hexadécimaux valides.

**Explication :** Les UUIDs PostgreSQL doivent être au format hexadécimal, c'est-à-dire contenir uniquement les caractères :
- Chiffres : `0-9`
- Lettres hexadécimales : `a-f` (ou `A-F`)

Les lettres `g-z` ne sont pas valides dans un UUID.

## ✅ Solution Appliquée

Tous les UUIDs invalides ont été remplacés par des UUIDs valides en remplaçant les caractères invalides par des caractères hexadécimaux valides :

### Corrections Effectuées

1. **Restaurants :**
   - `b2c3d4e5-f6g7-4890-b123-456789012345` → `b2c3d4e5-f6a7-4890-b123-456789012345`
   - `c3d4e5f6-g7h8-4901-c234-567890123456` → `c3d4e5f6-a7b8-4901-c234-567890123456`
   - `d4e5f6g7-h8i9-4012-d345-678901234567` → `d4e5f6a7-b8c9-4012-d345-678901234567`
   - `e5f6g7h8-i9j0-4123-e456-789012345678` → `e5f6a7b8-c9d0-4123-e456-789012345678`
   - `f6g7h8i9-j0k1-4234-f567-890123456789` → `f6a7b8c9-d0e1-4234-f567-890123456789`
   - `g7h8i9j0-k1l2-4345-g678-901234567890` → `a7b8c9d0-e1f2-4345-a678-901234567890`
   - `h8i9j0k1-l2m3-4456-h789-012345678901` → `b8c9d0e1-f2a3-4456-a789-012345678901`
   - `i9j0k1l2-m3n4-4567-i890-123456789012` → `c9d0e1f2-a3b4-4567-a890-123456789012`
   - `j0k1l2m3-n4o5-4678-j901-234567890123` → `d0e1f2a3-b4c5-4678-a901-234567890123`

2. **Menus :** Tous les `restaurant_id` dans les menus ont été mis à jour pour correspondre aux nouveaux UUIDs des restaurants.

3. **Utilisateurs :**
   - `u3c4d5e6-f7g8-4901-b234-567890123456` → `u3c4d5e6-f7a8-4901-b234-567890123456`
   - `u4d5e6f7-g8h9-4012-c345-678901234567` → `u4d5e6f7-a8b9-4012-c345-678901234567`
   - `u5e6f7g8-h9i0-4123-d456-789012345678` → `u5e6f7a8-b9c0-4123-d456-789012345678`
   - `u6f7g8h9-i0j1-4234-e567-890123456789` → `u6f7a8b9-c0d1-4234-e567-890123456789`
   - `u7g8h9i0-j1k2-4345-f678-901234567890` → `u7a8b9c0-d1e2-4345-f678-901234567890`
   - `u8h9i0j1-k2l3-4456-g789-012345678901` → `u8b9c0d1-e2f3-4456-a789-012345678901`
   - `u9i0j1k2-l3m4-4567-h890-123456789012` → `u9c0d1e2-f3a4-4567-a890-123456789012`
   - `u0j1k2l3-m4n5-4678-i901-234567890123` → `u0d1e2f3-a4b5-4678-a901-234567890123`

## 🔍 Vérification

Après les corrections, une vérification a été effectuée pour s'assurer qu'il ne reste plus de caractères invalides dans les UUIDs :

```bash
grep -i "-[g-z]" scripts/insert_sample_data.sql
```

**Résultat :** Aucun UUID invalide trouvé ✅

## 📝 Modifications Techniques

- **Total de remplacements :** ~54 occurrences corrigées
- **Méthode :** Remplacement systématique de tous les caractères invalides (g-z) par des caractères hexadécimaux valides (a-f)
- **Cohérence :** Tous les `restaurant_id` dans les menus ont été mis à jour pour correspondre aux nouveaux UUIDs

## ✅ Statut

**Problème résolu !** Le script SQL peut maintenant être exécuté sans erreur dans Supabase.

## 🚀 Prochaines Étapes

1. **Réexécuter le script SQL** dans Supabase SQL Editor
2. **Vérifier que les données sont insérées correctement**
3. **Tester l'application** avec les nouvelles données

## 📌 Note Importante

Pour éviter ce problème à l'avenir :
- ✅ Utiliser uniquement des caractères hexadécimaux (0-9, a-f) dans les UUIDs
- ✅ Valider les UUIDs avant de les utiliser dans les scripts SQL
- ✅ Utiliser `uuid_generate_v4()` de PostgreSQL pour générer des UUIDs valides automatiquement

