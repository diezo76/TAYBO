#!/bin/bash

# Script pour appliquer la migration Storage via Supabase CLI
# Prérequis: supabase login et supabase link doivent être faits

set -e

echo "🚀 Application de la migration Storage (016_setup_storage_policies.sql)"
echo "========================================================================"
echo ""

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo "📦 Installation via Homebrew..."
    brew install supabase/tap/supabase
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

# Vérifier si le projet est lié
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Le projet n'est pas encore lié."
    echo "📋 Pour lier votre projet:"
    echo "   1. Trouvez votre project-ref dans Supabase Dashboard"
    echo "   2. Exécutez: supabase link --project-ref votre-project-ref"
    echo ""
    read -p "Voulez-vous lier le projet maintenant? (o/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        read -p "Entrez votre project-ref: " PROJECT_REF
        supabase link --project-ref "$PROJECT_REF"
    else
        echo "❌ Projet non lié. Arrêt du script."
        exit 1
    fi
fi

# Appliquer la migration spécifique
echo "📦 Application de la migration 016_setup_storage_policies.sql..."
echo ""

# Méthode 1: Utiliser db push (applique toutes les migrations)
echo "🔄 Méthode 1: Application via db push..."
if supabase db push; then
    echo ""
    echo "✅ Migration appliquée avec succès !"
    echo ""
    echo "📊 Vérifiez dans Supabase Dashboard > Storage > Policies"
    echo "   Vous devriez voir les policies créées pour:"
    echo "   - restaurant-images"
    echo "   - menu-images"
    echo "   - user-images"
    echo "   - passports"
    exit 0
else
    echo ""
    echo "⚠️  db push a échoué. Tentative avec l'exécution directe du SQL..."
    echo ""
    
    # Méthode 2: Exécuter directement le SQL via l'API
    MIGRATION_FILE="supabase/migrations/016_setup_storage_policies.sql"
    
    if [ ! -f "$MIGRATION_FILE" ]; then
        echo "❌ Fichier de migration non trouvé: $MIGRATION_FILE"
        exit 1
    fi
    
    echo "📝 Exécution directe du SQL..."
    echo ""
    echo "⚠️  Note: Cette méthode nécessite que vous exécutiez le SQL manuellement"
    echo "   dans Supabase Dashboard > SQL Editor"
    echo ""
    echo "📋 Instructions:"
    echo "   1. Ouvrez https://supabase.com/dashboard"
    echo "   2. Sélectionnez votre projet"
    echo "   3. Allez dans SQL Editor"
    echo "   4. Copiez le contenu de: $MIGRATION_FILE"
    echo "   5. Collez et exécutez (Run)"
    echo ""
    
    # Afficher le contenu du fichier pour faciliter le copier-coller
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📄 Contenu du fichier SQL à copier:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat "$MIGRATION_FILE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    exit 1
fi

