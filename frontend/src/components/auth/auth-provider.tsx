"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SessionProvider } from 'next-auth/react';

// Crear el contexto de autenticación
const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor de autenticación
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();
  
  return (
    <SessionProvider>
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  
  return context;
} 