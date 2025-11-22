#!/bin/bash

# Script pour déployer toutes les Edge Functions sur Supabase
# Usage: ./scripts/deploy-edge-functions.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement des Edge Functions sur Supabase"
echo "================================================"
echo ""

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo "📦 Installation de Supabase CLI..."
    npm install -g supabase
    echo "✅ Supabase CLI installé !"
    echo ""
fi

# Vérifier que l'utilisateur est connecté
echo "🔐 Vérification de la connexion Supabase..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Vous n'êtes pas connecté à Supabase."
    echo "🔑 Connexion à Supabase..."
    supabase login
    echo ""
fi

# Demander le project-ref si pas déjà lié
if [ ! -f ".supabase/config.toml" ]; then
    echo "📋 Lien du projet Supabase requis."
    read -p "Entrez votre project-ref: " PROJECT_REF
    echo "🔗 Liaison du projet..."
    supabase link --project-ref "$PROJECT_REF"
    echo ""
fi

# Liste des fonctions à déployer
FUNCTIONS=(
    "csrf-token"
    "rate-limit"
    "validate-order"
    "validate-payment"
)

# Déployer chaque fonction
echo "📦 Déploiement des Edge Functions..."
echo ""

for func in "${FUNCTIONS[@]}"; do
    echo "🔄 Déploiement de: $func"
    
    if [ -d "supabase/functions/$func" ]; then
        if supabase functions deploy "$func"; then
            echo "✅ $func déployé avec succès !"
        else
            echo "❌ Erreur lors du déploiement de $func"
            exit 1
        fi
    else
        echo "⚠️  Fonction $func non trouvée dans supabase/functions/$func"
    fi
    
    echo ""
done

echo "================================================"
echo "✅ Toutes les Edge Functions ont été déployées !"
echo ""
echo "📊 Vérifiez le déploiement sur:"
echo "   https://supabase.com/dashboard > Edge Functions"
echo ""

