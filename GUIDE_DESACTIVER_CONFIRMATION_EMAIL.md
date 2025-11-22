# Guide Rapide - Désactiver la Confirmation d'Email (Développement)

## ⚡ Solution Rapide (2 minutes)

Si vous ne recevez pas l'email de confirmation, la solution la plus rapide est de **désactiver la confirmation d'email** dans Supabase.

### Étapes Détaillées

1. **Ouvrez Supabase Dashboard**
   - Allez sur : https://supabase.com/dashboard
   - Connectez-vous avec votre compte

2. **Sélectionnez votre projet**
   - Cliquez sur le projet Taybo dans la liste

3. **Accédez aux paramètres d'authentification**
   - Dans le menu de gauche, cliquez sur **"Authentication"**
   - Puis cliquez sur **"Settings"** (ou "Paramètres")

4. **Désactivez la confirmation d'email**
   - Dans la section **"Email Auth"** ou **"Email Authentication"**
   - Trouvez l'option **"Enable email confirmations"** ou **"Activer les confirmations d'email"**
   - **Décochez** cette option (elle doit être désactivée)

5. **Sauvegardez**
   - Cliquez sur **"Save"** ou **"Sauvegarder"** en bas de la page
   - Attendez quelques secondes que les changements soient appliqués

### ✅ Après Désactivation

- ✅ Les **nouveaux utilisateurs** pourront se connecter **immédiatement** après l'inscription
- ✅ Les utilisateurs existants non confirmés devront toujours confirmer leur email
- ✅ Pour les utilisateurs existants, vous pouvez les confirmer manuellement (voir ci-dessous)

### 🔄 Confirmer un Utilisateur Existant Manuellement

Si vous avez déjà créé un compte et que vous voulez le confirmer manuellement :

1. Dans Supabase Dashboard, allez sur **Authentication** > **Users**
2. Trouvez votre email dans la liste
3. Cliquez sur l'utilisateur pour ouvrir les détails
4. Cliquez sur **"Confirm email"** ou modifiez manuellement le statut

## 📧 Alternative : Utiliser la Page de Réenvoi

Une page a été créée pour réenvoyer l'email de confirmation :

**URL :** http://localhost:5173/client/resend-confirmation

Cette page permet de :
- Entrer votre email
- Demander un nouvel email de confirmation
- Voir des conseils pour trouver l'email

## ⚠️ Important

- **En développement** : Vous pouvez désactiver la confirmation d'email sans problème
- **En production** : Gardez la confirmation d'email activée pour la sécurité
- **Réactivation** : Vous pouvez réactiver la confirmation d'email à tout moment

## 🐛 Si ça ne fonctionne toujours pas

1. **Vérifiez que les changements sont sauvegardés**
   - Rafraîchissez la page Supabase Dashboard
   - Vérifiez que l'option est bien désactivée

2. **Déconnectez-vous et reconnectez-vous**
   - Déconnectez-vous de votre application
   - Créez un nouveau compte
   - Vous devriez pouvoir vous connecter immédiatement

3. **Vérifiez les logs Supabase**
   - Allez sur **Logs** > **Auth** dans Supabase Dashboard
   - Vérifiez s'il y a des erreurs

4. **Contactez le support**
   - Si le problème persiste, contactez le support Supabase

## 📝 Notes

- La désactivation de la confirmation d'email n'affecte que les **nouveaux utilisateurs**
- Les utilisateurs existants non confirmés devront toujours confirmer leur email
- Vous pouvez réactiver la confirmation d'email à tout moment dans les paramètres

