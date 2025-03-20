'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';

export function ConnectGoogleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { requestGoogleCalendarPermission } = useAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando conexión con Google Calendar...');
      
      toast({
        title: 'Conectando...',
        description: 'Iniciando proceso de autenticación con Google',
      });
      
      const { data, error } = await requestGoogleCalendarPermission();
      
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
      variant="secondary"
    >
      {isLoading ? (
        <span className="animate-spin">⚪</span>
      ) : (
        <Calendar className="h-4 w-4" />
      )}
      Conectar con Google Calendar
    </Button>
  );
} 