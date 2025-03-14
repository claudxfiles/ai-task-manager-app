'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemoAuth } from '@/hooks/useDemoAuth';

interface ApiErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function ApiErrorFallback({ error, resetErrorBoundary }: ApiErrorFallbackProps) {
  const { loginDemo } = useDemoAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await loginDemo();
      if (resetErrorBoundary) {
        resetErrorBoundary();
      }
    } catch (error) {
      console.error('Error al iniciar sesión de demo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md border-red-200 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-xl">Error de conexión</CardTitle>
          </div>
          <CardDescription>
            No se pudo conectar con el servidor backend. Esto puede deberse a que el servidor no está en ejecución o hay un problema de red.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-3 rounded-md text-sm text-red-800 font-mono overflow-auto max-h-32">
            {error.message}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={handleDemoLogin} 
            className="w-full bg-gradient-to-r from-soul-purple to-soul-blue hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando...' : 'Usar modo demo con datos simulados'}
          </Button>
          {resetErrorBoundary && (
            <Button 
              onClick={resetErrorBoundary} 
              variant="outline" 
              className="w-full"
            >
              Intentar de nuevo
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 