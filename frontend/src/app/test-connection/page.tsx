'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestConnectionPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Prueba de Conexión
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
          Esta página permite probar la conexión entre el frontend y el backend
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test de Conexión Backend</CardTitle>
            <CardDescription>
              Haz clic en el botón para probar la conexión con el backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <Button 
                onClick={testConnection} 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Probando...' : 'Probar Conexión'}
              </Button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {result && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Esta prueba intenta conectarse a: {process.env.NEXT_PUBLIC_API_URL || 'No configurado'}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 