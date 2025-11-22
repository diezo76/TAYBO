/**
 * Composant Input - Champ de saisie style Soft UI avec label et gestion d'erreurs
 * 
 * Ce composant crée un champ de saisie stylisé selon le design Soft UI Dashboard.
 * Il supporte un label au-dessus, des messages d'erreur et des icônes.
 * 
 * @param {string} label - Label à afficher au-dessus du champ
 * @param {string} type - Type HTML (text/email/password/etc.)
 * @param {string} placeholder - Texte placeholder
 * @param {string} value - Valeur du champ
 * @param {function} onChange - Fonction appelée lors du changement
 * @param {boolean} disabled - Champ désactivé
 * @param {string} error - Message d'erreur à afficher
 * @param {ReactNode} icon - Icône à afficher à gauche
 * @param {ReactNode} rightIcon - Icône à afficher à droite
 * @param {string} className - Classes CSS supplémentaires
 */

function Input({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error,
  icon,
  rightIcon,
  className = '',
  required = false,
  ...props
}) {
  const inputClasses = `
    w-full px-4 py-2.5 border rounded-xl
    focus:ring-2 focus:ring-primary focus:border-transparent 
    transition-all duration-200 bg-white text-gray-900
    ${icon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${error ? 'border-error focus:ring-error' : 'border-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {/* Champ de saisie */}
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
          required={required}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <p className="mt-1 text-sm text-error flex items-center gap-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default Input;

