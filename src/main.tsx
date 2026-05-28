import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// Phase 1: Integration with auth + projects
import App from './AppRoot.tsx';
// TEMP: Cinematic UI demo (Phase 2 will integrate immersive UI)
// import App from './AppCinematic.tsx';
// Original standalone editor
// import App from './App.tsx';
import './index.css';

console.log('[MAIN] Starting app');

const rootElement = document.getElementById('root');
console.log('[MAIN] Root element:', rootElement);

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  console.log('[MAIN] Creating React root');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('[MAIN] React root created successfully');
} catch (error) {
  console.error('[MAIN] Error creating React root:', error);
  document.body.innerHTML = `<div style="color: white; padding: 20px;">Error: ${error}</div>`;
}
