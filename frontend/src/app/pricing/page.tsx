'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  // Manejar parámetros de PayPal
  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const payerId = searchParams.get('PayerID');
    
    if (paymentId && payerId) {
      executePayment(paymentId, payerId);
    }
  }, [searchParams]);

  const executePayment = async (paymentId: string, payerId: string) => {
    setIsLoading('executing');
    
    try {
      const response = await fetch('/api/subscriptions/execute-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_id: paymentId, payer_id: payerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      toast({
        title: '¡Pago completado!',
        description: 'Tu suscripción ha sido activada correctamente.',
        variant: 'default',
      });
      
      router.push('/dashboard?subscription=success');
    } catch (error) {
      console.error('Error al ejecutar el pago:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al procesar el pago',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSubscription = async (planId: string) => {
    if (!user) {
      toast({
        title: 'Inicia sesión primero',
        description: 'Debes iniciar sesión para suscribirte a un plan',
        variant: 'destructive',
      });
      router.push('/auth/login?callbackUrl=/pricing');
      return;
    }

    setIsLoading(planId);

    try {
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la suscripción');
      }

      if (data.approval_url) {
        // Para plan premium, redirigir a PayPal
        window.location.href = data.approval_url;
      } else if (data.redirect_url) {
        // Para plan gratuito, redirigir directamente
        router.push(data.redirect_url);
      }
    } catch (error) {
      console.error('Error al suscribirse:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al procesar la suscripción',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Planes de Suscripción</h1>
        <p className="text-muted-foreground mt-2">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plan Gratuito */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Plan Gratuito</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">/mes</span>
            </div>
            <CardDescription className="mt-2">
              Perfecto para comenzar con la gestión de tareas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>100 tokens mensuales</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Gestión básica de tareas</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Asistente IA básico</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleSubscription('plan_free')}
              disabled={isLoading === 'plan_free' || isLoading === 'executing'}
            >
              {isLoading === 'plan_free' ? 'Procesando...' : 'Comenzar Gratis'}
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Premium */}
        <Card className="flex flex-col border-primary">
          <CardHeader className="bg-primary/5">
            <div className="text-center mb-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Recomendado
              </span>
            </div>
            <CardTitle className="text-2xl">Plan Premium</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground ml-2">/mes</span>
            </div>
            <CardDescription className="mt-2">
              Para usuarios que necesitan más potencia y funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>500 tokens mensuales</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Gestión avanzada de tareas</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Asistente IA avanzado</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Tablero Kanban</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Prioridad en soporte</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="default"
              onClick={() => handleSubscription('plan_premium')}
              disabled={isLoading === 'plan_premium' || isLoading === 'executing'}
            >
              {isLoading === 'plan_premium' ? 'Procesando...' : 'Suscribirse con PayPal'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 