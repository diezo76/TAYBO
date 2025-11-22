/**
 * Composant Input - Champ de saisie réutilisable style Soft UI
 * 
 * Ce composant crée un champ de saisie stylisé selon le design Soft UI Dashboard.
 * 
 * @param {string} type - Type HTML (text/email/password/etc.)
 * @param {string} placeholder - Texte placeholder
 * @param {string} value - Valeur du champ
 * @param {function} onChange - Fonction appelée lors du changement
 * @param {boolean} disabled - Champ désactivé
 * @param {ReactNode} icon - Icône à afficher à gauche
 * @param {ReactNode} rightIcon - Icône à afficher à droite
 */

function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  icon,
  rightIcon,
  className = '',
  error = false,
  ...props
}) {
  const inputClasses = `
    input-soft
    ${icon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${error ? 'border-error focus:ring-error' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
}

export default Input;

