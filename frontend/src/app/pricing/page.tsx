'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, Sparkles, CreditCard, Zap, Shield, Clock, Users, Star } from 'lucide-react';
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

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Planes de Suscripción
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
          Elige el plan que mejor se adapte a tus necesidades y comienza a potenciar tu productividad con IA
        </p>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Plan Gratuito */}
        <motion.div variants={itemVariants}>
          <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
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
                onClick={() => handleSubscription('plan_free')}
                disabled={isLoading === 'plan_free' || isLoading === 'executing'}
              >
                {isLoading === 'plan_free' ? 'Procesando...' : 'Comenzar Gratis'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Plan Premium */}
        <motion.div variants={itemVariants} className="md:scale-105 z-10">
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
                className="w-full relative overflow-hidden group"
                variant="default"
                size="lg"
                onClick={() => handleSubscription('plan_premium')}
                disabled={isLoading === 'plan_premium' || isLoading === 'executing'}
              >
                <span className="relative z-10 flex items-center justify-center w-full">
                  {isLoading === 'plan_premium' ? (
                    'Procesando...'
                  ) : (
                    <>
                      Suscribirse con 
                      <motion.span 
                        className="ml-2 flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: showPayPalLogo ? 1 : 0, 
                          x: showPayPalLogo ? 0 : -10 
                        }}
                        transition={{ delay: 0.5 }}
                      >
                        <svg width="80" height="20" viewBox="0 0 100 25" className="ml-1">
                          <path d="M 8.421 0 L 0 24.553 L 6.326 24.553 L 7.834 19.511 L 16.05 19.511 L 17.558 24.553 L 23.884 24.553 L 15.463 0 L 8.421 0 Z M 9.461 6.571 L 13.421 15.384 L 9.04 15.384 L 12.999 6.571 L 9.461 6.571 Z" fill="#003087"/>
                          <path d="M 46.547 0 L 40.467 15.384 L 36.125 0 L 29.336 0 L 36.125 24.553 L 43.167 24.553 L 53.336 0 L 46.547 0 Z" fill="#003087"/>
                          <path d="M 63.505 0 L 55.084 24.553 L 61.41 24.553 L 69.831 0 L 63.505 0 Z" fill="#003087"/>
                          <path d="M 73.758 0 L 67.432 24.553 L 73.758 24.553 L 80.084 0 L 73.758 0 Z" fill="#003087"/>
                          <path d="M 97.768 0 L 83.6 0 L 77.274 24.553 L 91.442 24.553 L 92.95 19.511 L 85.108 19.511 L 86.616 14.469 L 94.458 14.469 L 95.966 9.426 L 88.124 9.426 L 89.211 5.298 L 97.053 5.298 L 98.561 0.256 L 97.768 0 Z" fill="#003087"/>
                          <path d="M 8.421 0 L 0 24.553 L 6.326 24.553 L 7.834 19.511 L 16.05 19.511 L 17.558 24.553 L 23.884 24.553 L 15.463 0 L 8.421 0 Z M 9.461 6.571 L 13.421 15.384 L 9.04 15.384 L 12.999 6.571 L 9.461 6.571 Z" fill="#003087"/>
                        </svg>
                      </motion.span>
                    </>
                  )}
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Plan Empresas */}
        <motion.div variants={itemVariants}>
          <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
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
        </motion.div>
      </motion.div>

      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
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
      </motion.div>

      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
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
      </motion.div>

      <motion.div 
        className="mt-16 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <p>Pagos procesados de forma segura a través de PayPal. Todos los precios están en USD.</p>
        <div className="flex justify-center mt-4 space-x-4">
          <Shield className="w-5 h-5" />
          <CreditCard className="w-5 h-5" />
          <Star className="w-5 h-5" />
        </div>
      </motion.div>
    </div>
  );
} 