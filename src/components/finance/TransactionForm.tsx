import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFinance } from '@/hooks/useFinance';
import { Transaction } from '@/lib/finance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionFormProps {
  userId: string;
  transaction?: Transaction; // Si se proporciona, estamos editando
  onClose: () => void;
}

// Categorías predefinidas para ingresos y gastos
const incomeCategories = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Regalos',
  'Ventas',
  'Reembolsos',
  'Otros Ingresos'
];

const expenseCategories = [
  'Vivienda',
  'Alimentación',
  'Transporte',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Tecnología',
  'Suscripciones',
  'Deudas',
  'Otros Gastos'
];

export function TransactionForm({ userId, transaction, onClose }: TransactionFormProps) {
  const { addTransaction, updateTransaction, isAddingTransaction, isUpdatingTransaction } = useFinance({ userId });
  const isEditing = !!transaction;
  
  // Estado del formulario con valores iniciales o valores por defecto
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense',
    amount: transaction?.amount.toString() || '',
    currency: transaction?.currency || 'EUR',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || format(new Date(), 'yyyy-MM-dd'),
    payment_method: transaction?.payment_method || '',
    recurring: transaction?.recurring || false,
    recurring_frequency: transaction?.recurring_frequency || 'monthly'
  });
  
  // Lista de categorías según el tipo de transacción
  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;
  
  // Manejar cambios en el formulario
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Si cambiamos el tipo, resetear la categoría
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar los campos requeridos
    if (!formData.amount || !formData.category || !formData.date) {
      alert('Por favor, completa los campos requeridos.');
      return;
    }
    
    // Preparar los datos para enviar
    const transactionData = {
      user_id: userId,
      type: formData.type as 'income' | 'expense',
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      payment_method: formData.payment_method || undefined,
      recurring: formData.recurring,
      recurring_frequency: formData.recurring ? formData.recurring_frequency as 'daily' | 'weekly' | 'monthly' | 'yearly' : undefined
    };
    
    try {
      if (isEditing && transaction) {
        // Actualizar transacción existente
        await updateTransaction({
          id: transaction.id,
          updates: transactionData
        });
      } else {
        // Crear nueva transacción
        await addTransaction(transactionData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar la transacción:', error);
      alert('Hubo un error al guardar la transacción. Por favor, inténtalo de nuevo.');
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Transacción' : 'Añadir Nueva Transacción'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
          
          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción de la transacción"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
            
            <div className="flex-1">
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleChange('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={formData.recurring}
              onCheckedChange={(checked) => handleChange('recurring', !!checked)}
            />
            <Label htmlFor="recurring">Transacción recurrente</Label>
          </div>
          
          {formData.recurring && (
            <div>
              <Label htmlFor="recurring_frequency">Frecuencia</Label>
              <Select
                value={formData.recurring_frequency}
                onValueChange={(value) => handleChange('recurring_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diaria</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
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
              disabled={isAddingTransaction || isUpdatingTransaction}
            >
              {isAddingTransaction || isUpdatingTransaction 
                ? 'Guardando...' 
                : isEditing 
                  ? 'Actualizar' 
                  : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 