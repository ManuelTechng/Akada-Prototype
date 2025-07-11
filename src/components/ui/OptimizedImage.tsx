import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useIsOnline, useReducedData } from '../../hooks/useResponsive';
import { useDarkMode } from '../../hooks/useDarkMode';
import {
  generateOptimizedImageUrl,
  generateSrcSet,
  getResponsiveSizes,
  createLazyLoadObserver,
  generateBlurPlaceholder,
  getShimmerPlaceholder,
  monitorImagePerformance,
  getOptimalFormat,
  type ImageOptions,
  type OptimizedImageProps
} from '../../utils/imageOptimization';

// ======================================
// OPTIMIZED IMAGE COMPONENT
// ======================================

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  options = {},
  onLoad,
  onError
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!options.lazy);
  const [loadStartTime] = useState(() => performance.now());

  // Hooks for network and performance optimization
  const network = useIsOnline();
  const { shouldCompressImages, shouldLazyLoad } = useReducedData();
  const { isDark } = useDarkMode();

  // Determine if we should use lazy loading
  const shouldUseLazyLoading = options.lazy !== false && (shouldLazyLoad || options.lazy);

  // Network conditions for optimization
  const networkConditions = {
    isSlowConnection: network.isSlowConnection,
    is3G: network.is3G,
    saveData: network.saveData || shouldCompressImages
  };

  // Optimize image options based on network conditions
  const optimizedOptions: ImageOptions = {
    quality: networkConditions.saveData ? 60 : (networkConditions.is3G ? 70 : 80),
    format: getOptimalFormat(),
    ...options
  };

  // Generate optimized URLs
  const optimizedSrc = generateOptimizedImageUrl(src, optimizedOptions, networkConditions);
  
  // Generate srcSet for responsive images
  const srcSet = options.width ? generateSrcSet(
    src,
    [
      Math.round(options.width * 0.5),
      options.width,
      Math.round(options.width * 1.5),
      Math.round(options.width * 2)
    ].filter(w => w > 0),
    optimizedOptions,
    networkConditions
  ) : undefined;

  // Generate sizes attribute
  const sizes = options.width ? getResponsiveSizes(options.width) : undefined;

  // Generate blur placeholder
  const blurPlaceholder = options.placeholder === 'blur' 
    ? generateBlurPlaceholder(src)
    : undefined;

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    
    // Monitor performance
    monitorImagePerformance(src, loadStartTime, true);
    
    if (onLoad) {
      onLoad();
    }
  }, [src, loadStartTime, onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    
    // Monitor performance
    monitorImagePerformance(src, loadStartTime, false);
    
    if (onError) {
      onError();
    }
  }, [src, loadStartTime, onError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!shouldUseLazyLoading || !imgRef.current) return;

    const observer = createLazyLoadObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: networkConditions.isSlowConnection ? '300px' : '200px', // Larger margin for slow connections
        threshold: 0.1
      }
    );

    if (observer && imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [shouldUseLazyLoading, networkConditions.isSlowConnection]);

  // Preload high-priority images
  useEffect(() => {
    if (options.priority && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = optimizedSrc;
        if (srcSet) link.setAttribute('imagesrcset', srcSet);
        if (sizes) link.setAttribute('imagesizes', sizes);
        document.head.appendChild(link);
      });
    }
  }, [options.priority, optimizedSrc, srcSet, sizes]);

  // Render placeholder while loading
  const renderPlaceholder = () => {
    if (options.placeholder === 'blur' && blurPlaceholder) {
      return (
        <img
          src={blurPlaceholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
          aria-hidden="true"
        />
      );
    }

    if (options.placeholder === 'shimmer') {
      return (
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background: getShimmerPlaceholder(isDark),
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }}
          aria-hidden="true"
        />
      );
    }

    if (!isLoaded && !hasError) {
      return (
        <div
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />
      );
    }

    return null;
  };

  // Render error state
  if (hasError && options.fallback) {
    return (
      <img
        ref={imgRef}
        src={options.fallback}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        onLoad={handleLoad}
        loading="lazy"
      />
    );
  }

  // Render error placeholder
  if (hasError) {
    return (
      <div
        className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm relative overflow-hidden`}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {renderPlaceholder()}

      {/* Main image */}
      {(isInView || !shouldUseLazyLoading) && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={shouldUseLazyLoading ? 'lazy' : 'eager'}
          decoding="async"
          // Performance hints
          fetchPriority={options.priority ? 'high' : 'auto'}
        />
      )}
    </div>
  );
};

// ======================================
// UNIVERSITY LOGO COMPONENT
// ======================================

interface UniversityLogoProps {
  universityName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  lazy?: boolean;
}

export const UniversityLogo: React.FC<UniversityLogoProps> = ({
  universityName,
  size = 'medium',
  className = '',
  lazy = true
}) => {
  // Generate logo URL
  const logoSrc = `/images/universities/${universityName.toLowerCase().replace(/\s+/g, '-')}.png`;
  const fallbackSrc = `/images/university-placeholder.png`;

  // Size configurations
  const sizeConfig = {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 }
  };

  const { width, height } = sizeConfig[size];

  return (
    <OptimizedImage
      src={logoSrc}
      alt={`${universityName} logo`}
      className={`rounded-lg ${className}`}
      options={{
        width,
        height,
        quality: 90,
        lazy,
        placeholder: 'shimmer',
        fallback: fallbackSrc
      }}
    />
  );
};

// ======================================
// PROGRAM IMAGE COMPONENT
// ======================================

interface ProgramImageProps {
  programName: string;
  universityName: string;
  imageUrl?: string;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
}

export const ProgramImage: React.FC<ProgramImageProps> = ({
  programName,
  universityName,
  imageUrl,
  className = '',
  lazy = true,
  priority = false
}) => {
  // Use provided image or generate placeholder
  const src = imageUrl || `/images/programs/placeholder.jpg`;
  const fallbackSrc = `/images/program-placeholder.jpg`;

  return (
    <OptimizedImage
      src={src}
      alt={`${programName} at ${universityName}`}
      className={`rounded-lg ${className}`}
      options={{
        width: 400,
        height: 240,
        quality: 80,
        lazy: !priority && lazy,
        priority,
        placeholder: 'blur',
        fallback: fallbackSrc
      }}
    />
  );
};

// ======================================
// COUNTRY FLAG COMPONENT
// ======================================

interface CountryFlagProps {
  countryCode: string;
  countryName: string;
  size?: 'small' | 'medium';
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  countryName,
  size = 'small',
  className = ''
}) => {
  const flagSrc = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
  const fallbackSrc = `/images/flags/default.svg`;

  const sizeConfig = {
    small: { width: 20, height: 15 },
    medium: { width: 32, height: 24 }
  };

  const { width, height } = sizeConfig[size];

  return (
    <OptimizedImage
      src={flagSrc}
      alt={`${countryName} flag`}
      className={`inline-block ${className}`}
      options={{
        width,
        height,
        quality: 90,
        lazy: false, // Flags are small, no need for lazy loading
        fallback: fallbackSrc
      }}
    />
  );
};

export default OptimizedImage;