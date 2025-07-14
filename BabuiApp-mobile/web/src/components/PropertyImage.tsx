import React, { useState, useRef, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface PropertyImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  webpSrc?: string;
}

const PropertyImage: React.FC<PropertyImageProps> = ({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
  webpSrc
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError) {
    return (
      <div
        className={`
          flex items-center justify-center
          bg-gray-100 text-gray-400
          ${className}
        `}
      >
        <ImageOff size={24} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {isInView && (
        <picture>
          {webpSrc && (
            <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
          )}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full object-cover transition-opacity duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </picture>
      )}
    </div>
  );
};

export default PropertyImage;