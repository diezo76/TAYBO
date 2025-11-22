# Guide de Vérification : Vérifier que tout est correctement configuré

## 🎯 Objectif

Vérifier que toutes les politiques RLS et Storage sont correctement créées après votre configuration manuelle.

---

## 📋 Étapes de vérification

### 1. Ouvrir SQL Editor

1. Allez sur **Supabase Dashboard** : https://supabase.com/dashboard
2. Sélectionnez votre projet **Taybo**
3. Cliquez sur **SQL Editor** (menu de gauche)

### 2. Exécuter le script de vérification

1. Créez une nouvelle requête (bouton **New Query**)
2. Ouvrez le fichier : **`scripts/VERIFICATION_COMPLETE.sql`**
3. **Copiez-collez** tout le contenu dans l'éditeur SQL
4. Cliquez sur **RUN** (ou Ctrl+Entrée)

### 3. Interpréter les résultats

Le script affiche plusieurs sections :

#### ✅ Section 1 : Fonction Helper
```
1. Fonction extract_user_id_from_path | ✅ EXISTE
```

**Résultat attendu** : ✅ EXISTE

#### ✅ Section 2 : Politiques RLS
```
2. Politiques RLS restaurants | 3 politiques créées (attendu: 3) | ✅ TOUTES LES POLITIQUES SONT PRÉSENTES
```

**Résultat attendu** : 3 politiques créées

Vous devriez voir la liste des 3 politiques :
- ✅ Restaurants can insert own profile (INSERT)
- ✅ Restaurants can view own profile (SELECT)
- ✅ Restaurants can update own profile (UPDATE)

#### ✅ Section 3 : Politiques Storage
```
3. Politiques Storage passports | 5 politiques créées (attendu: 5) | ✅ TOUTES LES POLITIQUES SONT PRÉSENTES
```

**Résultat attendu** : 5 politiques créées

Vous devriez voir la liste des 5 politiques :
- ✅ Restaurants can view own passports (SELECT)
- ✅ Restaurants can upload own passports (INSERT)
- ✅ Restaurants can update own passports (UPDATE)
- ✅ Restaurants can delete own passports (DELETE)
- ✅ Admins can view all passports (SELECT)

#### ✅ Section 4 : Résumé Final
```
═══════════════════════════════════════════
RÉSUMÉ FINAL
═══════════════════════════════════════════
✅ Fonction extract_user_id_from_path | OK
✅ Politiques RLS restaurants | OK (3/3)
✅ Politiques Storage passports | OK (5/5)
═══════════════════════════════════════════
🎉 TOUT EST PARFAIT ! Votre configuration est complète.
```

**Résultat attendu** : 🎉 TOUT EST PARFAIT !

---

## ✅ Résultats attendus

### Si tout est correct

Vous devriez voir :
- ✅ Fonction : EXISTE
- ✅ RLS : 3 politiques créées
- ✅ Storage : 5 politiques créées
- ✅ Message final : 🎉 TOUT EST PARFAIT !

### Si quelque chose manque

Le script vous indiquera exactement ce qui manque :

#### Exemple 1 : Fonction manquante
```
❌ Fonction extract_user_id_from_path | MANQUANTE
Action : Exécutez scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql
```

**Solution** : Exécutez `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`

#### Exemple 2 : Politiques Storage manquantes
```
❌ Politiques Storage passports | MANQUANTES (3/5)
Action : Il manque 2 politique(s)
```

**Solution** : Créez les politiques manquantes via Storage → passports → Policies

---

## 🔍 Vérification manuelle (alternative)

Si vous préférez vérifier manuellement :

### Vérifier les politiques RLS

1. Allez dans **SQL Editor**
2. Exécutez :
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'restaurants' 
AND policyname LIKE '%own%'
ORDER BY policyname;
```

**Résultat attendu** : 3 lignes

### Vérifier les politiques Storage

1. Allez dans **Storage** → **passports** → **Policies**
2. Vous devriez voir 5 politiques listées

**Résultat attendu** : 5 politiques visibles

### Vérifier la fonction

1. Allez dans **SQL Editor**
2. Exécutez :
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'extract_user_id_from_path';
```

**Résultat attendu** : 1 ligne avec `extract_user_id_from_path`

---

## ❓ Problèmes courants

### "Fonction extract_user_id_from_path does not exist"

**Cause** : La fonction n'a pas été créée

**Solution** :
1. Exécutez `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`
2. Réexécutez la vérification

### "Politiques Storage : 0 créées"

**Cause** : Les politiques Storage n'ont pas été créées via l'interface

**Solution** :
1. Allez dans **Storage** → **passports** → **Policies**
2. Vérifiez que les 5 politiques sont présentes
3. Si elles manquent, créez-les en suivant `SOLUTION_DEFINITIVE_INTERFACE_SEULEMENT.md`

### "Politiques Storage : 3 créées (attendu: 5)"

**Cause** : Certaines politiques Storage manquent

**Solution** :
1. Allez dans **Storage** → **passports** → **Policies**
2. Vérifiez quelles politiques manquent
3. Créez les politiques manquantes

---

## 📊 Tableau récapitulatif

| Élément | Attendu | Comment vérifier |
|---------|---------|-------------------|
| Fonction `extract_user_id_from_path` | ✅ Existe | Script de vérification |
| Politique RLS : insert own profile | ✅ Existe | Script de vérification |
| Politique RLS : view own profile | ✅ Existe | Script de vérification |
| Politique RLS : update own profile | ✅ Existe | Script de vérification |
| Politique Storage : view own passports | ✅ Existe | Script de vérification |
| Politique Storage : upload own passports | ✅ Existe | Script de vérification |
| Politique Storage : update own passports | ✅ Existe | Script de vérification |
| Politique Storage : delete own passports | ✅ Existe | Script de vérification |
| Politique Storage : admins view all | ✅ Existe | Script de vérification |

---

## 🎉 Après vérification

Si tout est ✅ :
- ✅ Votre configuration est complète
- ✅ Les restaurants peuvent s'inscrire
- ✅ Les restaurants peuvent uploader leur passport
- ✅ Tout fonctionne correctement !

Si quelque chose manque :
- ⚠️ Suivez les instructions dans les sections "Solution" ci-dessus
- ⚠️ Réexécutez la vérification après correction

---

## 📁 Fichiers de référence

- **`scripts/VERIFICATION_COMPLETE.sql`** : Script de vérification à exécuter
- **`SOLUTION_DEFINITIVE_INTERFACE_SEULEMENT.md`** : Guide pour créer les politiques Storage
- **`scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`** : Script pour créer RLS + fonction

---

**Exécutez le script de vérification maintenant pour confirmer que tout est correct !** 🚀

