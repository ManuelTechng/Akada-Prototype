import { useState, useEffect, useCallback, useRef } from 'react';

// ======================================
// TYPES AND CONSTANTS
// ======================================

export type BreakpointKey = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'offline' | 'unknown';

export interface ResponsiveBreakpoints {
  mobile: number;    // 375px - iPhone SE and larger
  tablet: number;    // 768px - iPad and larger  
  desktop: number;   // 1024px - Desktop and larger
  wide: number;      // 1280px - Wide desktop
}

export interface NetworkInfo {
  isOnline: boolean;
  connectionType: ConnectionType;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// Nigerian mobile-first breakpoints (optimized for common devices)
const BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 375,   // iPhone SE, Samsung Galaxy A series
  tablet: 768,   // iPad, Android tablets
  desktop: 1024, // Laptops, desktop
  wide: 1280     // Large desktop screens
};

// 3G thresholds for Nigerian networks
const CONNECTION_THRESHOLDS = {
  slow2g: { downlink: 0.15, rtt: 2000 },
  '2g': { downlink: 0.25, rtt: 1400 },
  '3g': { downlink: 0.7, rtt: 400 },
  '4g': { downlink: 1.5, rtt: 100 }
};

// ======================================
// CORE RESPONSIVE HOOK
// ======================================

/**
 * Core responsive hook with mobile-first approach
 * Optimized for Nigerian devices and network conditions
 */
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.mobile,
    height: typeof window !== 'undefined' ? window.innerHeight : 667
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>('mobile');

  const updateSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setWindowSize({ width, height });
    
    // Determine current breakpoint (mobile-first)
    if (width >= BREAKPOINTS.wide) {
      setCurrentBreakpoint('wide');
    } else if (width >= BREAKPOINTS.desktop) {
      setCurrentBreakpoint('desktop');
    } else if (width >= BREAKPOINTS.tablet) {
      setCurrentBreakpoint('tablet');
    } else {
      setCurrentBreakpoint('mobile');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial size check
    updateSize();

    // Debounced resize handler for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 150);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [updateSize]);

  const isMobile = currentBreakpoint === 'mobile';
  const isTablet = currentBreakpoint === 'tablet';
  const isDesktop = currentBreakpoint === 'desktop' || currentBreakpoint === 'wide';
  const isWide = currentBreakpoint === 'wide';

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    breakpoints: BREAKPOINTS,
    // Utility functions
    isAbove: (breakpoint: BreakpointKey) => windowSize.width >= BREAKPOINTS[breakpoint],
    isBelow: (breakpoint: BreakpointKey) => windowSize.width < BREAKPOINTS[breakpoint],
    isBetween: (min: BreakpointKey, max: BreakpointKey) => 
      windowSize.width >= BREAKPOINTS[min] && windowSize.width < BREAKPOINTS[max]
  };
};

// ======================================
// MOBILE DETECTION HOOK
// ======================================

/**
 * Mobile detection hook with 375px breakpoint
 * Specifically for Nigerian mobile users
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR: assume mobile-first
    return window.innerWidth < BREAKPOINTS.mobile;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      const mobile = window.innerWidth < BREAKPOINTS.mobile;
      setIsMobile(mobile);
    };

    // Initial check
    checkMobile();

    // Optimized resize listener for mobile detection
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100); // Faster response for mobile
    };

    window.addEventListener('resize', debouncedCheck, { passive: true });
    
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
};

// ======================================
// NETWORK STATUS HOOK
// ======================================

/**
 * Network status hook with 3G detection
 * Optimized for Nigerian network conditions
 */
export const useIsOnline = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isOnline: true,
        connectionType: '3g',
        effectiveType: '3g',
        downlink: 0.7,
        rtt: 400,
        saveData: false
      };
    }

    const navigator = window.navigator;
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      isOnline: navigator.onLine,
      connectionType: getConnectionType(connection),
      effectiveType: connection?.effectiveType || '3g',
      downlink: connection?.downlink || 0.7,
      rtt: connection?.rtt || 400,
      saveData: connection?.saveData || false
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateNetworkInfo = () => {
      const navigator = window.navigator;
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkInfo({
        isOnline: navigator.onLine,
        connectionType: getConnectionType(connection),
        effectiveType: connection?.effectiveType || '3g',
        downlink: connection?.downlink || 0.7,
        rtt: connection?.rtt || 400,
        saveData: connection?.saveData || false
      });
    };

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    // Listen for connection changes
    const connection = (window.navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return {
    ...networkInfo,
    // Convenience methods
    isSlowConnection: networkInfo.connectionType === 'slow-2g' || networkInfo.connectionType === '2g',
    is3G: networkInfo.connectionType === '3g',
    is4GOrBetter: networkInfo.connectionType === '4g',
    shouldOptimize: networkInfo.saveData || 
                   networkInfo.connectionType === 'slow-2g' || 
                   networkInfo.connectionType === '2g'
  };
};

// ======================================
// REDUCED DATA HOOK
// ======================================

/**
 * Reduced data mode hook for 3G optimization
 * Disables heavy animations and features for Nigerian users on slow connections
 */
