// ======================================
// SERVICE WORKER - OFFLINE CACHING
// 3G-Optimized for Nigerian Networks
// ======================================

const CACHE_NAME = 'akada-v1';
const STATIC_CACHE_NAME = 'akada-static-v1';
const API_CACHE_NAME = 'akada-api-v1';
const IMAGE_CACHE_NAME = 'akada-images-v1';

// Cache duration in milliseconds
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60 * 1000,    // 7 days
  API: 30 * 60 * 1000,                // 30 minutes
  IMAGES: 24 * 60 * 60 * 1000,        // 24 hours
  PROGRAMS: 6 * 60 * 60 * 1000        // 6 hours for program data
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/images/university-placeholder.png',
  '/images/program-placeholder.jpg',
  '/images/flags/default.svg'
];

// API endpoints to cache
const API_PATTERNS = [
  /\/api\/programs/,
  /\/api\/universities/,
  /\/api\/countries/,
  /\/api\/specializations/
];

// Image patterns to cache
const IMAGE_PATTERNS = [
  /\/images\//,
  /flagcdn\.com/,
  /\.(?:png|jpg|jpeg|svg|webp|gif)$/i
];

// Network-first strategy for critical data
const NETWORK_FIRST_PATTERNS = [
  /\/api\/auth/,
  /\/api\/profile/,
  /\/api\/applications/
];

// ======================================
// SERVICE WORKER INSTALLATION
// ======================================

self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Installation failed:', error);
      })
  );
});

// ======================================
// SERVICE WORKER ACTIVATION
// ======================================

self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Activation complete');
    })
  );
});

// ======================================
// FETCH EVENT HANDLER
// ======================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP(S) requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Skip POST requests for caching (but handle for offline)
  if (request.method !== 'GET') {
    if (request.method === 'POST') {
      event.respondWith(handleOfflinePost(request));
    }
    return;
  }
  
  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

// ======================================
// CACHING STRATEGIES
// ======================================

/**
 * Cache First Strategy
 * Best for static assets and images
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cacheTime = getCacheTime(cachedResponse);
      const now = Date.now();
      const maxAge = cacheName === STATIC_CACHE_NAME ? CACHE_DURATION.STATIC : 
                     cacheName === IMAGE_CACHE_NAME ? CACHE_DURATION.IMAGES : 
                     CACHE_DURATION.API;
      
      if (now - cacheTime < maxAge) {
        console.log('SW: Serving from cache:', request.url);
        
        // Update cache in background for next time
        fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        }).catch(() => {}); // Ignore network errors
        
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('SW: Caching network response:', request.url);
      const responseToCache = networkResponse.clone();
      
      // Add timestamp header for cache validation
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const cacheResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cacheResponse);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('SW: Network failed, trying cache:', request.url);
    
    // Fallback to cache if network fails
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

/**
 * Network First Strategy
 * Best for dynamic content and user data
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.url.includes('/api/')) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('SW: Network failed, trying cache for:', request.url);
    
    // Fallback to cache
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Handle API requests with intelligent caching
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Network-first for critical endpoints
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return networkFirstStrategy(request);
  }
  
  // Cache-first for program data and search results
  if (url.pathname.includes('/programs') || url.pathname.includes('/search')) {
    return cacheFirstStrategy(request, API_CACHE_NAME);
  }
  
  // Default to network-first
  return networkFirstStrategy(request);
}

/**
 * Handle offline POST requests
 */
async function handleOfflinePost(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Store for background sync when online
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Store request for later sync
      const requestData = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        timestamp: Date.now()
      };
      
      // Store in IndexedDB or localStorage
      const offlineQueue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
      offlineQueue.push(requestData);
      localStorage.setItem('offline-queue', JSON.stringify(offlineQueue));
      
      return new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ======================================
// UTILITY FUNCTIONS
// ======================================

function isStaticAsset(url) {
  return url.pathname.includes('/static/') || 
         url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.css') ||
         url.pathname === '/' ||
         url.pathname.endsWith('.html');
}

function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         url.pathname.startsWith('/api/');
}

function isImageRequest(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url.href));
}

function getCacheTime(response) {
  const cacheTime = response.headers.get('sw-cache-time');
  return cacheTime ? parseInt(cacheTime) : 0;
}

// ======================================
// BACKGROUND SYNC
// ======================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  const offlineQueue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
  
  if (offlineQueue.length === 0) return;
  
  console.log('SW: Processing offline queue:', offlineQueue.length, 'items');
  
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
  
  // Remove processed items from queue
  const remainingQueue = offlineQueue.filter(item => !processedItems.includes(item));
  localStorage.setItem('offline-queue', JSON.stringify(remainingQueue));
}

// ======================================
// MESSAGE HANDLING
// ======================================

self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'PRELOAD_ROUTES':
      preloadRoutes(data.routes);
      break;
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const clone = response.clone();
        const size = await clone.blob().then(blob => blob.size);
        totalSize += size;
      }
    }
  }
  
  return totalSize;
}

async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

async function preloadRoutes(routes) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
        console.log('SW: Preloaded route:', route);
      }
    } catch (error) {
      console.error('SW: Failed to preload route:', route, error);
    }
  }
}

// ======================================
// ERROR HANDLING
// ======================================

self.addEventListener('error', (event) => {
  console.error('SW: Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Unhandled promise rejection:', event.reason);
});

console.log('SW: Service worker loaded successfully');