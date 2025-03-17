'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { HabitsList } from '@/components/habits/HabitsList';
import { HabitCategoryFilter } from '@/components/habits/HabitCategoryFilter';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Calendar, CheckCircle2, Info } from 'lucide-react';
import { useState } from 'react';
import { CreateHabitDialog } from '@/components/habits/CreateHabitDialog';
import { HabitStats } from '@/components/habits/HabitStats';
import { useHabits } from '@/hooks/useHabits';

export default function HabitsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { habits, isLoading, error, createHabit, completeHabit, selectedCategory, changeCategory } = useHabits();

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Hábitos" 
        description="Registra y monitoriza tus hábitos diarios para desarrollar consistencia."
        icon={<CheckCircle2 className="h-6 w-6" />}
      />

      <div className="mt-6 flex justify-between items-center">
        <HabitCategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={changeCategory}
        />
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nuevo Hábito</span>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Lista de hábitos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Mis Hábitos
              </h2>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Calendario</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>Tendencias</span>
                </Button>
              </div>
            </div>
            
            <HabitsList 
              habits={habits} 
              isLoading={isLoading} 
              error={error}
              onComplete={completeHabit}
            />

            {!isLoading && habits?.length === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <Info className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No hay hábitos</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Comienza creando tu primer hábito para seguir tu progreso.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Crear Hábito</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Estadísticas de hábitos */}
          <HabitStats habits={habits || []} />
        </div>
      </div>

      <CreateHabitDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onCreateHabit={(habit) => {
          createHabit(habit);
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
} 