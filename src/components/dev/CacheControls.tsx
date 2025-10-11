// Development-only cache control component
import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Info, Database, Settings } from 'lucide-react';
import { cacheManager } from '../../utils/cacheManager';

interface CacheStats {
  name: string;
  size: string;
  entries: number;
  lastModified: string;
}

/**
 * Development cache controls - only shows in development mode
 */
export function CacheControls() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<CacheStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cachingDisabled, setCachingDisabled] = useState(false);

  // Only show in development
  const isDev = import.meta.env.DEV;
  
  useEffect(() => {
    if (isDev) {
      setCachingDisabled(cacheManager.isCachingDisabled());
      loadCacheStats();
    }
  }, [isDev]);

  const loadCacheStats = async () => {
    try {
      const cacheStats = await cacheManager.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      await cacheManager.clearAllCaches();
      await loadCacheStats();
      alert('All caches cleared! The page will reload to show fresh content.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear caches:', error);
      alert('Failed to clear caches. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSpecific = async (cacheName: string) => {
    setIsLoading(true);
    try {
      await cacheManager.clearSpecificCache(cacheName);
      await loadCacheStats();
    } catch (error) {
      console.error(`Failed to clear cache ${cacheName}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHardRefresh = () => {
    if (confirm('This will clear all caches and reload the page. Continue?')) {
      cacheManager.hardRefresh();
    }
  };

  const handleToggleCaching = () => {
    if (cachingDisabled) {
      cacheManager.enableCaching();
      setCachingDisabled(false);
      alert('Caching enabled. Reload the page for full effect.');
    } else {
      cacheManager.disableCaching();
      setCachingDisabled(true);
      alert('Caching disabled for this session.');
    }
  };

  if (!isDev) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          mb-2 p-3 rounded-full shadow-lg transition-all duration-200
          ${isVisible 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
        title="Toggle Cache Controls"
      >
        <Database className="w-5 h-5" />
      </button>

      {/* Cache Controls Panel */}
      {isVisible && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Cache Controls
            </h3>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              DEV
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mb-4">
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isLoading ? 'Clearing...' : 'Clear All Caches'}</span>
            </button>

            <button
              onClick={handleHardRefresh}
              className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Hard Refresh</span>
            </button>

            <button
              onClick={handleToggleCaching}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                cachingDisabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{cachingDisabled ? 'Enable Caching' : 'Disable Caching'}</span>
            </button>

            <button
              onClick={loadCacheStats}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Refresh Stats</span>
            </button>
          </div>

          {/* Cache Statistics */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cache Statistics</h4>
            
            {stats.length === 0 ? (
              <p className="text-gray-500 text-sm">No caches found</p>
            ) : (
              <div className="space-y-2">
                {stats.map((cache) => (
                  <div
                    key={cache.name}
                    className="bg-gray-50 dark:bg-gray-700 rounded-md p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {cache.name}
                      </span>
                      <button
                        onClick={() => handleClearSpecific(cache.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title={`Clear ${cache.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <div>Size: {cache.size}</div>
                      <div>Entries: {cache.entries}</div>
                      {cache.lastModified !== 'Unknown' && (
                        <div>Last Modified: {cache.lastModified}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${cachingDisabled ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Caching: {cachingDisabled ? 'Disabled' : 'Enabled'}
              </span>
            </div>
          </div>

          {/* Console Commands Info */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Console commands available: <code>clearCache()</code>, <code>cacheStats()</code>, <code>hardRefresh()</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CacheControls;