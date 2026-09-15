import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const UserRoleContext = createContext();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkAvailable = Boolean(PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key' && PUBLISHABLE_KEY.trim().length > 0);

// Inner provider when Clerk is enabled and wrapped by ClerkProvider
const ClerkUserRoleInner = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [role, setRoleState] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        const userSpecificKey = `krishi_user_role_${user.id}`;
        const clerkRole = user.unsafeMetadata?.role || localStorage.getItem(userSpecificKey) || localStorage.getItem('krishi_user_role');
        if (clerkRole) {
          setRoleState(clerkRole);
          localStorage.setItem(userSpecificKey, clerkRole);
        } else {
          setRoleState(null);
        }
      } else {
        setRoleState(localStorage.getItem('krishi_user_role') || null);
      }
    }
  }, [isLoaded, user]);

  const setRole = async (newRole) => {
    setRoleState(newRole);
    localStorage.setItem('krishi_user_role', newRole);

    if (user) {
      const userSpecificKey = `krishi_user_role_${user.id}`;
      localStorage.setItem(userSpecificKey, newRole);
      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            role: newRole,
          },
        });
      } catch (err) {
        console.error('Failed to save role to Clerk user metadata:', err);
      }
    }
  };

  const clearRole = () => {
    setRoleState(null);
    localStorage.removeItem('krishi_user_role');
  };

  return (
    <UserRoleContext.Provider
      value={{
        role,
        setRole,
        clearRole,
        isVendor: role === 'vendor',
        isUser: role === 'user',
        hasSelectedRole: Boolean(role),
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

// Fallback provider for dev mode / when Clerk is not configured
const LocalUserRoleInner = ({ children }) => {
  const [role, setRoleState] = useState(() => localStorage.getItem('krishi_user_role') || null);

  const setRole = async (newRole) => {
    setRoleState(newRole);
    localStorage.setItem('krishi_user_role', newRole);
  };

  const clearRole = () => {
    setRoleState(null);
    localStorage.removeItem('krishi_user_role');
  };

  return (
    <UserRoleContext.Provider
      value={{
        role,
        setRole,
        clearRole,
        isVendor: role === 'vendor',
        isUser: role === 'user',
        hasSelectedRole: Boolean(role),
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const UserRoleProvider = ({ children }) => {
  if (isClerkAvailable) {
    return <ClerkUserRoleInner>{children}</ClerkUserRoleInner>;
  }
  return <LocalUserRoleInner>{children}</LocalUserRoleInner>;
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
