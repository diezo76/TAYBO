/**
 * Composant Card - Carte réutilisable style Soft UI
 * 
 * Ce composant crée une carte stylisée selon le design Soft UI Dashboard.
 * Il supporte différentes variantes, tailles et structure (header/body/footer).
 * 
 * @param {string} variant - Style de la carte (soft/soft-md/soft-lg/gradient)
 * @param {string} gradient - Type de gradient (primary/info/success/warning)
 * @param {boolean} hover - Activer l'effet hover
 * @param {string} padding - Padding par défaut (p-6 par défaut)
 * @param {ReactNode} title - Titre de la carte (affiche un header)
 * @param {ReactNode} header - Contenu personnalisé du header
 * @param {ReactNode} footer - Contenu du footer
 * @param {ReactNode} children - Contenu principal (body)
 * @param {string} className - Classes CSS supplémentaires
 */

function Card({
  variant = 'soft',
  gradient = 'primary',
  hover = true,
  padding = 'p-6',
  title,
  header,
  footer,
  className = '',
  children,
  loading,
  ...props
}) {
  // Classes CSS selon le variant
  const variantClasses = {
    soft: 'card-soft',
    'soft-md': 'card-soft-md',
    'soft-lg': 'card-soft-lg',
    gradient: `card-gradient`,
    'gradient-info': 'card-gradient-info',
    'gradient-success': 'card-gradient-success',
    'gradient-warning': 'card-gradient-warning',
  };

  // Si header ou footer, utiliser une structure spécifique
  const hasHeader = title || header;
  const hasFooter = footer;

  // Gérer les border-radius selon la présence de header/footer
  // Les classes card-soft ont déjà un border-radius par défaut
  // On doit l'override si header/footer sont présents
  let borderRadiusOverride = '';
  if (hasHeader && hasFooter) {
    borderRadiusOverride = '!rounded-none'; // Pas de border-radius sur le container
  } else if (hasHeader) {
    borderRadiusOverride = '!rounded-b-xl !rounded-t-none'; // Seulement le bas
  } else if (hasFooter) {
    borderRadiusOverride = '!rounded-t-xl !rounded-b-none'; // Seulement le haut
  }

  // Classes finales combinées
  const baseClasses = `
    ${variantClasses[variant] || variantClasses.soft}
    ${borderRadiusOverride}
    ${!hover ? 'hover:transform-none hover:shadow-none' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={baseClasses} {...props}>
      {/* Header */}
      {hasHeader && (
        <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${hasFooter ? '' : 'rounded-t-xl'}`}>
          {title && (
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          )}
          {header && <div>{header}</div>}
        </div>
      )}
      
      {/* Body */}
      <div className={padding}>
        {children}
      </div>
      
      {/* Footer */}
      {hasFooter && (
        <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${hasHeader ? '' : 'rounded-b-xl'}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;

