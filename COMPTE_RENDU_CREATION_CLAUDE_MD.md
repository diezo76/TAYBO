# Compte Rendu - Création du fichier claude.md

**Date** : Aujourd'hui  
**Action** : Création du fichier `claude.md` avec les instructions pour le système de commissions hebdomadaires

---

## ✅ Action Effectuée

Création du fichier `claude.md` à la racine du projet avec les instructions pour implémenter le système de commissions hebdomadaires.

## 📋 Contenu du Fichier

Le fichier `claude.md` contient :

1. **Contexte** : Description du projet Taybo et du système de commissions hebdomadaires (4% sur le total des ventes hors frais de livraison)

2. **Stack Technique** :
   - Frontend: React + Vite
   - Backend: Supabase (PostgreSQL + Edge Functions)
   - Paiement: Stripe API
   - Tables existantes: `restaurants`, `orders`, `commission_payments`

3. **Style de Code** :
   - Composants fonctionnels React avec hooks
   - Services séparés dans `src/services/`
   - Gestion d'erreurs complète avec try/catch
   - Code en anglais, commentaires en français
   - Respect des conventions du projet existant

4. **Principes** :
   - Simplicité avant tout
   - Code maintenable et lisible
   - Gestion des cas d'erreur
   - Sécurité (ne jamais exposer les clés API côté client)

## 📝 Notes Importantes

- Le projet possède déjà un système de commissions dans `src/services/commissionService.js` qui utilise un taux de 15% par défaut
- La table `commission_payments` existe déjà dans la base de données
- Le nouveau système doit utiliser un taux de 4% et calculer sur le total des ventes **hors frais de livraison** (actuellement le code calcule sur le total incluant les frais)
- Le système doit être hebdomadaire (période de 7 jours)

## 🔄 Prochaines Étapes Recommandées

Pour le prochain agent qui travaillera sur cette fonctionnalité :

1. Examiner le code existant dans `src/services/commissionService.js`
2. Modifier la fonction `calculateAndCreateCommission` pour :
   - Utiliser un taux de 4% au lieu de 15%
   - Calculer sur `subtotal` au lieu de `total` (pour exclure les frais de livraison)
   - S'assurer que le système fonctionne sur une base hebdomadaire
3. Créer une Edge Function Supabase pour automatiser le calcul hebdomadaire des commissions
4. Créer une interface admin pour visualiser et gérer les paiements de commissions
5. Intégrer Stripe pour le paiement des commissions

## 📁 Fichiers Créés

- `/Users/diezowee/Taybo/claude.md` : Instructions pour le système de commissions hebdomadaires

---

**Statut** : ✅ Terminé  
**Fichier créé** : `claude.md`

