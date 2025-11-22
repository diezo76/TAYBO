/**
 * Composant Badge - Badge réutilisable style Soft UI
 * 
 * Ce composant crée un badge stylisé selon le design Soft UI Dashboard.
 * 
 * @param {string} variant - Style du badge (primary/secondary/info/success/warning/error)
 * @param {string} size - Taille (sm/md/lg)
 * @param {ReactNode} children - Contenu du badge
 */

function Badge({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  // Classes CSS selon le variant
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  };

  // Classes CSS selon la taille
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  // Classes finales combinées
  const classes = `
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

export default Badge;

