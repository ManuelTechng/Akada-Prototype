// ======================================
// SERVICE WORKER REGISTRATION & MANAGEMENT
// 3G-Optimized for Nigerian Networks
// ======================================

// ======================================
// TYPES AND INTERFACES
// ======================================

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

interface CacheInfo {
  name: string;
  size: number;
  lastUpdated: Date;
}

interface NetworkInfo {
  isOnline: boolean;
  effectiveType: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

// ======================================
// SERVICE WORKER REGISTRATION
// ======================================

/**
 * Register service worker with enhanced error handling
 * Optimized for 3G networks in Nigeria
 */
export const registerServiceWorker = (config: ServiceWorkerConfig = {}): void => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';
      
      if (isLocalhost()) {
        // In development, check if SW exists
        checkValidServiceWorker(swUrl, config);
        
        // Log additional info for development
        navigator.serviceWorker.ready.then(() => {
          console.log('SW: Service worker is ready for development');
        });
      } else {
        // In production, register SW
        registerValidServiceWorker(swUrl, config);
      }
    });
  } else {
    console.log('SW: Service workers are not supported in this browser');
  }
};

/**
 * Register valid service worker
 */
const registerValidServiceWorker = async (swUrl: string, config: ServiceWorkerConfig): Promise<void> => {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) return;
      
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content available; update ready
            console.log('SW: New content is available; please refresh');
            if (config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // Content cached for first time
            console.log('SW: Content is cached for offline use');
            if (config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };
    
    // Setup network monitoring
    setupNetworkMonitoring(config);
    
    // Setup cache management
    setupCacheManagement();
    
    console.log('SW: Service worker registration successful');
    
  } catch (error) {
    console.error('SW: Service worker registration failed:', error);
  }
};

/**
 * Check if service worker is valid (development mode)
 */
const checkValidServiceWorker = async (swUrl: string, config: ServiceWorkerConfig): Promise<void> => {
  try {
    const response = await fetch(swUrl, { headers: { 'Service-Worker': 'script' } });
    
    const contentType = response.headers.get('content-type');
    if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
      // No service worker found
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister().then(() => {
          window.location.reload();
        });
      });
    } else {
      // Service worker found, proceed normally
      registerValidServiceWorker(swUrl, config);
    }
  } catch (error) {
    console.log('SW: No internet connection found. App is running in offline mode.');
  }
};

// ======================================
// NETWORK MONITORING
// ======================================

/**
 * Setup network monitoring for 3G optimization
 */
const setupNetworkMonitoring = (config: ServiceWorkerConfig): void => {
  // Online/offline events
  window.addEventListener('online', () => {
    console.log('SW: Back online');
    if (config.onOnline) {
      config.onOnline();
    }
    
    // Sync offline queue when back online
    syncOfflineQueue();
  });
  
  window.addEventListener('offline', () => {
    console.log('SW: Gone offline');
    if (config.onOffline) {
      config.onOffline();
    }
  });
  
  // Monitor connection quality for 3G optimization
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    const logConnectionInfo = () => {
      const info: NetworkInfo = {
        isOnline: navigator.onLine,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
      
      console.log('SW: Network info:', info);
      
      // Store for service worker optimization
      localStorage.setItem('network-info', JSON.stringify(info));
      
      // Trigger cache optimization for slow connections
      if (info.effectiveType === '3g' || info.effectiveType === 'slow-2g') {
        optimizeForSlowConnection();
      }
    };
    
    connection.addEventListener('change', logConnectionInfo);
    logConnectionInfo(); // Initial check
  }
};

/**
 * Optimize caching strategy for slow connections
 */
const optimizeForSlowConnection = (): void => {
  console.log('SW: Optimizing for slow connection');
  
  // Reduce image quality for new requests
  localStorage.setItem('reduce-image-quality', 'true');
  
  // Preload critical routes
  preloadCriticalRoutes();
  
  // Clear non-essential caches to save space
  clearNonEssentialCaches();
};

// ======================================
// CACHE MANAGEMENT
// ======================================

/**
 * Setup automatic cache management
 */
const setupCacheManagement = (): void => {
  // Check cache size periodically
  setInterval(checkCacheSize, 5 * 60 * 1000); // Every 5 minutes
  
  // Initial cache size check
  checkCacheSize();
};

/**
 * Check and manage cache size
 */
const checkCacheSize = async (): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const messageChannel = new MessageChannel();
      
      const sizePromise = new Promise<number>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.size);
        };
      });
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
      
      const totalSize = await sizePromise;
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      console.log(`SW: Total cache size: ${sizeMB} MB`);
      
      // Clear cache if it exceeds 50MB (conservative for mobile)
      if (totalSize > 50 * 1024 * 1024) {
        console.log('SW: Cache size limit exceeded, clearing old caches');
        await clearOldCaches();
      }
      
    } catch (error) {
      console.error('SW: Failed to check cache size:', error);
    }
  }
};

/**
 * Clear old caches to maintain performance
 */
