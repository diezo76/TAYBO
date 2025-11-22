# Guide de Configuration des Cron Jobs Supabase

**Date** : Aujourd'hui  
**Objectif** : Configurer les tâches planifiées (cron jobs) pour automatiser la génération des factures hebdomadaires et le gel des comptes impayés.

---

## 📋 Vue d'ensemble

Ce guide explique comment configurer deux cron jobs essentiels dans Supabase :

1. **generate-weekly-invoices** : Génère les factures de commission hebdomadaires chaque dimanche à 23:59
2. **freeze-unpaid-accounts** : Gèle les restaurants avec commissions impayées toutes les heures

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Accès au Dashboard Supabase** de votre projet
2. **Extension pg_cron activée** dans votre projet Supabase
3. **Les Edge Functions déployées** :
   - `calculate-weekly-commissions`
   - `freeze-overdue-restaurants`

---

## 📝 Méthode 1 : Configuration via Supabase Dashboard (Recommandé)

### Étape 1 : Activer l'extension pg_cron

1. **Connectez-vous** à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **Database** > **Extensions**
3. Recherchez **pg_cron** dans la liste
4. Cliquez sur **Enable** pour activer l'extension

**Note** : Si l'extension n'apparaît pas, vous devrez peut-être l'activer via SQL (voir Méthode 2).

### Étape 2 : Configurer les Cron Jobs via SQL Editor

1. Allez dans **SQL Editor** dans le Dashboard Supabase
2. Exécutez les commandes SQL suivantes :

#### Cron Job 1 : Génération des factures hebdomadaires

