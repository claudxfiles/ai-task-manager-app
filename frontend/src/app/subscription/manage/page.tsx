'use client';

import { useEffect, useState } from 'react';
import { 
  subscriptionService, 
  SubscriptionPlan, 
  Subscription, 
  PaymentHistory 
} from '@/services/subscription.service';
import { createClientComponent } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ManageSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();
  
  // Cargar suscripción y detalles
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Verificar autenticación
        const supabase = createClientComponent();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login?returnTo=/subscription/manage');
          return;
        }
        
        // Cargar la suscripción actual
        const subscription = await subscriptionService.getCurrentSubscription();
        setSubscription(subscription);
        
        // Si no hay suscripción, no hay nada que mostrar
        if (!subscription) {
          setIsLoading(false);
          return;
        }
        
        // Cargar detalles del plan
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', subscription.plan_id)
          .single();
        
        if (planError) {
          console.error('Error al cargar detalles del plan:', planError);
          setError('No se pudieron cargar los detalles del plan');
        } else {
          setPlan(planData);
        }
        
        // Cargar historial de pagos
        const payments = await subscriptionService.getPaymentHistory();
        setPaymentHistory(payments);
        
      } catch (err: any) {
        console.error('Error al cargar datos de suscripción:', err);
        setError(err.message || 'Ocurrió un error al cargar los datos de suscripción');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [router]);
  
  // Cancelar suscripción
  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      setError(null);
      
      await subscriptionService.cancelSubscription();
      
      setSuccess('Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta el final del período actual.');
      setShowCancelDialog(false);
      
      // Actualizar la suscripción en pantalla
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'cancelled',
          cancel_at_period_end: true
        });
      }
      
    } catch (err: any) {
      console.error('Error al cancelar suscripción:', err);
      setError(err.message || 'Ocurrió un error al cancelar la suscripción');
    } finally {
      setIsCancelling(false);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP', { locale: es });
  };
  
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Gestionar Suscripción</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Éxito</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">Cargando datos de suscripción...</span>
        </div>
      ) : !subscription ? (
        <div className="text-center py-12">
          <p className="text-lg mb-6">No tienes ninguna suscripción activa.</p>
          <Button onClick={() => router.push('/pricing')}>Ver Planes Disponibles</Button>
        </div>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tu Suscripción</CardTitle>
              <CardDescription>Detalles de tu plan actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Detalles del Plan</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Plan:</dt>
                      <dd className="font-medium">{plan?.name || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Precio:</dt>
                      <dd className="font-medium">
                        {plan ? `$${plan.price} / ${plan.interval === 'month' ? 'mes' : 'año'}` : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Estado:</dt>
                      <dd>
                        <Badge variant={
                          subscription.status === 'active' ? 'default' :
                          subscription.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }>
                          {
                            subscription.status === 'active' ? 'Activa' :
                            subscription.status === 'cancelled' ? 'Cancelada' :
                            subscription.status === 'trial' ? 'Período de prueba' :
                            subscription.status
                          }
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Período Actual</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Inicia:</dt>
                      <dd className="font-medium">{formatDate(subscription.current_period_start)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Termina:</dt>
                      <dd className="font-medium">{formatDate(subscription.current_period_end)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Renovación:</dt>
                      <dd className="font-medium">
                        {subscription.cancel_at_period_end ? 'No se renovará' : 'Automática'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push('/pricing')}
              >
                Cambiar Plan
              </Button>
              
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Cancelar Suscripción</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Cancelar tu suscripción?</DialogTitle>
                      <DialogDescription>
                        Podrás seguir utilizando todas las funciones del plan hasta el final del período actual.
                        Después de eso, tu cuenta pasará automáticamente al plan gratuito.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowCancelDialog(false)}
                        disabled={isCancelling}
                      >
                        Volver
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : 'Confirmar Cancelación'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Historial de Pagos</h2>
          {paymentHistory.length === 0 ? (
            <p className="text-muted-foreground">No hay registros de pago disponibles.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>ID de Pago</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{payment.payment_id}</TableCell>
                      <TableCell>${payment.amount} {payment.currency}</TableCell>
                      <TableCell>
                        <Badge variant={
                          payment.status === 'completed' ? 'default' :
                          payment.status === 'failed' ? 'destructive' :
                          payment.status === 'refunded' ? 'outline' :
                          'secondary'
                        }>
                          {
                            payment.status === 'completed' ? 'Completado' :
                            payment.status === 'failed' ? 'Fallido' :
                            payment.status === 'refunded' ? 'Reembolsado' :
                            payment.status === 'pending' ? 'Pendiente' :
                            payment.status
                          }
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
} 