"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAuth } from '@/hooks/useAuth';

export function SimpleGoogleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login();
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className="w-full"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continuar con Google
      </Button>
      {error && (
        <p className="text-sm text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
} 