# Guide - Résolution Erreur "Failed to fetch (api.supabase.com)"

## Problème

Erreur lors de la connexion à Supabase :
```
Error: Failed to fetch (api.supabase.com)
```

## Causes Possibles

1. **Problème réseau temporaire**
2. **Variables d'environnement manquantes ou incorrectes**
3. **Projet Supabase suspendu ou inactif**
4. **Problème CORS**
5. **Firewall ou proxy bloquant la connexion**

---

## Solutions

### Solution 1 : Vérifier les Variables d'Environnement ✅

**Vérifiez que le fichier `.env` existe et contient les bonnes valeurs** :

```bash
# Dans le terminal, vérifiez le fichier .env
cat .env
```

Vous devriez voir :
```env
VITE_SUPABASE_URL=https://ocxesczzlzopbcobppok.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Si le fichier n'existe pas ou est incorrect** :
1. Vérifiez que le fichier `.env` est à la racine du projet
2. Vérifiez que les variables commencent par `VITE_`
3. Redémarrez le serveur de développement après modification

---

### Solution 2 : Vérifier le Statut du Projet Supabase

1. **Allez sur** : https://supabase.com/dashboard
2. **Vérifiez le statut de votre projet** "Taybo"
3. **Si le projet est "INACTIVE"** :
   - Cliquez sur le projet
   - Cliquez sur "Restore" ou "Resume"
   - Attendez quelques minutes que le projet redémarre

**Note** : Les projets Supabase gratuits peuvent être suspendus après une période d'inactivité.

---

### Solution 3 : Redémarrer le Serveur de Développement

**Souvent, un simple redémarrage résout le problème** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez-le
npm run dev
```

**Si vous utilisez Vite** :
- Vite peut mettre en cache certaines configurations
- Un redémarrage force la relecture du fichier `.env`

---

### Solution 4 : Vérifier la Connexion Internet

**Testez la connexion à Supabase** :

```bash
# Testez la connexion
curl https://ocxesczzlzopbcobppok.supabase.co

# Ou testez l'API
curl https://ocxesczzlzopbcobppok.supabase.co/rest/v1/
```

**Si ça échoue** :
- Vérifiez votre connexion Internet
- Vérifiez si un VPN ou proxy bloque la connexion
- Essayez depuis un autre réseau

---

### Solution 5 : Vérifier les Erreurs dans la Console du Navigateur

1. **Ouvrez les outils de développement** (F12)
2. **Allez dans l'onglet "Console"**
3. **Regardez les erreurs détaillées** :
   - Erreurs CORS ?
   - Erreurs de réseau ?
   - Erreurs d'authentification ?

**Erreurs CORS courantes** :
- Vérifiez que l'URL Supabase est correcte
- Vérifiez que vous n'utilisez pas `localhost` au lieu de l'URL Supabase

---

### Solution 6 : Vérifier la Configuration Supabase Client

**Vérifiez le fichier `src/services/supabase.js`** :

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifiez que ces valeurs ne sont pas undefined
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');
```

**Si les valeurs sont `undefined`** :
- Le fichier `.env` n'est pas lu correctement
- Redémarrez le serveur de développement
- Vérifiez que les variables commencent par `VITE_`

---

### Solution 7 : Vérifier le Projet dans Supabase Dashboard

1. **Allez sur** : https://supabase.com/dashboard/project/ocxesczzlzopbcobppok
2. **Vérifiez** :
   - Le projet est actif ?
   - L'URL du projet est correcte ?
   - La clé API est correcte ?
3. **Récupérez les nouvelles valeurs** si nécessaire :
   - Settings > API
   - Copiez l'URL et la clé `anon public`
   - Mettez à jour le fichier `.env`

---

### Solution 8 : Vider le Cache du Navigateur

**Parfois, le navigateur cache des configurations obsolètes** :

1. **Ouvrez les outils de développement** (F12)
2. **Clic droit sur le bouton de rafraîchissement**
3. **Sélectionnez "Vider le cache et effectuer un rechargement forcé"**

Ou :
- Chrome/Edge : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
- Firefox : `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)

---

## Diagnostic Rapide

**Exécutez ces commandes pour diagnostiquer** :

```bash
# 1. Vérifier que le fichier .env existe
ls -la .env

# 2. Vérifier le contenu (sans afficher la clé complète)
grep VITE_SUPABASE_URL .env

# 3. Vérifier que le serveur peut lire les variables
npm run dev
# Puis dans le navigateur, ouvrez la console et vérifiez les logs
```

---

## Vérification dans le Code

**Ajoutez temporairement ce code dans `src/services/supabase.js`** pour déboguer :

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug temporaire
if (import.meta.env.DEV) {
  console.log('🔍 Debug Supabase Config:');
  console.log('URL:', supabaseUrl);
  console.log('Key present:', !!supabaseAnonKey);
  console.log('Key length:', supabaseAnonKey?.length);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables Supabase manquantes !');
  console.error('Vérifiez votre fichier .env');
}
```

---

## Solutions par Scénario

### Scénario 1 : Erreur au Démarrage de l'Application

**Cause probable** : Variables d'environnement non chargées

**Solution** :
1. Vérifiez que `.env` existe
2. Redémarrez `npm run dev`
3. Videz le cache du navigateur

### Scénario 2 : Erreur Intermittente

**Cause probable** : Problème réseau ou projet Supabase suspendu

**Solution** :
1. Vérifiez le statut du projet dans Supabase Dashboard
2. Vérifiez votre connexion Internet
3. Attendez quelques minutes et réessayez

### Scénario 3 : Erreur Après Modification du .env

**Cause probable** : Serveur de développement n'a pas rechargé les variables

**Solution** :
1. Arrêtez complètement le serveur (`Ctrl+C`)
2. Redémarrez-le (`npm run dev`)
3. Videz le cache du navigateur

### Scénario 4 : Erreur CORS

**Cause probable** : Configuration Supabase ou problème de domaine

**Solution** :
1. Vérifiez que l'URL Supabase est correcte
2. Vérifiez les paramètres CORS dans Supabase Dashboard
3. Vérifiez que vous n'utilisez pas une URL locale incorrecte

---

## Checklist de Vérification

- [ ] Le fichier `.env` existe à la racine du projet
- [ ] Les variables commencent par `VITE_`
- [ ] L'URL Supabase est correcte (sans slash final)
- [ ] La clé API est complète et correcte
- [ ] Le serveur de développement a été redémarré après modification du `.env`
- [ ] Le projet Supabase est actif (pas suspendu)
- [ ] La connexion Internet fonctionne
- [ ] Le cache du navigateur a été vidé
- [ ] Aucun VPN/proxy ne bloque la connexion

---

## En Cas d'Échec

Si aucune solution ne fonctionne :

1. **Vérifiez les logs Supabase** :
   - Dashboard > Logs > API
   - Dashboard > Logs > Postgres

2. **Vérifiez les logs de l'application** :
   - Console du navigateur (F12)
   - Terminal où tourne `npm run dev`

3. **Contactez le support Supabase** si le problème persiste

---

## Configuration Actuelle du Projet

**Projet Supabase** : Taybo
**ID** : `ocxesczzlzopbcobppok`
**URL** : `https://ocxesczzlzopbcobppok.supabase.co`
**Région** : eu-north-1
**Statut** : ACTIVE_HEALTHY (à vérifier)

---

**Note** : Cette erreur est souvent temporaire et se résout avec un redémarrage du serveur ou une vérification des variables d'environnement.

