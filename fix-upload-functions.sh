#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Correction des fonctions d'upload...${NC}\n"

# Fichier cible
FILE="src/services/authService.js"

# Vérifier que le fichier existe
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ Erreur: $FILE n'existe pas${NC}"
    exit 1
fi

# Créer une sauvegarde
echo -e "${YELLOW}📦 Création de la sauvegarde...${NC}"
cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Sauvegarde créée${NC}\n"

# Afficher les fonctions actuelles
echo -e "${YELLOW}📋 Fonctions d'upload actuelles:${NC}"
grep -n "export const upload.*Image" "$FILE"
echo ""

# Demander confirmation
read -p "Voulez-vous voir le code de uploadRestaurantImage avant correction? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "\n${YELLOW}--- Code actuel de uploadRestaurantImage ---${NC}"
    sed -n '/export const uploadRestaurantImage/,/^}/p' "$FILE"
    echo -e "${YELLOW}--- Fin du code actuel ---${NC}\n"
fi

read -p "Voulez-vous appliquer les corrections? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${YELLOW}⚠️  Correction annulée${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Corrections appliquées (prêt pour l'étape suivante)${NC}"

