'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, CreditCard, Zap, Shield, Clock, Users, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [showPayPalLogo, setShowPayPalLogo] = useState(false);

  // Manejar parámetros de PayPal
  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const payerId = searchParams.get('PayerID');
    
    if (paymentId && payerId) {
      executePayment(paymentId, payerId);
    }

    // Mostrar el logo de PayPal después de un breve retraso para efecto visual
    const timer = setTimeout(() => setShowPayPalLogo(true), 500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Verificar si hay un mensaje de suscripción en la URL
  useEffect(() => {
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
      router.push('/auth/login?callbackUrl=/pricing');
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

  // Función para manejar el clic directo en los botones
  const handleButtonClick = (planId: string) => {
    console.log(`Botón clickeado para plan: ${planId}`);
    handleSubscription(planId);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Planes de Suscripción
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Plan Gratuito */}
        <div>
          <Card className="flex flex-col h-full shadow-md">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                <CardTitle className="text-2xl">Gratuito</CardTitle>
              </div>
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
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Chat con IA básico</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Planificación de 1 meta</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Seguimiento semanal</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Recordatorios básicos</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Comunidad de soporte</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleButtonClick('plan_free')}
                disabled={isLoading === 'plan_free' || isLoading === 'executing'}
              >
                {isLoading === 'plan_free' ? 'Procesando...' : 'Comenzar Gratis'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Plan Premium */}
        <div className="md:scale-105 z-10">
          <Card className="flex flex-col h-full border-2 border-primary shadow-lg relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
              Más Popular
            </Badge>
            <CardHeader className="bg-primary/5 pb-6 pt-8">
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 mr-2 text-purple-500" />
                <CardTitle className="text-2xl">Pro</CardTitle>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">$19.99</span>
                <span className="text-muted-foreground ml-2">/mes</span>
              </div>
              <CardDescription className="mt-2">
                Para quienes buscan un crecimiento acelerado
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Chat con IA ilimitado</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Planificación de metas ilimitadas</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Seguimiento diario</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Análisis detallado de progreso</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Ajustes de plan en tiempo real</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Recordatorios personalizados</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Acceso prioritario a nuevas funciones</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pb-6">
              <Button
                className="w-full"
                variant="default"
                size="lg"
                onClick={() => handleButtonClick('plan_premium')}
                disabled={isLoading === 'plan_premium' || isLoading === 'executing'}
              >
                {isLoading === 'plan_premium' ? (
                  'Procesando...'
                ) : (
                  <>
                    Suscribirse con PayPal
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Plan Empresas */}
        <div>
          <Card className="flex flex-col h-full shadow-md">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                <CardTitle className="text-2xl">Empresas</CardTitle>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">Personalizado</span>
              </div>
              <CardDescription className="mt-2">
                Soluciones personalizadas para equipos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Todo lo incluido en Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Panel de administración</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Seguimiento de equipo</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Metas compartidas</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Reportes avanzados</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>API acceso</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Soporte dedicado 24/7</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/contact')}
              >
                Contactar Ventas
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Preguntas Frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-lg mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
            <p className="text-muted-foreground">Sí, puedes actualizar o cambiar tu plan en cualquier momento desde la configuración de tu cuenta.</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-lg mb-2">¿Cómo funciona el pago con PayPal?</h3>
            <p className="text-muted-foreground">Procesamos los pagos de forma segura a través de PayPal. Puedes usar tu cuenta de PayPal o pagar con tarjeta sin necesidad de crear una cuenta.</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-lg mb-2">¿Hay período de prueba?</h3>
            <p className="text-muted-foreground">El plan gratuito te permite probar las funcionalidades básicas sin límite de tiempo. Para funciones premium, puedes actualizar cuando lo necesites.</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-lg mb-2">¿Puedo cancelar mi suscripción?</h3>
            <p className="text-muted-foreground">Sí, puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta, sin cargos adicionales.</p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">¿Necesitas una solución personalizada?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Contáctanos para discutir cómo podemos adaptar nuestra plataforma a las necesidades específicas de tu empresa o equipo.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => router.push('/contact')}
          >
            Hablar con un especialista
          </Button>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Pagos procesados de forma segura a través de PayPal. Todos los precios están en USD.</p>
        <div className="flex justify-center mt-4 space-x-4">
          <Shield className="w-5 h-5" />
          <CreditCard className="w-5 h-5" />
          <Star className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
} 