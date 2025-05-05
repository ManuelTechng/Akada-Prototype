import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkEnvironmentVariables } from './utils/envCheck';

// Check environment variables on app startup
const envCheck = checkEnvironmentVariables();
if (!envCheck.allValid) {
  console.error('Environment configuration issues detected. Some features may not work properly.');
}

console.log('Starting Akada application...');

createRoot(document.getElementById('root')!).render(
  <App />
);