/**
 * Composant StatCard - Carte de statistique style Soft UI
 * 
 * Ce composant affiche une statistique avec une icône, un titre, une valeur
 * et optionnellement une variation (pourcentage).
 * 
 * @param {ReactNode} icon - Icône à afficher
 * @param {string} title - Titre de la statistique
 * @param {string|number} value - Valeur à afficher
 * @param {string} variation - Variation à afficher (ex: "+12%")
 * @param {string} variationColor - Couleur de la variation ("success" | "danger")
 * @param {string} iconBg - Couleur de fond de l'icône (primary/info/success/warning)
 * @param {string} className - Classes CSS supplémentaires
 */

import Card from '../common/Card';

function StatCard({
  icon,
  title,
  value,
  variation,
  variationColor = 'success',
  iconBg = 'primary',
  className = '',
}) {
  // Couleurs de fond pour l'icône
  const iconBgClasses = {
    primary: 'bg-primary/10 text-primary',
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-error/10 text-error',
    secondary: 'bg-secondary/10 text-secondary',
  };

  // Couleurs pour la variation
  const variationColorClasses = {
    success: 'text-success',
    danger: 'text-error',
    info: 'text-info',
    warning: 'text-warning',
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        {/* Icône */}
        <div className={`p-3 rounded-xl ${iconBgClasses[iconBg] || iconBgClasses.primary} transition-all duration-300`}>
          {icon}
        </div>
      </div>
      
      {/* Contenu */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        
        {/* Variation */}
        {variation && (
          <div className="mt-2 flex items-center">
            <span className={`text-sm font-semibold ${variationColorClasses[variationColor] || variationColorClasses.success}`}>
              {variation}
            </span>
            <span className="text-xs text-gray-500 ml-2">vs mois dernier</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatCard;

