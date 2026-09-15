import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from '@krishiai/auth';
import { Preloader } from '@krishiai/ui';
import App from './App.jsx';

import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function Root() {
  const [loading, setLoading] = useState(true);
  const [appMounted, setAppMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAppMounted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const content = (
    <AuthProvider defaultDomain="vendor">
      <App />
    </AuthProvider>
  );

  return (
    <div className="relative w-full h-full min-h-screen bg-[#050e07]">
      {appMounted && (
        <div
          className={`transition-opacity duration-700 ease-in-out ${
            loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key' ? (
            <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/vendor-sign-in">
              {content}
            </ClerkProvider>
          ) : (
            content
          )}
        </div>
      )}

      {loading && (
        <Preloader
          tagline="B2B Procurement & Vendor Intelligence"
          icon="🏪"
          statusLabels={[
            'Connecting B2B Hub…',
            'Syncing catalog & mandi…',
            'Verifying security…',
            'Loading workspace…',
            '✓ Ready!',
          ]}
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
