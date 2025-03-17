import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHabits, 
  getHabit, 
  createHabit, 
  updateHabit, 
  deleteHabit, 
  getHabitLogs, 
  markHabitAsCompleted,
  calculateHabitStatistics
} from '@/lib/habits';
import { Habit, HabitCreate, HabitUpdate, HabitWithLogsAndProgress } from '@/types/habit';
import { useState, useCallback } from 'react';
import { habitService } from '@/services/habitService';
import { HabitLog, HabitLogCreate } from '@/types/habit';

export const useHabits = (category?: string) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(category);
  
  // Obtener todos los hábitos
  const { data: allHabits, isLoading, error, refetch } = useQuery({
    queryKey: ['habits'],
    queryFn: () => habitService.getHabits(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // Filtrar por categoría si es necesario
  const habits = allHabits && selectedCategory && selectedCategory !== 'all'
    ? allHabits.filter(habit => habit.category === selectedCategory)
    : allHabits;
  
  // Mutación para crear un hábito
  const createHabitMutation = useMutation({
    mutationFn: (habit: HabitCreate) => habitService.createHabit(habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
  
  // Mutación para actualizar un hábito
  const updateHabitMutation = useMutation({
    mutationFn: ({ id, ...rest }: HabitUpdate & { id: string }) => 
      habitService.updateHabit({ id, ...rest }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
  
  // Mutación para eliminar un hábito
  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) => habitService.deleteHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
  
  // Mutación para marcar un hábito como completado
  const completeHabitMutation = useMutation({
    mutationFn: ({ habitId, notes, rating }: { habitId: string; notes?: string; rating?: number }) => 
      habitService.logHabit({
        habit_id: habitId,
        completed_date: new Date().toISOString(),
        notes,
        quality_rating: rating
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
    },
  });
  
  // Función para cambiar la categoría seleccionada
  const changeCategory = useCallback((newCategory?: string) => {
    setSelectedCategory(newCategory);
  }, []);
  
  return {
    habits,
    isLoading,
    error,
    refetch,
    createHabit: createHabitMutation.mutate,
    updateHabit: updateHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,
    completeHabit: completeHabitMutation.mutate,
    isCreating: createHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
    isCompleting: completeHabitMutation.isPending,
    selectedCategory,
    changeCategory,
  };
};

export const useHabitDetails = (habitId: string) => {
  const queryClient = useQueryClient();
  
  // Obtener un hábito específico
  const { data: habit, isLoading: isLoadingHabit } = useQuery({
    queryKey: ['habit', habitId],
    queryFn: () => getHabit(habitId),
    enabled: !!habitId,
  });
  
  // Obtener los registros de un hábito
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['habitLogs', habitId],
    queryFn: () => getHabitLogs(habitId),
    enabled: !!habitId,
  });
  
  // Calcular estadísticas si tenemos tanto el hábito como los registros
  const habitWithStats: HabitWithLogsAndProgress | undefined = 
    habit && logs 
      ? calculateHabitStatistics(habit, logs) 
      : undefined;
  
  // Mutación para marcar un hábito como completado
  const completeHabitMutation = useMutation({
    mutationFn: ({ 
      notes, 
      rating 
    }: { 
      notes?: string; 
      rating?: number 
    }) => markHabitAsCompleted(habitId, notes, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit', habitId] });
      queryClient.invalidateQueries({ queryKey: ['habitLogs', habitId] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
  
  return {
    habit: habitWithStats,
    logs,
    isLoading: isLoadingHabit || isLoadingLogs,
    completeHabit: completeHabitMutation.mutate,
    isCompleting: completeHabitMutation.isPending,
  };
};

// Hook para obtener un hábito específico por ID
export const useGetHabitById = (habitId: string) => {
  return useQuery({
    queryKey: ['habits', habitId],
    queryFn: () => habitService.getHabitById(habitId),
    enabled: !!habitId,
  });
};

// Hook para obtener los logs de un hábito
export const useGetHabitLogs = (habitId: string) => {
  return useQuery({
    queryKey: ['habitLogs', habitId],
    queryFn: () => habitService.getHabitLogs(habitId),
    enabled: !!habitId,
  });
};

// Hook para crear un nuevo hábito
export const useCreateHabit = (options?: any) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newHabit: HabitCreate) => habitService.createHabit(newHabit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    ...options,
  });
};

// Hook para actualizar un hábito existente
export const useUpdateHabit = (options?: any) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updateData: HabitUpdate & { id: string }) => habitService.updateHabit(updateData),
    onSuccess: (updatedHabit: Habit) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', updatedHabit.id] });
    },
    ...options,
  });
};

// Hook para eliminar un hábito
export const useDeleteHabit = (options?: any) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (habitId: string) => habitService.deleteHabit(habitId),
    onSuccess: (_, habitId: string) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', habitId] });
      queryClient.invalidateQueries({ queryKey: ['habitLogs', habitId] });
    },
    ...options,
  });
};

// Hook para registrar un nuevo log de hábito
export const useLogHabit = (options?: any) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (logData: HabitLogCreate) => habitService.logHabit(logData),
    onSuccess: (newLog: HabitLog) => {
      queryClient.invalidateQueries({ queryKey: ['habitLogs', newLog.habit_id] });
      queryClient.invalidateQueries({ queryKey: ['habits', newLog.habit_id] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    ...options,
  });
};

// Hook para eliminar un log de hábito
export const useDeleteHabitLog = (options?: any) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ habitId, logId }: { habitId: string, logId: string }) => 
      habitService.deleteHabitLog(logId),
    onSuccess: (_, { habitId }: { habitId: string, logId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['habitLogs', habitId] });
      queryClient.invalidateQueries({ queryKey: ['habits', habitId] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    ...options,
  });
}; 