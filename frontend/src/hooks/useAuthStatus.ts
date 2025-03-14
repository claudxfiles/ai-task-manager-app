"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';

export function useAuthStatus() {
  const { data: session, status } = useSession();
  const [isDemoSession, setIsDemoSession] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Verificar si hay una sesión demo en las cookies
    const demoSession = Cookies.get('demo_session');
    setIsDemoSession(demoSession === 'true');
    
    // Si ya tenemos la información de la sesión de NextAuth y la sesión demo, no estamos cargando
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);
  
  // El usuario está autenticado si tiene una sesión de NextAuth o una sesión demo
  const isAuthenticated = status === 'authenticated' || isDemoSession;
  
  // Obtener los datos del usuario
  const user = session?.user || (isDemoSession ? JSON.parse(localStorage.getItem('demoUser') || '{}') : null);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isDemoSession
  };
} 