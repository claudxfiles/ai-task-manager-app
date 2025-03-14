'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import Cookies from 'js-cookie';

export function DemoModeBanner() {
  const { isDemoSession } = useDemoAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar el banner si estamos en modo demo
    setIsVisible(isDemoSession);
  }, [isDemoSession]);

  if (!isVisible) return null;

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto max-w-md z-50 bg-amber-50 border-amber-500 text-amber-900">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-700">Modo Demo</AlertTitle>
      <AlertDescription className="text-amber-600">
        Estás usando una sesión de demostración con datos simulados. Los cambios no se guardarán permanentemente.
      </AlertDescription>
    </Alert>
  );
} 