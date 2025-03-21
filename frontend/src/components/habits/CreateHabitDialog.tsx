'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HabitCreate } from '@/types/habit';
import { HABIT_CATEGORIES } from '@/types/habit';

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateHabit: (habit: HabitCreate) => void;
}

export const CreateHabitDialog: React.FC<CreateHabitDialogProps> = ({
  open,
  onOpenChange,
  onCreateHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [category, setCategory] = useState('');
  const [goalValue, setGoalValue] = useState(1);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newHabit: HabitCreate = {
      title,
      description: description || undefined,
      frequency,
      category: category || undefined,
      goal_value: goalValue,
      is_active: true,
      specific_days: null
    };
    
    console.log('Enviando hábito al backend:', JSON.stringify(newHabit));
    
    onCreateHabit(newHabit);
    resetForm();
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFrequency('daily');
    setCategory('');
    setGoalValue(1);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear nuevo hábito</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Completa el formulario para crear un nuevo hábito de seguimiento.
            </p>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-medium">
                Nombre del hábito *
              </Label>
              <Input
                id="title"
                placeholder="Ej. Meditar todos los días"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-medium">
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Añade más detalles sobre este hábito..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="frequency" className="font-medium">
                  Frecuencia
                </Label>
                <Select
                  value={frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') => setFrequency(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category" className="font-medium">
                  Categoría
                </Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {HABIT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="goalValue" className="font-medium">
                Valor Objetivo
              </Label>
              <Input
                id="goalValue"
                type="number"
                min="1"
                value={goalValue}
                onChange={(e) => setGoalValue(parseInt(e.target.value) || 1)}
                placeholder="Ej. 1 para completar una vez, 10 para ejercicios, etc."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Crear Hábito
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 