'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export function ConnectGoogleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando conexión con Google Calendar...');
      
      // Añadimos timestamp para forzar una nueva solicitud y evitar cachés
      const callbackUrl = `${window.location.origin}/auth/callback?source=calendar&t=${new Date().getTime()}`;
      
      toast({
        title: 'Conectando...',
        description: 'Iniciando proceso de autenticación con Google',
      });
      
      const { data, error } = await signInWithGoogle(callbackUrl);
      
      if (error) {
        console.error('Error al conectar con Google:', error);
        toast({
          title: 'Error de conexión',
          description: error.message || 'No se pudo conectar con Google Calendar',
          variant: 'destructive',
        });
      } else {
        console.log('Proceso de autenticación iniciado correctamente', data);
        toast({
          title: 'Conectando...',
          description: 'Redirigiendo a Google para autorizar el acceso al calendario',
        });
      }
    } catch (error: any) {
      console.error('Error en el proceso de conexión con Google:', error);
      toast({
        title: 'Error de conexión',
        description: error.message || 'No se pudo conectar con Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <span className="animate-spin">⚪</span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      )}
      Conectar con Google Calendar
    </Button>
  );
} 