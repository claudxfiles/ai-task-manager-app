import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface SubscriptionInfo {
  plan_id: string;
  status: string;
  current_period_end: string;
  is_free_plan: boolean;
}

export function SubscriptionSection() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/subscriptions/get-subscription");
        if (!response.ok) {
          throw new Error("Error al obtener la información de suscripción");
        }
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de tu suscripción",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [toast]);

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const handleCancelSubscription = async () => {
    if (!subscription || subscription.is_free_plan) return;

    if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a las funciones premium al final del período de facturación.")) {
      return;
    }

    setCancelLoading(true);
    try {
      const response = await fetch("/api/subscriptions/cancel-subscription", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al cancelar la suscripción");
      }

      const data = await response.json();
      setSubscription(prev => prev ? { ...prev, status: "canceled" } : null);
      
      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta el final del período de facturación.",
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar tu suscripción. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case "plan_free":
        return "Plan Gratuito";
      case "plan_premium":
        return "Plan Premium";
      default:
        return "Plan Desconocido";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="w-3 h-3 mr-1" /> Activa
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="secondary">
            Cancelada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-soul-purple to-soul-blue flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Suscripción</h2>
            <p className="text-sm text-muted-foreground">
              Administra tu plan y suscripción
            </p>
          </div>
        </div>

        {subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan actual</p>
                <p className="text-lg font-semibold">{getPlanName(subscription.plan_id)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <div className="mt-1">{getStatusBadge(subscription.status)}</div>
              </div>
              {!subscription.is_free_plan && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Período actual termina</p>
                    <p className="text-base">{formatDate(subscription.current_period_end)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Método de pago</p>
                    <p className="text-base">PayPal</p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t flex justify-end space-x-3">
              {subscription.is_free_plan ? (
                <Button onClick={handleUpgrade}>
                  Actualizar a Premium
                </Button>
              ) : subscription.status === "active" ? (
                <Button 
                  variant="outline" 
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    "Cancelar suscripción"
                  )}
                </Button>
              ) : (
                <Button onClick={handleUpgrade}>
                  Reactivar suscripción
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">No hay suscripción activa</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No tienes ninguna suscripción activa en este momento
              </p>
            </div>
            <Button onClick={handleUpgrade}>
              Ver planes disponibles
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
} 