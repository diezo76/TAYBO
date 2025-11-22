/**
 * Configuration i18n (Internationalisation)
 * 
 * Ce fichier configure le système de traduction multi-langues.
 * Taybo supporte 3 langues : Français (fr), Arabe (ar), Anglais (en)
 * 
 * L'arabe nécessite le support RTL (Right-to-Left) qui sera géré dans App.jsx
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import des fichiers de traduction
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import en from './locales/en.json';

// Initialisation de i18next avec react-i18next
i18n
  .use(initReactI18next) // Passe i18n à react-i18next pour l'intégration React
  .init({
    // Ressources de traduction pour chaque langue
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
      en: { translation: en },
    },
    
    // Langue par défaut : Français
    lng: 'fr',
    
    // Langue de secours si une traduction manque
    fallbackLng: 'fr',
    
    // Interpolation : React échappe déjà les valeurs, donc on désactive l'échappement ici
    interpolation: {
      escapeValue: false,
    },
    
    // Détection automatique de la langue du navigateur (optionnel)
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;


