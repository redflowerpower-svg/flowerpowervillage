import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initEnvironmentFaviconObserver } from './utils/environmentFavicon.ts';

// Dynamic Department & Environment Favicon (🍕 Pizza, 🌴 Village, 👨‍🍳 Kitchen, 🛡️ Gateway + 🔴 Local / 🟢 Virtual ring)
initEnvironmentFaviconObserver();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

