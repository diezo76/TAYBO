#!/bin/bash
# Script de diagnostic rapide pour les problèmes de Storage Supabase
# Ce script vous guide pour résoudre les problèmes d'images

echo "=========================================="
echo "🔍 DIAGNOSTIC STORAGE SUPABASE"
echo "=========================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erreur : Ce script doit être exécuté depuis la racine du projet Taybo${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Ce script va vous aider à diagnostiquer les problèmes d'images.${NC}"
echo ""

# Étape 1 : Vérifier les fichiers nécessaires
echo -e "${YELLOW}Étape 1/4 : Vérification des fichiers de configuration...${NC}"
if [ -f ".env" ]; then
  echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
  
  if grep -q "VITE_SUPABASE_URL" .env; then
    echo -e "${GREEN}✅ VITE_SUPABASE_URL configuré${NC}"
  else
    echo -e "${RED}❌ VITE_SUPABASE_URL manquant dans .env${NC}"
  fi
  
  if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
    echo -e "${GREEN}✅ VITE_SUPABASE_ANON_KEY configuré${NC}"
  else
    echo -e "${RED}❌ VITE_SUPABASE_ANON_KEY manquant dans .env${NC}"
  fi
else
  echo -e "${RED}❌ Fichier .env non trouvé${NC}"
  echo -e "${YELLOW}   → Créez un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY${NC}"
fi
echo ""

# Étape 2 : Vérifier les scripts SQL
echo -e "${YELLOW}Étape 2/4 : Vérification des scripts SQL...${NC}"

scripts=(
  "supabase/migrations/016_setup_storage_policies.sql"
  "scripts/check-storage-setup.sql"
  "scripts/fix-storage-policies.sql"
)

all_scripts_exist=true
for script in "${scripts[@]}"; do
  if [ -f "$script" ]; then
    echo -e "${GREEN}✅ $script trouvé${NC}"
  else
    echo -e "${RED}❌ $script manquant${NC}"
    all_scripts_exist=false
  fi
done
echo ""

# Étape 3 : Instructions pour Supabase Dashboard
echo -e "${YELLOW}Étape 3/4 : Actions à effectuer dans Supabase Dashboard${NC}"
echo ""
echo -e "${BLUE}🌐 Ouvrez Supabase Dashboard :${NC}"
echo "   https://supabase.com/dashboard"
echo ""
echo -e "${BLUE}📦 Vérifiez les Buckets Storage :${NC}"
echo "   1. Allez dans Storage (menu de gauche)"
echo "   2. Vérifiez que ces buckets existent :"
echo "      - restaurant-images (Public : OUI)"
echo "      - menu-images (Public : OUI)"
echo "      - user-images (Public : OUI)"
echo "      - passports (Public : NON)"
echo ""
echo -e "${BLUE}🔐 Appliquez les Policies RLS :${NC}"
echo "   1. Allez dans SQL Editor"
echo "   2. Ouvrez et exécutez : supabase/migrations/016_setup_storage_policies.sql"
echo "   3. Vérifiez qu'il n'y a pas d'erreurs"
echo ""
echo -e "${BLUE}🔍 Diagnostic Avancé (si le problème persiste) :${NC}"
echo "   1. Dans SQL Editor, exécutez : scripts/check-storage-setup.sql"
echo "   2. Analysez les résultats"
echo "   3. Si nécessaire, exécutez : scripts/fix-storage-policies.sql"
echo ""

# Étape 4 : Test de l'URL
echo -e "${YELLOW}Étape 4/4 : Test de l'URL de l'image${NC}"
echo ""
echo "Copiez l'URL de l'image depuis l'erreur dans la console et testez-la :"
echo ""
echo "Exemple d'URL :"
echo "https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/[ID]/[fichier].jpeg"
echo ""
echo -e "${BLUE}Résultats possibles :${NC}"
echo "  • Code 200 (image affichée) → Problème de cache navigateur (Ctrl+F5)"
echo "  • Code 404 (non trouvé) → Le fichier n'existe pas, ré-uploadez l'image"
echo "  • Code 403 (accès refusé) → Policies RLS manquantes, exécutez fix-storage-policies.sql"
echo "  • Code 400 (bucket non trouvé) → Le bucket n'existe pas, créez-le"
echo ""

# Résumé
echo "=========================================="
echo -e "${GREEN}✨ RÉSUMÉ DES ACTIONS${NC}"
echo "=========================================="
echo ""
echo "1. ✅ Vérifier que le fichier .env est configuré"
echo "2. 📦 Créer les 4 buckets dans Supabase Storage"
echo "3. 🔐 Exécuter la migration 016_setup_storage_policies.sql"
echo "4. 🔍 Tester l'URL directement dans le navigateur"
echo "5. 🔄 Rafraîchir l'application (Ctrl+F5)"
echo ""
echo -e "${BLUE}📖 Pour plus de détails, consultez :${NC}"
echo "   - GUIDE_RESOLUTION_IMAGES_STORAGE.md (guide complet)"
echo "   - supabase/STORAGE_SETUP.md (configuration initiale)"
echo "   - GUIDE_DEBUG_IMAGES_STORAGE.md (débogage avancé)"
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Diagnostic terminé !${NC}"
echo "=========================================="

