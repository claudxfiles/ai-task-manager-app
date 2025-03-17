'use client';

import React from 'react';
import { Habit } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Activity, 
  MoreVertical 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { HABIT_CATEGORIES } from '@/types/habit';
import Link from 'next/link';

interface HabitCardProps {
  habit: Habit;
  onComplete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete }) => {
  // Encontrar la categoría para obtener el ícono
  const category = HABIT_CATEGORIES.find(c => c.id === habit.category) || HABIT_CATEGORIES[7]; // Default a "Otros"
  
  // Formatear la fecha de creación
  const formattedDate = formatDistanceToNow(new Date(habit.created_at), { 
    addSuffix: true,
    locale: es
  });

  // Función para determinar si el hábito ya se completó hoy
  const isCompletedToday = false; // Esto debería implementarse con la data real
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{habit.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${category.color} bg-opacity-10`}>
              {category.name}
            </span>
          </div>
          
          {habit.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {habit.description}
            </p>
          )}
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            <Clock className="h-4 w-4 mr-1" />
            <span>Creado {formattedDate}</span>
            
            {habit.current_streak > 0 && (
              <div className="ml-4 flex items-center">
                <Activity className="h-4 w-4 mr-1 text-indigo-500" />
                <span className="text-indigo-600 dark:text-indigo-400">
                  {habit.current_streak} días consecutivos
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          {!isCompletedToday ? (
            <Button 
              onClick={onComplete} 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1"
              aria-label="Completar hábito"
            >
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Completar</span>
            </Button>
          ) : (
            <div className="flex items-center text-emerald-500">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Completado hoy</span>
            </div>
          )}
          
          <Link href={`/dashboard/habits/${habit.id}`} className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}; 