'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
};

const AuthStateContext = createContext<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
});

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsInitialized(true);
    }
  }, [isLoaded]);

  const authState = {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    isInitialized,
  };

  return <AuthStateContext.Provider value={authState}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthStateContext);
}
