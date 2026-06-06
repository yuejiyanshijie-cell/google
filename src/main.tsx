import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import './index.css';

// Debug: Log to verify script is loading
console.log('[PURE] Application starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[PURE] Root element not found!');
} else {
  console.log('[PURE] Root element found, creating React root...');
  
  try {
    const root = createRoot(rootElement);
    console.log('[PURE] React root created, rendering app...');
    
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    
    console.log('[PURE] App rendered successfully');
  } catch (error) {
    console.error('[PURE] Error rendering app:', error);
  }
}
