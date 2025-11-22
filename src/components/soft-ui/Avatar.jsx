/**
 * Composant Avatar - Avatar style Soft UI
 * 
 * Ce composant affiche un avatar avec une image ou les initiales en fallback.
 * 
 * @param {string} src - URL de l'image
 * @param {string} alt - Texte alternatif
 * @param {string} name - Nom pour générer les initiales
 * @param {string} size - Taille (sm/md/lg/xl)
 * @param {string} className - Classes CSS supplémentaires
 */

function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
}) {
  // Tailles
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  // Générer les initiales
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-soft overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // En cas d'erreur de chargement, afficher les initiales
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`w-full h-full flex items-center justify-center ${
          src ? 'hidden' : ''
        }`}
      >
        {initials}
      </div>
    </div>
  );
}

export default Avatar;

