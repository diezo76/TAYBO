# Guide pour pousser le code sur GitHub

## État actuel
✅ Dépôt Git initialisé localement
✅ Tous les fichiers commités (383 fichiers, 82328 insertions)
✅ Commit initial créé : `f98a09b Initial commit: Projet Taybo complet`
✅ Remote GitHub configuré : `https://github.com/diezo76/TAYBO.git`

## Problème rencontré
Erreur 403 : Permission denied - Le token d'accès n'a probablement pas les bonnes permissions.

## Solutions

### Solution 1 : Vérifier et créer un nouveau token avec les bonnes permissions

1. **Allez sur** : https://github.com/settings/tokens/new

2. **Configurez le token** :
   - **Note** : "Taybo Push Token"
   - **Expiration** : Choisissez une durée (90 jours recommandé)
   - **Scopes** : Cochez **UNIQUEMENT** :
     - ✅ `repo` (accès complet aux dépôts privés)
       - Cela inclut automatiquement : repo:status, repo_deployment, public_repo, repo:invite, security_events

3. **Générez le token** et copiez-le immédiatement (vous ne pourrez plus le voir après)

4. **Exécutez cette commande dans votre terminal** :
```bash
cd /Users/diezowee/Taybo
git push -u origin main
```

5. **Quand Git demande vos identifiants** :
   - **Username** : `diezo76`
   - **Password** : Collez votre nouveau token (pas votre mot de passe GitHub)

### Solution 2 : Utiliser GitHub Desktop (Plus simple)

1. Téléchargez GitHub Desktop : https://desktop.github.com/
2. Connectez-vous avec votre compte GitHub
3. Ajoutez le dépôt local : File → Add Local Repository → Sélectionnez `/Users/diezowee/Taybo`
4. Cliquez sur "Publish repository" pour pousser sur GitHub

### Solution 3 : Utiliser GitHub CLI (gh)

1. **Installez GitHub CLI** :
```bash
brew install gh
```

2. **Authentifiez-vous** :
```bash
gh auth login
```

3. **Poussez le code** :
```bash
cd /Users/diezowee/Taybo
git push -u origin main
```

### Solution 4 : Vérifier les permissions du dépôt

1. Allez sur : https://github.com/diezo76/TAYBO/settings
2. Vérifiez que vous êtes bien le propriétaire du dépôt
3. Vérifiez les paramètres de visibilité (Public/Private)

## Vérification

Après le push réussi, vous devriez voir :
- Tous vos fichiers sur : https://github.com/diezo76/TAYBO
- Le commit initial dans l'historique

## Commandes utiles

```bash
# Vérifier l'état du dépôt
git status

# Vérifier le remote configuré
git remote -v

# Voir l'historique des commits
git log --oneline

# Pousser le code
git push -u origin main
```

## Note de sécurité

⚠️ **Important** : Ne partagez jamais votre token d'accès personnel. Si vous l'avez accidentellement exposé, révoquez-le immédiatement sur : https://github.com/settings/tokens

