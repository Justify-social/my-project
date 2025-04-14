'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

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
  const { user, isLoading } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  const authState = {
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
  };

  return <AuthStateContext.Provider value={authState}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthStateContext);
}
