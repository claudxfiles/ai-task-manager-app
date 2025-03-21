import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/hooks/useFinance';
import { FinancialGoal } from '@/lib/finance';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Sparkles, Target, Calendar, Edit, Check } from 'lucide-react';

interface FinancialGoalsProps {
  goals: FinancialGoal[];
  userId: string;
}

export function FinancialGoals({ goals, userId }: FinancialGoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  
  const { addFinancialGoal, updateGoalProgress } = useFinance({ userId });
  
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Metas Financieras</h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Meta
        </Button>
      </div>
      
      {goals.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <Sparkles className="h-12 w-12 mx-auto mb-3 text-indigo-300" />
          <p>Aún no tienes metas financieras.</p>
          <p className="text-sm mt-1">Las metas te ayudan a planificar y ahorrar para tus sueños.</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            Crear Tu Primera Meta
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="rounded-full p-3 bg-indigo-100 md:self-start">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h4 className="font-medium text-lg">{goal.title}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Meta para: {formatDate(goal.target_date)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <Progress 
                      value={(goal.current_amount / goal.target_amount) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm mt-1">
                    <span>
                      {formatCurrency(goal.current_amount, 'EUR')} de {formatCurrency(goal.target_amount, 'EUR')}
                    </span>
                    <span className="font-medium">
                      {Math.round((goal.current_amount / goal.target_amount) * 100)}%
                    </span>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-gray-500 mt-2">{goal.description}</p>
                  )}
                </div>
                
                <div className="flex gap-2 ml-auto md:self-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingGoal(goal)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      const amount = prompt('Introduce la cantidad a añadir:', '0');
                      if (amount !== null) {
                        const newAmount = goal.current_amount + Number(amount);
                        updateGoalProgress({ id: goal.id, amount: newAmount });
                      }
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" /> Actualizar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Formulario de meta financiera */}
      {(showForm || editingGoal) && (
        <FinancialGoalForm 
          userId={userId}
          goal={editingGoal}
          onClose={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

interface FinancialGoalFormProps {
  userId: string;
  goal?: FinancialGoal | null;
  onClose: () => void;
}

function FinancialGoalForm({ userId, goal, onClose }: FinancialGoalFormProps) {
  const isEditing = !!goal;
  const { addFinancialGoal, updateGoalProgress, isAddingGoal, isUpdatingGoalProgress } = useFinance({ userId });
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    target_amount: goal?.target_amount.toString() || '',
    current_amount: goal?.current_amount.toString() || '0',
    type: goal?.type || 'savings',
    target_date: goal?.target_date || format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
  });
  
  // Añadir meses a una fecha
  function addMonths(date: Date, months: number) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
  
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
    if (!formData.title || !formData.target_amount || !formData.target_date) {
      alert('Por favor, completa los campos requeridos.');
      return;
    }
    
    try {
      const goalData = {
        user_id: userId,
        title: formData.title,
        description: formData.description,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        type: formData.type as 'savings' | 'debt_payoff' | 'purchase',
        target_date: formData.target_date,
        status: 'active' as const,
      };
      
      if (isEditing && goal) {
        // Si estamos editando, actualizamos el progreso de la meta existente
        await updateGoalProgress({
          id: goal.id,
          amount: parseFloat(formData.current_amount)
        });
      } else {
        // Si es nueva, la creamos
        await addFinancialGoal(goalData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar la meta financiera:', error);
      alert('Hubo un error al guardar la meta financiera. Por favor, inténtalo de nuevo.');
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Meta Financiera' : 'Añadir Nueva Meta Financiera'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título de la Meta *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ej. Viaje a Japón, Fondo de emergencia..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe tu meta financiera"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">Importe Objetivo *</Label>
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                value={formData.target_amount}
                onChange={(e) => handleChange('target_amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="current_amount">Importe Actual</Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                value={formData.current_amount}
                onChange={(e) => handleChange('current_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Meta</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Ahorro</SelectItem>
                  <SelectItem value="debt_payoff">Pago de Deuda</SelectItem>
                  <SelectItem value="purchase">Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="target_date">Fecha Objetivo *</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleChange('target_date', e.target.value)}
                required
              />
            </div>
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
              disabled={isAddingGoal || isUpdatingGoalProgress}
            >
              {isAddingGoal || isUpdatingGoalProgress 
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