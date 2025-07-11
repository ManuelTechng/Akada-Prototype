console.log('main.tsx loaded');
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { checkEnvironmentVariables } from './utils/envCheck';
import { SafeStorage } from './utils/safeStorage';

// Check environment variables on app startup
const envCheck = checkEnvironmentVariables();
if (!envCheck.allValid) {
  console.error('Environment configuration issues detected. Some features may not work properly.');
}

// Clean up any corrupted localStorage entries
SafeStorage.cleanup();

console.log('Starting Akada application...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);