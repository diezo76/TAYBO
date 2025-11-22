# Guide - Réinitialisation du Mot de Passe Restaurant

**Date** : 2025-01-27  
**Problème** : Erreur "Invalid login credentials" lors de la connexion restaurant.

## Diagnostic

✅ **Utilisateur Auth existe** : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`  
✅ **Email confirmé** : `diezowee@gmail.com`  
✅ **Restaurant existe** : "Daynite" (vérifié et actif)  
✅ **IDs correspondent** : L'ID Auth = ID Restaurant  

❌ **Problème** : Le mot de passe utilisé n'est pas correct.

## Solutions

### Solution 1 : Réinitialiser le Mot de Passe via Supabase Dashboard (Recommandé)

1. **Aller sur Supabase Dashboard**
   - URL : https://supabase.com/dashboard
   - Sélectionner le projet "Taybo"

2. **Aller dans Authentication > Users**
   - Menu de gauche : **Authentication** > **Users**

3. **Trouver l'utilisateur**
   - Rechercher : `diezowee@gmail.com`
   - Cliquer sur l'utilisateur

4. **Réinitialiser le mot de passe**
   - Cliquer sur **"Reset Password"** ou **"Send Password Reset Email"**
   - OU utiliser **"Set Password"** pour définir un nouveau mot de passe directement

5. **Vérifier l'email**
   - Si vous avez choisi "Send Password Reset Email", vérifiez votre boîte mail
   - Cliquez sur le lien de réinitialisation
   - Définissez un nouveau mot de passe

6. **Se connecter avec le nouveau mot de passe**
   - Aller sur `/restaurant/login`
   - Email : `diezowee@gmail.com`
   - Nouveau mot de passe : (celui que vous venez de définir)

### Solution 2 : Créer un Nouveau Compte Restaurant (Pour Tests)

Si vous préférez créer un nouveau compte pour tester :

1. **Aller sur la page d'inscription**
   - URL : `/restaurant/signup`

2. **Remplir le formulaire**
   - Email : Utilisez un autre email (ex: `test-restaurant@gmail.com`)
   - Mot de passe : Choisissez un mot de passe que vous retiendrez
   - Remplir tous les autres champs requis

3. **Attendre la validation admin**
   - Après l'inscription, le restaurant sera en attente de validation
   - Connectez-vous en tant qu'admin (`admin@taybo.com`)
   - Allez dans `/admin/restaurants`
   - Validez le nouveau restaurant

4. **Se connecter**
   - Une fois validé, vous pourrez vous connecter avec le nouveau compte

### Solution 3 : Réinitialiser via Code (Développement uniquement)

⚠️ **ATTENTION** : Cette méthode est uniquement pour le développement local. Ne l'utilisez jamais en production.

Si vous avez accès au code et que vous êtes en développement, vous pouvez ajouter temporairement une fonction de réinitialisation :

```javascript
// Dans restaurantAuthService.js (TEMPORAIRE - À SUPPRIMER EN PRODUCTION)
export async function resetRestaurantPassword(email, newPassword) {
  try {
    // Cette fonction nécessite l'API Admin Supabase
    // Vous devez utiliser le service_key, pas l'anon_key
    const { data, error } = await supabase.auth.admin.updateUserById(
      'cb6dc3c1-294d-4162-adc6-20551b2bb6cf', // ID de l'utilisateur
      { password: newPassword }
    );
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    return { success: false, error: error.message };
  }
}
```

**Note** : Cette méthode nécessite la clé `service_role` de Supabase, qui ne doit JAMAIS être exposée côté client.

## Vérification Post-Réinitialisation

Après avoir réinitialisé le mot de passe :

1. **Se connecter**
   - Aller sur `/restaurant/login`
   - Email : `diezowee@gmail.com`
   - Nouveau mot de passe

2. **Vérifier la connexion**
   - Vous devriez être redirigé vers `/restaurant/dashboard`
   - Les données du restaurant devraient s'afficher

3. **Tester l'upload d'image**
   - Aller sur `/restaurant/profile`
   - Uploader une image de profil
   - Vérifier que l'upload fonctionne sans erreur RLS

## Prévention Future

Pour éviter ce problème à l'avenir :

1. **Utiliser un gestionnaire de mots de passe**
   - Enregistrer les mots de passe dans un gestionnaire sécurisé
   - Exemples : LastPass, 1Password, Bitwarden

2. **Documenter les comptes de test**
   - Créer un fichier `TEST_ACCOUNTS.md` (non versionné)
   - Y enregistrer les emails et mots de passe de test
   - Ne jamais commiter ce fichier dans Git

3. **Utiliser des mots de passe simples pour les tests**
   - En développement : `Test123!` ou similaire
   - Facile à retenir pour les tests
   - ⚠️ JAMAIS en production

## Fichiers de Référence

- Service d'authentification : `/src/services/restaurantAuthService.js`
- Page de connexion : `/src/pages/restaurant/Login.jsx`
- Page d'inscription : `/src/pages/restaurant/SignUp.jsx`

## Support

Si le problème persiste après avoir réinitialisé le mot de passe :

1. Vérifiez la console du navigateur pour d'autres erreurs
2. Vérifiez les logs Supabase (Dashboard > Logs)
3. Vérifiez que l'email est bien confirmé dans Supabase Auth
4. Vérifiez que le restaurant est bien vérifié et actif dans la table `restaurants`

---

**Note** : Les mots de passe dans Supabase Auth sont stockés de manière sécurisée (hashés avec bcrypt). Il est impossible de récupérer le mot de passe original. La seule solution est de le réinitialiser.

