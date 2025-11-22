/**
 * Composant Button - Bouton réutilisable
 * 
 * Ce composant crée un bouton stylisé selon le design system Taybo.
 * Il supporte différentes variantes et tailles.
 * 
 * @param {string} variant - Style du bouton (primary/secondary/outline/danger)
 * @param {string} size - Taille (sm/md/lg)
 * @param {function} onClick - Fonction appelée au clic
 * @param {boolean} disabled - Bouton désactivé
 * @param {boolean} loading - État de chargement (affiche un spinner)
 * @param {string} type - Type HTML (button/submit/reset)
 * @param {ReactNode} children - Contenu du bouton
 */

function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  children,
  className = '',
  loading,
  ...props
}) {
  // Classes CSS selon le variant (style) - Soft UI Dashboard
  const variantClasses = {
    primary: 'btn-soft-primary',
    secondary: 'btn-soft-secondary',
    outline: 'btn-soft-outline',
    danger: 'bg-error text-white hover:bg-error-600 shadow-soft hover:shadow-soft-md',
    ghost: 'text-gray-700 hover:bg-gray-100 shadow-none',
    info: 'bg-info text-white hover:bg-info-600 shadow-soft hover:shadow-soft-md',
    success: 'bg-success text-white hover:bg-success-600 shadow-soft hover:shadow-soft-md',
    warning: 'bg-warning text-white hover:bg-warning-600 shadow-soft hover:shadow-soft-md',
    gradient: 'btn-gradient',
  };

  // Classes CSS selon la taille
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  // Classes finales combinées
  const classes = `
    rounded-xl font-medium transition-all duration-200
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;


