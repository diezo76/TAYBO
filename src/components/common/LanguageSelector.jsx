/**
 * Composant LanguageSelector
 * 
 * Permet à l'utilisateur de changer la langue de l'application.
 * Supporte 3 langues : Français (fr), Arabe (ar), Anglais (en)
 * 
 * Quand l'utilisateur sélectionne l'arabe, le document HTML passe en RTL
 * (Right-to-Left) automatiquement grâce à useEffect dans App.jsx
 */

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function LanguageSelector() {
  // Hook useTranslation pour accéder aux fonctions de traduction
  const { i18n } = useTranslation();

  // Liste des langues disponibles avec leurs labels
  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇪🇬' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  // Fonction appelée quand l'utilisateur change de langue
  const handleLanguageChange = (langCode) => {
    // Change la langue dans i18next
    i18n.changeLanguage(langCode);
    
    // Sauvegarde la préférence dans le localStorage
    // Comme ça, la langue choisie sera conservée au prochain chargement
    localStorage.setItem('taybo-language', langCode);
  };

  return (
    <div className="relative group">
      {/* Bouton avec icône globe */}
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Changer la langue"
      >
        <Globe className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
        </span>
      </button>

      {/* Menu déroulant avec les langues */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
              i18n.language === lang.code ? 'bg-primary/10 font-semibold' : ''
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="text-sm">{lang.label}</span>
            {i18n.language === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageSelector;


