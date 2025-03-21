import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/hooks/useFinance';
import { Subscription } from '@/lib/finance';
import { format, parseISO, addDays, differenceInDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Edit, Trash2, Bell, Calendar, CreditCard, AlertTriangle } from 'lucide-react';

interface SubscriptionsOverviewProps {
  subscriptions: Subscription[];
  userId: string;
}

// Categorías predefinidas para suscripciones
const subscriptionCategories = [
  'Entretenimiento',
  'Música',
  'Vídeo',
  'Software',
  'Noticias',
  'Juegos',
  'Almacenamiento',
  'Servicios',
  'Otros'
];

export function SubscriptionsOverview({ subscriptions, userId }: SubscriptionsOverviewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  
  const { 
    addSubscription, 
    updateSubscription, 
    deleteSubscription,
    isAddingSubscription,
    isUpdatingSubscription,
    isDeletingSubscription
  } = useFinance({ userId });
  
  // Total mensual de suscripciones
  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      // Normalizar a base mensual
      let monthlyAmount = sub.amount;
      if (sub.billing_cycle === 'yearly') {
        monthlyAmount = sub.amount / 12;
      } else if (sub.billing_cycle === 'quarterly') {
        monthlyAmount = sub.amount / 3;
      } else if (sub.billing_cycle === 'weekly') {
        monthlyAmount = sub.amount * 4.33; // Promedio de semanas en un mes
      }
      return total + monthlyAmount;
    }, 0);
  };
  
  // Formatear moneda
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };
  
  // Determinar si una suscripción está próxima a renovarse
  const isRenewalSoon = (nextBillingDate: string, reminderDays: number) => {
    const today = new Date();
    const billingDate = parseISO(nextBillingDate);
    return differenceInDays(billingDate, today) <= reminderDays && !isBefore(billingDate, today);
  };
  
  // Manejar eliminación de suscripción
  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta suscripción?')) {
      try {
        await deleteSubscription(id);
      } catch (error) {
        console.error('Error al eliminar la suscripción:', error);
        alert('No se pudo eliminar la suscripción.');
      }
    }
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestión de Suscripciones</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Añadir Suscripción
          </Button>
        </div>
        
        {/* Resumen de suscripciones */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-indigo-100">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Mensual</p>
                <h3 className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(calculateMonthlyTotal(), 'EUR')}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-amber-100">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Suscripciones Activas</p>
                <h3 className="text-2xl font-bold text-amber-600">
                  {subscriptions.length}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-red-100">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Renovaciones Próximas</p>
                <h3 className="text-2xl font-bold text-red-600">
                  {subscriptions.filter(sub => isRenewalSoon(sub.next_billing_date, sub.reminder_days_before)).length}
                </h3>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Lista de suscripciones */}
        {subscriptions.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No tienes suscripciones activas. ¡Añade tu primera suscripción!
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Renovaciones próximas */}
            {subscriptions.some(sub => isRenewalSoon(sub.next_billing_date, sub.reminder_days_before)) && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  Renovaciones Próximas
                </h3>
                <div className="space-y-2">
                  {subscriptions
                    .filter(sub => isRenewalSoon(sub.next_billing_date, sub.reminder_days_before))
                    .map(subscription => (
                      <Card key={subscription.id} className="p-4 border-l-4 border-amber-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{subscription.service_name}</p>
                            <p className="text-sm text-amber-600">
                              Se renovará el {formatDate(subscription.next_billing_date)} ({formatCurrency(subscription.amount, subscription.currency)})
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingSubscription(subscription)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
            
            <h3 className="text-lg font-medium mb-3">Todas las Suscripciones</h3>
            <div className="space-y-2">
              {subscriptions.map(subscription => (
                <Card key={subscription.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium">{subscription.service_name}</p>
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {subscription.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap text-sm text-gray-500 mt-1">
                        <p className="mr-4">
                          {formatCurrency(subscription.amount, subscription.currency)} / {subscription.billing_cycle}
                        </p>
                        <p className="mr-4">
                          Próximo pago: {formatDate(subscription.next_billing_date)}
                        </p>
                        {subscription.notes && (
                          <p className="text-xs italic mt-1">{subscription.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingSubscription(subscription)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Formulario de suscripción */}
      {(showForm || editingSubscription) && (
        <SubscriptionForm 
          userId={userId}
          subscription={editingSubscription}
          onClose={() => {
            setShowForm(false);
            setEditingSubscription(null);
          }}
        />
      )}
    </>
  );
}

interface SubscriptionFormProps {
  userId: string;
  subscription?: Subscription | null;
  onClose: () => void;
}

function SubscriptionForm({ userId, subscription, onClose }: SubscriptionFormProps) {
  const isEditing = !!subscription;
  const { addSubscription, updateSubscription, isAddingSubscription, isUpdatingSubscription } = useFinance({ userId });
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    service_name: subscription?.service_name || '',
    amount: subscription?.amount.toString() || '',
    currency: subscription?.currency || 'EUR',
    billing_cycle: subscription?.billing_cycle || 'monthly',
    next_billing_date: subscription?.next_billing_date || format(new Date(), 'yyyy-MM-dd'),
    category: subscription?.category || '',
    notes: subscription?.notes || '',
    reminder_days_before: subscription?.reminder_days_before.toString() || '7'
  });
  
  // Manejar cambios en el formulario
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.service_name || !formData.amount || !formData.next_billing_date) {
      alert('Por favor, completa los campos requeridos.');
      return;
    }
    
    try {
      const subscriptionData = {
        user_id: userId,
        service_name: formData.service_name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle as 'monthly' | 'yearly' | 'quarterly' | 'weekly',
        next_billing_date: formData.next_billing_date,
        category: formData.category,
        notes: formData.notes || undefined,
        reminder_days_before: parseInt(formData.reminder_days_before) || 7
      };
      
      if (isEditing && subscription) {
        await updateSubscription({
          id: subscription.id,
          updates: subscriptionData
        });
      } else {
        await addSubscription(subscriptionData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar la suscripción:', error);
      alert('Hubo un error al guardar la suscripción. Por favor, inténtalo de nuevo.');
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Suscripción' : 'Añadir Nueva Suscripción'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="service_name">Nombre del Servicio *</Label>
            <Input
              id="service_name"
              value={formData.service_name}
              onChange={(e) => handleChange('service_name', e.target.value)}
              placeholder="Netflix, Spotify, etc."
              required
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="amount">Importe *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="w-24">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billing_cycle">Ciclo de Facturación</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) => handleChange('billing_cycle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="next_billing_date">Próxima Facturación *</Label>
              <Input
                id="next_billing_date"
                type="date"
                value={formData.next_billing_date}
                onChange={(e) => handleChange('next_billing_date', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reminder_days_before">Días de Recordatorio</Label>
              <Input
                id="reminder_days_before"
                type="number"
                min="1"
                max="30"
                value={formData.reminder_days_before}
                onChange={(e) => handleChange('reminder_days_before', e.target.value)}
                placeholder="7"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notas adicionales sobre la suscripción"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isAddingSubscription || isUpdatingSubscription}
            >
              {isAddingSubscription || isUpdatingSubscription 
                ? 'Guardando...' 
                : isEditing
                  ? 'Actualizar'
                  : 'Guardar'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 