import { useAuth } from '@clerk/clerk-react';

export const useSafeAuth = () => {
  try {
    return useAuth();
  } catch {
    return {
      getToken: async () => null,
      userId: null,
      isSignedIn: false,
      isLoaded: true,
      signOut: async () => {}
    };
  }
};
