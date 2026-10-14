import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { AccessibilityProvider } from './context/AccessibilityContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CitizenAuthProvider } from './context/CitizenAuthContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <CitizenAuthProvider>
              <App />
            </CitizenAuthProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
