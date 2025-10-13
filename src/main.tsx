console.log('main.tsx loaded');
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { checkEnvironmentVariables } from './utils/envCheck';
import { SafeStorage } from './utils/safeStorage';
import { registerServiceWorker } from './utils/serviceWorker';
import { cacheManager } from './utils/cacheManager';
import './lib/currency/clearCache'; // Import currency utilities for console access

console.log('Starting Akada application...');

// Render app immediately for faster initial load
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Defer non-critical initialization to after render
setTimeout(() => {
  // Check environment variables after initial render
  const envCheck = checkEnvironmentVariables();
  if (!envCheck.allValid) {
    console.error('Environment configuration issues detected. Some features may not work properly.');
  }

  // Clean up any corrupted localStorage entries
  SafeStorage.cleanup();

  // Register service worker for offline functionality
  registerServiceWorker({
    onUpdate: (registration) => {
      console.log('SW: New content available, please refresh');
    },
    onSuccess: (registration) => {
      console.log('SW: Content cached for offline use');
    },
    onOffline: () => {
      console.log('SW: App is running in offline mode');
    },
    onOnline: () => {
      console.log('SW: App is back online');
    }
  });
}, 0);