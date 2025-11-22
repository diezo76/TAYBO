# Instructions pour Cursor - Système de Commissions Hebdomadaires

## Contexte

Vous travaillez sur le projet Taybo, une plateforme de livraison de nourriture.

Les restaurants doivent payer une commission hebdomadaire de 4% sur le total des ventes (hors frais de livraison).

## Stack Technique

- Frontend: React + Vite
- Backend: Supabase (PostgreSQL + Edge Functions)
- Paiement: Stripe API
- État existant: Tables `restaurants`, `orders`, `commission_payments` déjà créées

## Style de Code

- Utilisez des composants fonctionnels React avec hooks
- Services séparés dans `src/services/`
- Gestion d'erreurs complète avec try/catch
- Code en anglais, commentaires en français
- Suivez les conventions du projet existant

## Principes

- Simplicité avant tout
- Code maintenable et lisible
- Gestion des cas d'erreur
- Sécurité (ne jamais exposer les clés API côté client)

