'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function SimplePricingPage() {
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
      console.log('Parámetros de PayPal detectados:', { paymentId, payerId });
      executePayment(paymentId, payerId);
    }

    // Verificar si hay un mensaje de suscripción en la URL
    const subscription = searchParams.get('subscription');
    if (subscription === 'success') {
      toast({
        title: '¡Suscripción exitosa!',
        description: 'Tu suscripción ha sido activada correctamente.',
        variant: 'default',
      });
    } else if (subscription === 'canceled') {
      toast({
        title: 'Suscripción cancelada',
        description: 'Has cancelado el proceso de suscripción.',
        variant: 'destructive',
      });
    } else if (subscription === 'free') {
      toast({
        title: 'Plan gratuito activado',
        description: 'Has activado el plan gratuito correctamente.',
        variant: 'default',
      });
    }
  }, [searchParams, toast]);

  const executePayment = async (paymentId: string, payerId: string) => {
    setIsLoading('executing');
    
    try {
      console.log('Ejecutando pago con PayPal:', { paymentId, payerId });
      
      const response = await fetch('/api/subscriptions/execute-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_id: paymentId, payer_id: payerId }),
      });

      const data = await response.json();
      console.log('Respuesta de execute-payment:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      toast({
        title: '¡Pago completado!',
        description: 'Tu suscripción ha sido activada correctamente.',
        variant: 'default',
      });
      
      // Redirigir al dashboard con un pequeño retraso para que el usuario vea el toast
      setTimeout(() => {
        router.push('/dashboard?subscription=success');
      }, 1500);
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
      router.push('/auth/login?callbackUrl=/pricing-simple');
      return;
    }

    setIsLoading(planId);

    try {
      console.log('Iniciando suscripción para plan:', planId);
      
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = await response.json();
      console.log('Respuesta de create-checkout-session:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la suscripción');
      }

      if (data.approval_url) {
        // Para plan premium, redirigir a PayPal
        console.log('Redirigiendo a PayPal:', data.approval_url);
        window.location.href = data.approval_url;
      } else if (data.redirect_url) {
        // Para plan gratuito, redirigir directamente
        console.log('Redirigiendo a:', data.redirect_url);
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
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Planes de Suscripción (Versión Simple)
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
          Versión simplificada para pruebas de integración con PayPal
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plan Gratuito */}
        <Card className="flex flex-col h-full shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Plan Gratuito</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">/mes</span>
            </div>
            <CardDescription className="mt-2">
              Perfecto para comenzar tu viaje de desarrollo personal
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              <li>Chat con IA básico</li>
              <li>Planificación de 1 meta</li>
              <li>Seguimiento semanal</li>
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
        <Card className="flex flex-col h-full shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Plan Premium</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground ml-2">/mes</span>
            </div>
            <CardDescription className="mt-2">
              Para quienes buscan un crecimiento acelerado
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              <li>Chat con IA ilimitado</li>
              <li>Planificación de metas ilimitadas</li>
              <li>Seguimiento diario</li>
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

      <div className="mt-12 text-center">
        <Button 
          variant="outline" 
          onClick={() => router.push('/test-connection')}
        >
          Probar Conexión con Backend
        </Button>
      </div>

      {/* Mostrar parámetros de URL para depuración */}
      <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-md max-w-4xl mx-auto">
        <h3 className="font-semibold mb-2">Parámetros de URL (para depuración):</h3>
        <pre className="text-sm overflow-auto">
          {Object.keys(Object.fromEntries(searchParams.entries())).length > 0 
            ? JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)
            : 'No hay parámetros en la URL'}
        </pre>
      </div>
    </div>
  );
} 