export const useReducedData = () => {
  const networkInfo = useIsOnline();
  const [reducedDataMode, setReducedDataMode] = useState(false);
  const [userPreference, setUserPreference] = useState<boolean | null>(null);

  // Check for user's reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    // Check localStorage for user preference
    const saved = localStorage.getItem('akada-reduced-data');
    if (saved !== null) {
      const preference = JSON.parse(saved);
      setUserPreference(preference);
    }
  }, []);

  useEffect(() => {
    // Auto-enable reduced data mode based on network conditions
    const shouldReduce = 
      userPreference === true || // User explicitly enabled
      (userPreference !== false && ( // User hasn't disabled AND
        networkInfo.saveData || // Browser data saver is on
        networkInfo.isSlowConnection || // Slow connection
        prefersReducedMotion() || // Prefers reduced motion
        !networkInfo.isOnline // Offline
      ));

    setReducedDataMode(shouldReduce);
  }, [networkInfo, userPreference, prefersReducedMotion]);

  const toggleReducedData = useCallback((enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !userPreference;
    setUserPreference(newState);
    try {
      localStorage.setItem('akada-reduced-data', JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save reduced data preference:', error);
    }
  }, [userPreference]);

  return {
    isReducedData: reducedDataMode,
    isUserEnabled: userPreference === true,
    isAutoEnabled: userPreference !== true && reducedDataMode,
    toggleReducedData,
    
    // Feature flags for optimization
    shouldDisableAnimations: reducedDataMode,
    shouldLazyLoad: reducedDataMode || networkInfo.isSlowConnection,
    shouldCompressImages: reducedDataMode || networkInfo.is3G || networkInfo.isSlowConnection,
    shouldLimitResults: reducedDataMode || networkInfo.isSlowConnection,
    maxResults: reducedDataMode ? 5 : networkInfo.isSlowConnection ? 10 : 20,
    
    // Animation preferences
    animationDuration: reducedDataMode ? 0 : networkInfo.isSlowConnection ? 150 : 300,
    shouldShowSkeletons: !reducedDataMode,
    shouldPreloadData: !reducedDataMode && networkInfo.is4GOrBetter,
    
    // Performance hints
    performanceLevel: reducedDataMode ? 'minimal' : 
                     networkInfo.isSlowConnection ? 'basic' : 
                     networkInfo.is3G ? 'standard' : 'enhanced'
  };
};

// ======================================
// UTILITY FUNCTIONS
// ======================================

/**
 * Determine connection type based on network information
 */
function getConnectionType(connection: any): ConnectionType {
  if (!connection) return '3g'; // Default to 3G for Nigerian networks

  const { effectiveType, downlink, rtt } = connection;

  // Use effective type if available
  if (effectiveType) {
    switch (effectiveType) {
      case 'slow-2g': return 'slow-2g';
      case '2g': return '2g';
      case '3g': return '3g';
      case '4g': return '4g';
      default: return '3g';
    }
  }

  // Fallback to speed-based detection
  if (downlink !== undefined && rtt !== undefined) {
    if (downlink <= CONNECTION_THRESHOLDS.slow2g.downlink || rtt >= CONNECTION_THRESHOLDS.slow2g.rtt) {
      return 'slow-2g';
    } else if (downlink <= CONNECTION_THRESHOLDS['2g'].downlink || rtt >= CONNECTION_THRESHOLDS['2g'].rtt) {
      return '2g';
    } else if (downlink <= CONNECTION_THRESHOLDS['3g'].downlink || rtt >= CONNECTION_THRESHOLDS['3g'].rtt) {
      return '3g';
    } else {
      return '4g';
    }
  }

  return '3g'; // Safe default for Nigerian networks
}

// ======================================
// COMBINED RESPONSIVE CONTEXT HOOK
// ======================================

/**
 * Combined hook that provides all responsive utilities
 * One-stop solution for responsive design in Nigerian context
 */
export const useResponsiveContext = () => {
  const responsive = useResponsive();
  const isMobile = useIsMobile();
  const network = useIsOnline();
  const reducedData = useReducedData();

  return {
    // Device information
    device: {
      ...responsive,
      isMobile,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    },
    
    // Network information
    network,
    
    // Performance optimization
    performance: reducedData,
    
    // Utility functions
    utils: {
      // Get optimal image size based on device and network
      getOptimalImageSize: (baseSize: number) => {
        let multiplier = 1;
        
        if (responsive.isDesktop) multiplier = 1.5;
        if (responsive.isWide) multiplier = 2;
        if (reducedData.isReducedData) multiplier = 0.75;
        if (network.isSlowConnection) multiplier = 0.5;
        
        return Math.round(baseSize * multiplier);
      },
      
      // Get optimal pagination size
      getOptimalPageSize: () => {
        if (reducedData.isReducedData) return 5;
        if (network.isSlowConnection) return 8;
        if (responsive.isMobile) return 10;
        if (responsive.isTablet) return 15;
        return 20;
      },
      
      // Check if feature should be enabled
      shouldEnableFeature: (feature: 'animations' | 'autoplay' | 'preload' | 'heavy-ui') => {
        switch (feature) {
          case 'animations':
            return !reducedData.shouldDisableAnimations;
          case 'autoplay':
            return !reducedData.isReducedData && network.is4GOrBetter;
          case 'preload':
            return reducedData.shouldPreloadData;
          case 'heavy-ui':
            return !reducedData.isReducedData && !network.isSlowConnection;
          default:
            return true;
        }
      }
    }
  };
};