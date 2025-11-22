# Guide - Création Manuelle des Politiques Storage pour Passports

Si la migration SQL échoue avec l'erreur "must be owner of relation objects", vous pouvez créer les politiques Storage manuellement via l'interface Supabase Dashboard.

## Étapes pour Créer les Politiques Storage

### 1. Accéder aux Politiques Storage

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **Storage** dans le menu de gauche
3. Cliquez sur le bucket **passports**
4. Allez dans l'onglet **Policies**

### 2. Créer la Politique SELECT (Lecture)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Configurez la politique :
   - **Policy name** : `Restaurants can view own passports`
   - **Allowed operation** : `SELECT`
   - **Target roles** : `authenticated`
   - **USING expression** : Copiez-collez cette expression :
   
   **Option 1** : Si vous avez créé la fonction `extract_user_id_from_path` (recommandé) :
   ```sql
   bucket_id = 'passports' 
   AND auth.uid() IS NOT NULL 
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```
   
   **Option 2** : Expression directe (sans fonction helper) :
   ```sql
   bucket_id = 'passports' 
   AND auth.uid() IS NOT NULL 
   AND split_part((string_to_array(name, '/'))[array_length(string_to_array(name, '/'), 1)], '-', 1) = auth.uid()::text
   ```

4. Cliquez sur **Review** puis **Save policy**

### 3. Créer la Politique INSERT (Upload)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Configurez la politique :
   - **Policy name** : `Restaurants can upload own passports`
   - **Allowed operation** : `INSERT`
   - **Target roles** : `authenticated`
   - **WITH CHECK expression** : Copiez-collez cette expression :
   
   **Option 1** : Si vous avez créé la fonction `extract_user_id_from_path` (recommandé) :
   ```sql
   bucket_id = 'passports' 
   AND auth.uid() IS NOT NULL 
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```
   
   **Option 2** : Expression directe (sans fonction helper) :
   ```sql
   bucket_id = 'passports' 
   AND auth.uid() IS NOT NULL 
   AND split_part((string_to_array(name, '/'))[array_length(string_to_array(name, '/'), 1)], '-', 1) = auth.uid()::text
   ```

4. Cliquez sur **Review** puis **Save policy**

## Explication de la Logique

Le format du chemin du fichier est : `passports/{uuid}-{timestamp}.{ext}`

Pour extraire l'ID depuis le nom du fichier :
1. On extrait le nom du fichier depuis le chemin complet : `(string_to_array(name, '/'))[array_length(string_to_array(name, '/'), 1)]`
   - Cela donne : `{uuid}-{timestamp}.{ext}`
2. On extrait la partie avant le premier `-` : `split_part(..., '-', 1)`
   - Cela donne : `{uuid}`
3. On compare avec `auth.uid()::text` pour vérifier que c'est le même ID

Cela garantit que seul le restaurant propriétaire peut uploader/voir son propre passeport.

## Alternative : Utiliser la Fonction Helper

Si vous avez exécuté la partie de la migration qui crée la fonction `extract_user_id_from_path`, vous pouvez l'utiliser dans les politiques :

```sql
bucket_id = 'passports' 
AND auth.uid() IS NOT NULL 
AND auth.uid()::text = extract_user_id_from_path(name)
```

Cette approche est plus propre et réutilisable.

## Vérification

Après avoir créé les politiques :

1. Testez l'upload d'un passeport lors de l'inscription d'un restaurant
2. Vérifiez dans les logs Supabase qu'il n'y a plus d'erreurs RLS
3. Vérifiez que le fichier est bien uploadé dans le bucket `passports`

## Note Importante

Les politiques Storage créées via l'interface Dashboard sont équivalentes à celles créées via SQL. L'interface est souvent plus simple à utiliser et évite les problèmes de permissions.

