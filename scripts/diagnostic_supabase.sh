#!/bin/bash

# Script de diagnostic Supabase
# Vérifie la configuration et la connexion à Supabase

echo "🔍 Diagnostic Supabase - Taybo"
echo "================================"
echo ""

# 1. Vérifier le fichier .env
echo "1. Vérification du fichier .env..."
if [ -f .env ]; then
    echo "   ✅ Fichier .env existe"
    
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "   ✅ Variable VITE_SUPABASE_URL présente"
        SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d '=' -f2)
        echo "   📍 URL: $SUPABASE_URL"
    else
        echo "   ❌ Variable VITE_SUPABASE_URL manquante"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "   ✅ Variable VITE_SUPABASE_ANON_KEY présente"
        KEY_LENGTH=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d '=' -f2 | wc -c)
        echo "   📏 Longueur de la clé: $KEY_LENGTH caractères"
    else
        echo "   ❌ Variable VITE_SUPABASE_ANON_KEY manquante"
    fi
else
    echo "   ❌ Fichier .env n'existe pas"
    echo "   💡 Créez le fichier .env avec les variables Supabase"
fi

echo ""

# 2. Vérifier la connexion à Supabase
echo "2. Vérification de la connexion à Supabase..."
SUPABASE_URL="https://ocxesczzlzopbcobppok.supabase.co"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SUPABASE_URL/rest/v1/" 2>&1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "   ✅ Connexion réussie (HTTP $HTTP_CODE)"
    echo "   📡 L'API Supabase répond"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "   ❌ Échec de la connexion"
    echo "   💡 Vérifiez votre connexion Internet"
else
    echo "   ⚠️  Réponse inattendue (HTTP $HTTP_CODE)"
    echo "   💡 Vérifiez le statut du projet dans Supabase Dashboard"
fi

echo ""

# 3. Vérifier si le serveur de développement tourne
echo "3. Vérification du serveur de développement..."
if pgrep -f "vite" > /dev/null; then
    echo "   ✅ Serveur Vite en cours d'exécution"
else
    echo "   ⚠️  Serveur Vite non détecté"
    echo "   💡 Lancez 'npm run dev' pour démarrer le serveur"
fi

echo ""
echo "================================"
echo "✅ Diagnostic terminé"
echo ""
echo "💡 Si des problèmes persistent :"
echo "   1. Redémarrez le serveur: npm run dev"
echo "   2. Videz le cache du navigateur"
echo "   3. Vérifiez le statut du projet dans Supabase Dashboard"
echo "   4. Consultez GUIDE_RESOLUTION_ERREUR_FETCH_SUPABASE.md"

