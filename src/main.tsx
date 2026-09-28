import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyEnvironmentFavicon } from './utils/environmentFavicon.ts';

// Apply environment ring to favicon (🔴 Red in Localhost, 🟢 Green in Virtual/Staging, Clean in Production)
applyEnvironmentFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

