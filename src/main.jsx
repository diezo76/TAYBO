/**
 * Point d'entrée de l'application React
 * 
 * Ce fichier est le premier à être exécuté quand l'application démarre.
 * Il monte le composant App dans le DOM.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config'; // Import de la configuration i18n AVANT App
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
