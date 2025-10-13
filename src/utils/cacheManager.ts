// Cache Management Utility for Development and Production
// Provides manual cache control for better development experience

interface CacheStats {
  name: string;
  size: string;
  entries: number;
  lastModified: string;
}

/**
 * Development cache manager for manual cache control
 */
export class CacheManager {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Clear all caches (Service Worker + Browser)
   */
  async clearAllCaches(): Promise<void> {
    try {
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`Clearing cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      }

      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB (if any)
      if ('indexedDB' in window) {
        // This would require more complex IndexedDB cleanup
        console.log('IndexedDB cleanup would need specific implementation');
      }

      console.log('✅ All caches cleared successfully');
      
      if (this.isDevelopment) {
        console.log('🔄 Reload the page to see fresh content');
      }

    } catch (error) {
      console.error('❌ Failed to clear caches:', error);
    }
  }

  /**
   * Clear specific cache by name
   */
  async clearSpecificCache(cacheName: string): Promise<boolean> {
    try {
      if ('caches' in window) {
        const success = await caches.delete(cacheName);
        if (success) {
          console.log(`✅ Cache "${cacheName}" cleared successfully`);
        } else {
          console.log(`⚠️ Cache "${cacheName}" not found or already cleared`);
        }
        return success;
      }
      return false;
    } catch (error) {
      console.error(`❌ Failed to clear cache "${cacheName}":`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats[]> {
    const stats: CacheStats[] = [];

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          let totalSize = 0;
          let lastModified = new Date(0);

          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const clone = response.clone();
              const blob = await clone.blob();
              totalSize += blob.size;

              // Check cache timestamp
              const cacheTime = response.headers.get('sw-cache-time');
              if (cacheTime) {
                const time = new Date(parseInt(cacheTime));
                if (time > lastModified) {
                  lastModified = time;
                }
              }
            }
          }

          stats.push({
            name: cacheName,
            size: this.formatBytes(totalSize),
            entries: keys.length,
            lastModified: lastModified.toLocaleString()
          });
        }
      }

      // Add localStorage stats
      let localStorageSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += localStorage[key].length;
        }
      }

      if (localStorageSize > 0) {
        stats.push({
          name: 'localStorage',
          size: this.formatBytes(localStorageSize * 2), // Rough estimate
          entries: Object.keys(localStorage).length,
          lastModified: 'Unknown'
        });
      }

    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }

    return stats;
  }

  /**
   * Force refresh without cache
   */
  hardRefresh(): void {
    // First clear caches, then reload
    this.clearAllCaches().then(() => {
      // Force reload without cache
      window.location.reload();
    });
  }

  /**
   * Disable caching for current session (development only)
   */
  disableCaching(): void {
    if (!this.isDevelopment) {
      console.warn('Cache disabling is only available in development mode');
      return;
    }

    // Set a flag to disable caching
    sessionStorage.setItem('disable-caching', 'true');
    
    // Override fetch to add no-cache headers
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const newInit = {
        ...init,
        headers: {
          ...init?.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      return originalFetch(input, newInit);
    };

    console.log('🚫 Caching disabled for this session');
  }

  /**
   * Enable caching (development only)
   */
  enableCaching(): void {
    if (!this.isDevelopment) {
      return;
    }

    sessionStorage.removeItem('disable-caching');
    
    // Restore original fetch (requires page reload to fully take effect)
    console.log('✅ Caching re-enabled (page reload recommended)');
  }

  /**
   * Check if caching is disabled
   */
  isCachingDisabled(): boolean {
    return sessionStorage.getItem('disable-caching') === 'true';
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Install cache manager in global scope for console access
   */
  installGlobalCommands(): void {
    if (this.isDevelopment) {
      // Make cache manager available in console
      (window as any).cacheManager = this;
      
      // Add convenient global functions
      (window as any).clearCache = () => this.clearAllCaches();
      (window as any).cacheStats = () => this.getCacheStats().then(console.table);
      (window as any).hardRefresh = () => this.hardRefresh();
      (window as any).disableCaching = () => this.disableCaching();
      (window as any).enableCaching = () => this.enableCaching();

      console.log(`
🛠️ Cache Manager Installed (Development Mode)

Available console commands:
- clearCache()     - Clear all caches
- cacheStats()     - Show cache statistics  
- hardRefresh()    - Clear cache and reload
- disableCaching() - Disable caching for session
- enableCaching()  - Re-enable caching

Example: Type 'clearCache()' in console to clear all caches
      `);
    }
  }
}

// Create global instance
export const cacheManager = new CacheManager();

// Auto-install in development
if (import.meta.env.DEV) {
  // Install after a short delay to ensure DOM is ready
  setTimeout(() => {
    cacheManager.installGlobalCommands();
  }, 1000);
}

export default cacheManager;