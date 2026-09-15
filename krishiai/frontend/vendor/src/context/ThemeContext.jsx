import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('krishi-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('theme-transitioning');
    root.classList.remove('dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    localStorage.setItem('krishi-theme', theme);
    
    const transitionTimeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 500);

    return () => clearTimeout(transitionTimeout);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return { theme: 'dark', toggleTheme: () => {} };
  }
  return context;
};
