'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscriptionService } from '@/services/subscription.service';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SubscriptionSuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    async function processSubscription() {
      try {
        // Obtener el ID de suscripción de los parámetros
        const subscriptionId = searchParams.get('subscription_id');
        
        if (!subscriptionId) {
          setError('No se pudo encontrar la información de la suscripción');
          setIsProcessing(false);
          return;
        }
        
        // Confirmar la suscripción
        await subscriptionService.confirmSubscription(subscriptionId);
        
        // La confirmación fue exitosa
        setIsProcessing(false);
        
      } catch (err: any) {
        console.error('Error al procesar la suscripción:', err);
        setError(err.message || 'Ocurrió un error al procesar tu suscripción');
        setIsProcessing(false);
      }
    }
    
    processSubscription();
  }, [searchParams]);
  
  return (
    <div className="container max-w-lg py-16">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isProcessing ? 'Procesando tu Suscripción' : error ? 'Hubo un Problema' : '¡Suscripción Exitosa!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                Estamos confirmando tu suscripción. Por favor, espera un momento...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <p className="text-lg mb-2">
                ¡Tu suscripción ha sido activada correctamente!
              </p>
              <p className="text-muted-foreground">
                Ahora puedes disfrutar de todas las ventajas de tu plan.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => router.push('/dashboard')}
            disabled={isProcessing}
          >
            {error ? 'Volver al Dashboard' : 'Ir al Dashboard'}
          </Button>
          {error && (
            <Button
              variant="outline"
              onClick={() => router.push('/subscription/manage')}
              className="ml-2"
            >
              Ver mis Suscripciones
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 