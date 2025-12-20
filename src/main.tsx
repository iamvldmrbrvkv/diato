import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

createRoot(document.getElementById('root')!).render(
  <>
    {/* Prevent dark/light mode flicker on iOS PWA */}
    <InitColorSchemeScript attribute="data" defaultMode="system" />
    <StrictMode>
      <App />
    </StrictMode>
  </>,
);
