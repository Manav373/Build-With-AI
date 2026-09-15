import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('krishi-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('theme-transitioning');
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    try {
      localStorage.setItem('krishi-theme', theme);
    } catch {
      // ignore
    }
    
    const transitionTimeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(transitionTimeout);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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

export default ThemeProvider;
