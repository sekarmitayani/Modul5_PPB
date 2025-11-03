// src/hooks/useLazyImage.js
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for lazy loading images using Intersection Observer
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image URL (optional)
 * @returns {Object} - { imageSrc, imageRef, isLoaded }
 */
export const useLazyImage = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    let observer;
    let didCancel = false;

    if (imageRef.current && src) {
      // Check if IntersectionObserver is supported
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              // When image is in viewport
              if (!didCancel && (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                setImageSrc(src);
                setIsLoaded(true);
                observer.unobserve(imageRef.current);
              }
            });
          },
          {
            threshold: 0.01,
            rootMargin: '50px', // Start loading 50px before entering viewport
          }
        );

        observer.observe(imageRef.current);
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        setImageSrc(src);
        setIsLoaded(true);
      }
    }

    return () => {
      didCancel = true;
      // Cleanup observer
      if (observer && observer.unobserve && imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src, placeholder]);

  return { imageSrc, imageRef, isLoaded };
};

/**
 * Lazy Image Component
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '',
  ...props 
}) => {
  const { imageSrc, imageRef, isLoaded } = useLazyImage(src, placeholder);

  return (
    <img
      ref={imageRef}
      src={imageSrc || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E'}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}
      {...props}
    />
  );
};

export default useLazyImage;
