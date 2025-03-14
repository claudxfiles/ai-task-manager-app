'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await api.goals.list();
      setGoals(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar las metas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (data: Partial<Goal>) => {
    try {
      await api.goals.create(data);
      toast({
        title: 'Meta creada',
        description: 'La meta se ha creado exitosamente',
      });
      fetchGoals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la meta',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateGoal = async (id: string, data: Partial<Goal>) => {
    try {
      await api.goals.update(id, data);
      toast({
        title: 'Meta actualizada',
        description: 'La meta se ha actualizado exitosamente',
      });
      fetchGoals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la meta',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.goals.delete(id);
      toast({
        title: 'Meta eliminada',
        description: 'La meta se ha eliminado exitosamente',
      });
      fetchGoals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la meta',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Metas</h1>
        <Button onClick={() => handleCreateGoal({ title: 'Nueva Meta', status: 'pending', progress: 0 })}>
          Nueva Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{goal.title}</h3>
                {goal.description && <p className="text-sm text-gray-500">{goal.description}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteGoal(goal.id)}
              >
                ×
              </Button>
            </div>
            <Progress value={goal.progress} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{goal.category}</span>
              <span>{goal.progress}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}