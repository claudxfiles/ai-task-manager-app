"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function useDemoAuth() {
  const [isDemoSession, setIsDemoSession] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay una sesión demo en las cookies
    const demoSession = Cookies.get('demo_session');
    setIsDemoSession(demoSession === 'true');
    setIsLoading(false);
  }, []);

  const loginDemo = async () => {
    // Establecer la cookie con una duración de 1 día
    Cookies.set('demo_session', 'true', { expires: 1 });
    setIsDemoSession(true);
    return true;
  };

  const logoutDemo = () => {
    Cookies.remove('demo_session');
    setIsDemoSession(false);
    router.push('/auth/login');
  };

  return {
    isDemoSession,
    isLoading,
    loginDemo,
    logoutDemo
  };
} 