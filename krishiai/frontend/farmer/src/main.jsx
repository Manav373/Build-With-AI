import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';

// Context Providers
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { MobileMenuProvider } from './context/MobileMenuContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserRoleProvider } from './context/UserRoleContext';
import { ChatProvider } from './context/ChatContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import { AuthProvider } from '@krishiai/auth';

import App from './App.jsx';
import { Preloader } from '@krishiai/ui';

import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const AppWrapper = () => (
  <AuthProvider defaultDomain="farmer">
    <UserRoleProvider>
      <MobileMenuProvider>
        <LanguageProvider>
          <LocationProvider>
            <ChatProvider>
              <VoiceAssistantProvider>
                <ThemeProvider>
                  <App />
                </ThemeProvider>
              </VoiceAssistantProvider>
            </ChatProvider>
          </LocationProvider>
        </LanguageProvider>
      </MobileMenuProvider>
    </UserRoleProvider>
  </AuthProvider>
);

function Root() {
  const [loading, setLoading] = useState(true);
  const [appMounted, setAppMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAppMounted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full">
      {appMounted && (
        <div
          className={`transition-opacity duration-700 ease-in-out ${
            loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key' ? (
            <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
              <AppWrapper />
            </ClerkProvider>
          ) : (
            <AppWrapper />
          )}
        </div>
      )}

      {loading && (
        <Preloader
          tagline="AI Agronomist & Smart Agricultural Advisor"
          icon="🌾"
          onDone={() => setLoading(false)}
        />
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}
