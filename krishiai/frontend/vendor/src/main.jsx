import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@krishiai/auth';
import { Preloader } from '@krishiai/ui';
import App from './App.jsx';

import './index.css';

function Root() {
  const [loading, setLoading] = useState(true);
  const [appMounted, setAppMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAppMounted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#050e07]">
      {appMounted && (
        <div
          className={`transition-opacity duration-700 ease-in-out ${
            loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <AuthProvider defaultDomain="vendor">
            <App />
          </AuthProvider>
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
