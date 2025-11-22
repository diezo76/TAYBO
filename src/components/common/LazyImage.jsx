/**
 * Composant LazyImage
 * 
 * Composant d'image avec lazy loading natif et Intersection Observer
 * pour optimiser le chargement des images.
 */

import { useState, useRef, useEffect } from 'react';

/**
 * Composant LazyImage
 * @param {Object} props - Props du composant
 * @param {string} props.src - URL de l'image
 * @param {string} props.alt - Texte alternatif
 * @param {string} props.className - Classes CSS
 * @param {Function} props.onError - Callback en cas d'erreur
 * @param {Object} props.placeholder - Options pour le placeholder
 * @param {string} props.placeholder.color - Couleur du placeholder
 * @param {string} props.placeholder.text - Texte du placeholder
 */
function LazyImage({
  src,
  alt = '',
  className = '',
  onError = null,
  placeholder = { color: '#f3f4f6', text: '' },
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Si l'image n'est pas encore chargée
    if (!imageSrc && src) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Si l'image est visible dans le viewport
            if (entry.isIntersecting) {
              // Charger l'image
              setImageSrc(src);
              // Arrêter d'observer cette image
              observer.unobserve(entry.target);
            }
          });
        },
        {
          // Déclencher le chargement quand l'image est à 50px du viewport
          rootMargin: '50px',
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    }
  }, [src, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(false);
    if (onError) {
      onError(e);
    }
  };

  // Si erreur, afficher un placeholder
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ backgroundColor: placeholder.color }}
        {...props}
      >
        {placeholder.text && (
          <span className="text-gray-400 text-sm">{placeholder.text}</span>
        )}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {/* Placeholder pendant le chargement */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
          style={{ backgroundColor: placeholder.color }}
        >
          {placeholder.text && (
            <span className="text-gray-400 text-xs">{placeholder.text}</span>
          )}
        </div>
      )}
      
      {/* Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
      
      {/* Si pas encore chargé et pas d'imageSrc, afficher le placeholder */}
      {!imageSrc && (
        <div
          className={`flex items-center justify-center bg-gray-100 ${className}`}
          style={{ backgroundColor: placeholder.color }}
        >
          {placeholder.text && (
            <span className="text-gray-400 text-xs">{placeholder.text}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default LazyImage;