```sql
-- Cron job pour générer les factures hebdomadaires chaque dimanche à 23:59
SELECT cron.schedule(
  'generate-weekly-invoices',
  '59 23 * * 0', -- Chaque dimanche à 23:59 (format: minute heure jour mois jour-semaine)
  $$
  SELECT
    net.http_post(
      url := 'https://VOTRE-PROJET.supabase.co/functions/v1/calculate-weekly-commissions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**Remplacez** :
- `VOTRE-PROJET` par l'identifiant de votre projet Supabase (ex: `abcdefghijklmnop`)

#### Cron Job 2 : Gel des comptes impayés

```sql
-- Cron job pour geler les restaurants avec commissions impayées toutes les heures
SELECT cron.schedule(
  'freeze-unpaid-accounts',
  '0 * * * *', -- Toutes les heures à la minute 0 (format: minute heure jour mois jour-semaine)
  $$
  SELECT
    net.http_post(
      url := 'https://VOTRE-PROJET.supabase.co/functions/v1/freeze-overdue-restaurants',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**Remplacez** :
- `VOTRE-PROJET` par l'identifiant de votre projet Supabase

### Étape 3 : Configurer la clé de service (Service Role Key)

Pour que les cron jobs puissent appeler les Edge Functions avec les droits admin, vous devez configurer la clé de service :

1. Allez dans **Settings** > **API** dans Supabase Dashboard
2. Copiez la **service_role key** (⚠️ **NE JAMAIS** exposer cette clé publiquement)
3. Exécutez cette commande SQL pour la stocker de manière sécurisée :

```sql
-- Configurer la clé de service pour les cron jobs
ALTER DATABASE postgres SET app.settings.service_role_key = 'VOTRE_SERVICE_ROLE_KEY';
```

**Remplacez** :
- `VOTRE_SERVICE_ROLE_KEY` par votre vraie clé de service Supabase

**⚠️ IMPORTANT** : Cette clé donne un accès complet à votre base de données. Ne la partagez jamais publiquement.

---

## 📝 Méthode 2 : Configuration complète via SQL (Alternative)

Si vous préférez tout configurer en une seule fois, exécutez ce script SQL complet :

```sql
-- ============================================
-- Configuration complète des Cron Jobs Supabase
-- ============================================

-- 1. Activer l'extension pg_cron si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Activer l'extension http si nécessaire (pour les appels HTTP)
CREATE EXTENSION IF NOT EXISTS http;

-- 3. Configurer la clé de service (remplacez par votre vraie clé)
-- ⚠️ IMPORTANT : Remplacez 'VOTRE_SERVICE_ROLE_KEY' par votre vraie clé depuis Settings > API
ALTER DATABASE postgres SET app.settings.service_role_key = 'VOTRE_SERVICE_ROLE_KEY';

-- 4. Supprimer les cron jobs existants s'ils existent déjà (pour éviter les doublons)
SELECT cron.unschedule('generate-weekly-invoices') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'generate-weekly-invoices'
);

SELECT cron.unschedule('freeze-unpaid-accounts') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'freeze-unpaid-accounts'
);

-- 5. Créer le cron job pour générer les factures hebdomadaires
-- Exécution : Chaque dimanche à 23:59
SELECT cron.schedule(
  'generate-weekly-invoices',
  '59 23 * * 0', -- Format cron : minute heure jour mois jour-semaine
  $$
  SELECT
    net.http_post(
      url := 'https://VOTRE-PROJET.supabase.co/functions/v1/calculate-weekly-commissions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- 6. Créer le cron job pour geler les comptes impayés
-- Exécution : Toutes les heures à la minute 0
SELECT cron.schedule(
  'freeze-unpaid-accounts',
  '0 * * * *', -- Format cron : toutes les heures
  $$
  SELECT
    net.http_post(
      url := 'https://VOTRE-PROJET.supabase.co/functions/v1/freeze-overdue-restaurants',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- 7. Vérifier que les cron jobs sont bien créés
SELECT jobid, jobname, schedule, command, active 
FROM cron.job 
WHERE jobname IN ('generate-weekly-invoices', 'freeze-unpaid-accounts');
```

**Remplacez dans le script** :
- `VOTRE-PROJET` par l'identifiant de votre projet Supabase
- `VOTRE_SERVICE_ROLE_KEY` par votre vraie clé de service

---

## 🔍 Vérification des Cron Jobs

Pour vérifier que les cron jobs sont bien configurés :

```sql
-- Lister tous les cron jobs actifs
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  nodename,
  nodeport,
  database,
  username
FROM cron.job
WHERE jobname IN ('generate-weekly-invoices', 'freeze-unpaid-accounts');
```

Pour voir l'historique d'exécution :

```sql
-- Voir l'historique d'exécution des cron jobs
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid IN (
  SELECT jobid FROM cron.job 
  WHERE jobname IN ('generate-weekly-invoices', 'freeze-unpaid-accounts')
)
ORDER BY start_time DESC
LIMIT 50;
```

---

## 🛠️ Gestion des Cron Jobs

### Désactiver temporairement un cron job

```sql
-- Désactiver le cron job de génération de factures
UPDATE cron.job 
SET active = false 
WHERE jobname = 'generate-weekly-invoices';
```

### Réactiver un cron job

```sql
-- Réactiver le cron job
UPDATE cron.job 
SET active = true 
WHERE jobname = 'generate-weekly-invoices';
```

### Supprimer un cron job

```sql
-- Supprimer le cron job de génération de factures
SELECT cron.unschedule('generate-weekly-invoices');

-- Supprimer le cron job de gel des comptes
SELECT cron.unschedule('freeze-unpaid-accounts');
```

### Modifier la planification d'un cron job

```sql
-- Modifier la planification du cron job (exemple : changer à 23:00 au lieu de 23:59)
UPDATE cron.job 
SET schedule = '0 23 * * 0' -- Chaque dimanche à 23:00
WHERE jobname = 'generate-weekly-invoices';
```

---

## 📅 Format Cron

Le format cron utilisé par pg_cron est : `minute heure jour mois jour-semaine`

### Exemples de planification

| Format | Description |
|--------|-------------|
| `59 23 * * 0` | Chaque dimanche à 23:59 |
| `0 * * * *` | Toutes les heures à la minute 0 |
| `0 0 * * *` | Tous les jours à minuit |
| `0 9 * * 1-5` | Du lundi au vendredi à 9h00 |
| `*/15 * * * *` | Toutes les 15 minutes |
| `0 0 1 * *` | Le 1er de chaque mois à minuit |

### Jours de la semaine

- `0` = Dimanche
- `1` = Lundi
- `2` = Mardi
- `3` = Mercredi
- `4` = Jeudi
- `5` = Vendredi
- `6` = Samedi

---

## ⚠️ Notes Importantes

### Sécurité

1. **Service Role Key** : La clé de service donne un accès complet à votre base de données. Ne l'exposez jamais publiquement et ne la commitez jamais dans Git.

2. **Authentification** : Les Edge Functions vérifient l'authentification via le header `Authorization`. Assurez-vous que la clé de service est correctement configurée.

### Limitations Supabase

1. **pg_cron** : L'extension pg_cron peut ne pas être disponible sur tous les plans Supabase. Vérifiez votre plan.

2. **Alternatives** : Si pg_cron n'est pas disponible, vous pouvez utiliser :
   - **Services externes** : cron-job.org, EasyCron, etc.
   - **Supabase Edge Functions** avec déclencheurs externes
   - **Vercel Cron Jobs** (si vous déployez sur Vercel)

### Monitoring

1. **Logs** : Surveillez les logs des Edge Functions dans Supabase Dashboard > Edge Functions > Logs

2. **Base de données** : Vérifiez régulièrement la table `commission_payments` pour s'assurer que les factures sont générées correctement

3. **Restaurants gelés** : Surveillez la colonne `is_frozen` dans la table `restaurants` pour voir quels restaurants ont été gelés

---

## 🐛 Dépannage

### Le cron job ne s'exécute pas

1. **Vérifiez que pg_cron est activé** :
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. **Vérifiez que le cron job est actif** :
   ```sql
   SELECT active FROM cron.job WHERE jobname = 'generate-weekly-invoices';
   ```

3. **Vérifiez les logs d'erreur** :
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'generate-weekly-invoices')
   ORDER BY start_time DESC LIMIT 10;
   ```

### Erreur d'authentification

1. **Vérifiez que la clé de service est configurée** :
   ```sql
   SHOW app.settings.service_role_key;
   ```

2. **Vérifiez que l'URL de l'Edge Function est correcte** dans la commande cron

### L'Edge Function retourne une erreur

1. **Testez l'Edge Function manuellement** via Supabase Dashboard > Edge Functions > Invoke

2. **Vérifiez les logs** de l'Edge Function dans le Dashboard

---

## 📚 Ressources

- [Documentation pg_cron](https://github.com/citusdata/pg_cron)
- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Format Cron](https://crontab.guru/)

---

## ✅ Checklist de Configuration

- [ ] Extension pg_cron activée
- [ ] Extension http activée (si nécessaire)
- [ ] Service Role Key configurée
- [ ] Cron job `generate-weekly-invoices` créé et actif
- [ ] Cron job `freeze-unpaid-accounts` créé et actif
- [ ] Edge Functions déployées et testées
- [ ] Vérification des cron jobs effectuée
- [ ] Monitoring configuré

---

**Date de création** : Aujourd'hui  
**Dernière mise à jour** : Aujourd'hui

