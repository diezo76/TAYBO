-- Migration 023 : Garantir que la politique publique pour voir les restaurants existe toujours
-- Cette migration s'assure que les utilisateurs non authentifiés peuvent toujours voir les restaurants actifs et vérifiés
-- même si les migrations précédentes ont causé des problèmes

-- Supprimer la politique publique existante si elle existe (pour éviter les doublons)
DROP POLICY IF EXISTS "Public can view active verified restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view active verified restaurants" ON restaurants;

-- Créer/recréer la politique publique pour permettre à tous (même non authentifiés) de voir les restaurants actifs et vérifiés
-- Cette politique doit toujours exister pour que la page d'accueil fonctionne
CREATE POLICY "Public can view active verified restaurants"
  ON restaurants FOR SELECT
  USING (
    is_active = true AND is_verified = true
  );

-- Commentaire pour documenter la politique
COMMENT ON POLICY "Public can view active verified restaurants" ON restaurants IS 
  'Permet à tous (même non authentifiés) de voir les restaurants actifs et vérifiés pour l''affichage public. Cette politique est essentielle pour la page d''accueil.';

