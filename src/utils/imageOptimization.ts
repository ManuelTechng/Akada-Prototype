// ======================================
// IMAGE OPTIMIZATION PIPELINE
// 3G-Optimized for Nigerian Networks
// ======================================

import { useReducedData, useIsOnline } from '../hooks/useResponsive';

// ======================================
// TYPES AND INTERFACES
// ======================================

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  lazy?: boolean;
  placeholder?: 'blur' | 'empty' | 'shimmer';
  priority?: boolean;
  fallback?: string;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  options?: ImageOptions;
  onLoad?: () => void;
  onError?: () => void;
}

// ======================================
// OPTIMIZATION UTILITIES
// ======================================

/**
 * Generate optimized image URL based on network conditions
 * Automatically adjusts quality and format for 3G networks
 */
export const generateOptimizedImageUrl = (
  src: string, 
  options: ImageOptions = {},
  networkConditions?: {
    isSlowConnection: boolean;
    is3G: boolean;
    saveData: boolean;
  }
): string => {
  // Default options
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  // Adjust quality based on network conditions
  let adjustedQuality = quality;
  if (networkConditions?.saveData || networkConditions?.isSlowConnection) {
    adjustedQuality = Math.min(quality, 60); // Reduce quality for slow connections
  } else if (networkConditions?.is3G) {
    adjustedQuality = Math.min(quality, 70); // Moderate reduction for 3G
  }

  // If it's already an optimized URL or external URL, handle appropriately
  if (src.startsWith('http') && !src.includes('localhost')) {
    // External URL - add query params for optimization services
    const url = new URL(src);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', adjustedQuality.toString());
    url.searchParams.set('f', format);
    url.searchParams.set('fit', 'cover');
    return url.toString();
  }

  // Local images - construct optimization URL
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', adjustedQuality.toString());
  params.set('f', format);
  params.set('fit', 'cover');

  return `${src}?${params.toString()}`;
};

/**
 * Get responsive image sizes for different breakpoints
 * Optimized for Nigerian mobile devices
 */
export const getResponsiveSizes = (
  baseWidth: number,
  options: { mobile?: number; tablet?: number; desktop?: number } = {}
): string => {
  const {
    mobile = Math.min(baseWidth, 375), // Max mobile width (iPhone SE)
    tablet = Math.min(baseWidth, 768), // Max tablet width
    desktop = baseWidth
  } = options;

  return `(max-width: 375px) ${mobile}px, (max-width: 768px) ${tablet}px, ${desktop}px`;
};

/**
 * Generate image srcSet for responsive images
 * Creates multiple image variants for different screen densities
 */
export const generateSrcSet = (
  src: string,
  widths: number[],
  options: ImageOptions = {},
  networkConditions?: {
    isSlowConnection: boolean;
    is3G: boolean;
    saveData: boolean;
  }
): string => {
  // Reduce number of variants for slow connections
  let optimizedWidths = widths;
  if (networkConditions?.isSlowConnection) {
    optimizedWidths = widths.filter((_, index) => index % 2 === 0); // Take every other width
  }

  return optimizedWidths
    .map(width => {
      const optimizedUrl = generateOptimizedImageUrl(
        src,
        { ...options, width },
        networkConditions
      );
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

// ======================================
// LAZY LOADING UTILITIES
// ======================================

/**
 * Create intersection observer for lazy loading
 * Optimized for 3G networks with larger root margins
 */
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const {
    rootMargin = '200px', // Larger margin for 3G to preload images
    threshold = 0.1
  } = options;

  return new IntersectionObserver(callback, {
    rootMargin,
    threshold
  });
};

/**
 * Preload critical images
 * Prioritize above-the-fold images for faster perceived loading
 */
export const preloadImage = (
  src: string,
  options: ImageOptions = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    // Add responsive preloading for modern browsers
    if (options.width) {
      link.setAttribute('imagesizes', getResponsiveSizes(options.width));
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
};

// ======================================
// PLACEHOLDER GENERATION
// ======================================

/**
 * Generate blur placeholder for smooth loading transitions
 * Creates a small, heavily compressed version for instant display
 */
export const generateBlurPlaceholder = (
  src: string,
  width: number = 40,
  height: number = 40
): string => {
  return generateOptimizedImageUrl(src, {
    width,
    height,
    quality: 10,
    format: 'jpeg'
  });
};

/**
 * Generate shimmer placeholder CSS
 * Pure CSS animation for loading states
 */
export const getShimmerPlaceholder = (isDark: boolean = false): string => {
  const baseColor = isDark ? '#374151' : '#f3f4f6';
  const shimmerColor = isDark ? '#4b5563' : '#e5e7eb';
  
  return `
    background: linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  `;
};

// ======================================
// IMAGE CACHING UTILITIES
// ======================================

/**
 * Cache management for optimized images
 * Implements LRU cache for browser storage limitations
 */
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Delete if exists to move to end
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, value);
  }

  get(key: string): string | undefined {
    if (this.cache.has(key)) {
      // Move to end (mark as recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache(50);

// ======================================
// UNIVERSITY LOGO UTILITIES
// ======================================

/**
 * Get optimized university logo
 * Handles fallbacks and provides consistent sizing
 */
export const getUniversityLogo = (
  universityName: string,
  options: {
    size?: 'small' | 'medium' | 'large';
    fallback?: boolean;
  } = {}
): {
  src: string;
  srcSet?: string;
  sizes?: string;
  fallback: string;
} => {
  const { size = 'medium', fallback = true } = options;
  
  // Size configurations
  const sizeConfig = {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 }
  };

  const { width, height } = sizeConfig[size];
  
  // Construct logo URL (you would replace this with your actual logo service)
  const logoSrc = `/images/universities/${universityName.toLowerCase().replace(/\s+/g, '-')}.png`;
  
  // Fallback options
  const fallbackSrc = fallback 
    ? `/images/university-placeholder-${size}.png`
    : '';

  return {
    src: generateOptimizedImageUrl(logoSrc, { width, height, quality: 90 }),
    srcSet: generateSrcSet(logoSrc, [width, width * 2], { quality: 90 }),
    sizes: `${width}px`,
    fallback: fallbackSrc
  };
};

// ======================================
// PERFORMANCE MONITORING
// ======================================

/**
 * Monitor image loading performance
 * Track metrics for optimization improvements
 */
export const monitorImagePerformance = (
  src: string,
  startTime: number,
  success: boolean,
  fileSize?: number
): void => {
  const loadTime = performance.now() - startTime;
  
  // Log to analytics or performance monitoring service
  if (typeof window !== 'undefined' && window.console) {
    console.log('Image Performance:', {
      src,
      loadTime: `${loadTime.toFixed(2)}ms`,
      success,
      fileSize: fileSize ? `${(fileSize / 1024).toFixed(2)}KB` : 'unknown'
    });
  }

  // Send to analytics service
  // analytics.track('image_load', { src, loadTime, success, fileSize });
};

// ======================================
// WEBP SUPPORT DETECTION
// ======================================

/**
 * Check if browser supports WebP format
 * Fallback to JPEG for older browsers
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalFormat = (): 'webp' | 'jpeg' => {
  return supportsWebP() ? 'webp' : 'jpeg';
};

// ======================================
// EXPORT UTILITIES
// ======================================

export default {
  generateOptimizedImageUrl,
  getResponsiveSizes,
  generateSrcSet,
  createLazyLoadObserver,
  preloadImage,
  generateBlurPlaceholder,
  getShimmerPlaceholder,
  imageCache,
  getUniversityLogo,
  monitorImagePerformance,
  supportsWebP,
  getOptimalFormat
};