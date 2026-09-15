import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('landing_language') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('landing_language', language);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en', setLanguage: () => {} };
  }
  return context;
}

export default LanguageContext;
