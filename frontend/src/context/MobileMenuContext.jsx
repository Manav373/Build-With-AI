import React, { createContext, useContext, useState } from 'react';

const MobileMenuContext = createContext(null);

export function MobileMenuProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <MobileMenuContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) throw new Error('useMobileMenu must be used inside MobileMenuProvider');
  return ctx;
}
