'use client';

import { XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SubscriptionCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Determinar mensaje según el contexto
  const getMessage = () => {
    const cancelReason = searchParams.get('reason');
    
    if (cancelReason === 'user_cancelled') {
      return 'Has cancelado el proceso de suscripción. No se ha realizado ningún cargo.';
    }
    
    return 'El proceso de suscripción ha sido cancelado. Si tuviste algún problema, por favor contacta a soporte.';
  };
  
  return (
    <div className="container max-w-lg py-16">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Suscripción Cancelada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6">
            <div className="bg-red-100 p-4 rounded-full mb-6">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <p className="text-lg mb-2">
              {getMessage()}
            </p>
            <p className="text-muted-foreground">
              Puedes intentarlo de nuevo o elegir otro plan desde nuestra página de precios.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Ir al Dashboard
          </Button>
          <Button
            onClick={() => router.push('/pricing')}
          >
            Ver Planes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 