const clearOldCaches = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    
    // Keep only the most recent version of each cache type
    const cacheGroups: Record<string, string[]> = {};
    
    cacheNames.forEach(name => {
      const baseType = name.split('-')[0];
      if (!cacheGroups[baseType]) {
        cacheGroups[baseType] = [];
      }
      cacheGroups[baseType].push(name);
    });
    
    // Delete older versions
    const deletionPromises = Object.values(cacheGroups).map(group => {
      if (group.length > 1) {
        // Sort by version and keep only the latest
        group.sort();
        const toDelete = group.slice(0, -1);
        return Promise.all(toDelete.map(cacheName => caches.delete(cacheName)));
      }
      return Promise.resolve();
    });
    
    await Promise.all(deletionPromises);
    console.log('SW: Old caches cleared');
  }
};

/**
 * Clear non-essential caches for slow connections
 */
const clearNonEssentialCaches = async (): Promise<void> => {
  if ('caches' in window) {
    const nonEssentialCaches = ['akada-images-v1'];
    
    for (const cacheName of nonEssentialCaches) {
      try {
        const success = await caches.delete(cacheName);
        if (success) {
          console.log(`SW: Cleared non-essential cache: ${cacheName}`);
        }
      } catch (error) {
        console.error(`SW: Failed to clear cache ${cacheName}:`, error);
      }
    }
  }
};

// ======================================
// OFFLINE QUEUE MANAGEMENT
// ======================================

/**
 * Sync offline queue when connection is restored
 */
const syncOfflineQueue = async (): Promise<void> => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
      console.log('SW: Background sync registered');
    } catch (error) {
      console.error('SW: Background sync registration failed:', error);
      
      // Fallback: manual sync
      manualSyncOfflineQueue();
    }
  } else {
    // Fallback for browsers without background sync
    manualSyncOfflineQueue();
  }
};

/**
 * Manual sync for browsers without background sync support
 */
const manualSyncOfflineQueue = async (): Promise<void> => {
  const offlineQueue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
  
  if (offlineQueue.length === 0) return;
  
  console.log('SW: Manually syncing offline queue:', offlineQueue.length, 'items');
  
  const processedItems = [];
  
  for (const item of offlineQueue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });
      
      if (response.ok) {
        processedItems.push(item);
        console.log('SW: Successfully synced:', item.url);
      }
    } catch (error) {
      console.error('SW: Failed to sync:', item.url, error);
    }
  }
  
  // Remove processed items
  const remainingQueue = offlineQueue.filter(item => !processedItems.includes(item));
  localStorage.setItem('offline-queue', JSON.stringify(remainingQueue));
};

// ======================================
// PRELOADING UTILITIES
// ======================================

/**
 * Preload critical routes for offline access
 */
const preloadCriticalRoutes = (): void => {
  const criticalRoutes = [
    '/',
    '/programs',
    '/search',
    '/dashboard'
  ];
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'PRELOAD_ROUTES',
      data: { routes: criticalRoutes }
    });
  }
};

/**
 * Preload specific content for offline access
 */
export const preloadForOffline = async (urls: string[]): Promise<void> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('akada-preload-v1');
      await cache.addAll(urls);
      console.log('SW: Content preloaded for offline access');
    } catch (error) {
      console.error('SW: Failed to preload content:', error);
    }
  }
};

// ======================================
// SERVICE WORKER UPDATES
// ======================================

/**
 * Skip waiting and reload for service worker updates
 */
export const skipWaitingAndReload = (): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
};

/**
 * Check for service worker updates
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
    } catch (error) {
      console.error('SW: Failed to check for updates:', error);
    }
  }
  return false;
};

// ======================================
// UTILITY FUNCTIONS
// ======================================

/**
 * Check if running on localhost
 */
const isLocalhost = (): boolean => {
  return Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
};

/**
 * Get cache information
 */
export const getCacheInfo = async (): Promise<CacheInfo[]> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const cacheInfos: CacheInfo[] = [];
    
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        let totalSize = 0;
        let lastUpdated = new Date(0);
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const clone = response.clone();
            const size = await clone.blob().then(blob => blob.size);
            totalSize += size;
            
            const cacheTime = response.headers.get('sw-cache-time');
            if (cacheTime) {
              const time = new Date(parseInt(cacheTime));
              if (time > lastUpdated) {
                lastUpdated = time;
              }
            }
          }
        }
        
        cacheInfos.push({
          name: cacheName,
          size: totalSize,
          lastUpdated
        });
      } catch (error) {
        console.error(`SW: Failed to get info for cache ${cacheName}:`, error);
      }
    }
    
    return cacheInfos;
  }
  
  return [];
};

/**
 * Clear specific cache
 */
export const clearCache = async (cacheName?: string): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const messageChannel = new MessageChannel();
    
    const clearPromise = new Promise<void>((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve();
        }
      };
    });
    
    navigator.serviceWorker.controller.postMessage(
      { type: 'CLEAR_CACHE', data: { cacheName } },
      [messageChannel.port2]
    );
    
    await clearPromise;
    console.log('SW: Cache cleared successfully');
  }
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('SW: Service worker unregistered');
      }
    } catch (error) {
      console.error('SW: Failed to unregister service worker:', error);
    }
  }
};

// Export default configuration
export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  skipWaitingAndReload,
  checkForUpdates,
  preloadForOffline,
  getCacheInfo,
  clearCache
};