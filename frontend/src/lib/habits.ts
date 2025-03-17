import { 
  Habit, 
  HabitCreate, 
  HabitUpdate, 
  HabitLog, 
  HabitLogCreate 
} from '@/types/habit';
import { apiClient } from './api-client';
import { format, isToday, startOfWeek, startOfMonth, parseISO } from 'date-fns';

// Obtener todos los hábitos del usuario
export const getHabits = async (category?: string): Promise<Habit[]> => {
  const params = category ? { category } : {};
  const response = await apiClient.get<Habit[]>('/habits', { params });
  return response.data;
};

// Obtener un hábito específico
export const getHabit = async (habitId: string): Promise<Habit> => {
  const response = await apiClient.get<Habit>(`/habits/${habitId}`);
  return response.data;
};

// Crear un nuevo hábito
export const createHabit = async (habit: HabitCreate): Promise<Habit> => {
  const response = await apiClient.post<Habit>('/habits', habit);
  return response.data;
};

// Actualizar un hábito existente
export const updateHabit = async (habitId: string, habit: HabitUpdate): Promise<Habit> => {
  const response = await apiClient.put<Habit>(`/habits/${habitId}`, habit);
  return response.data;
};

// Eliminar un hábito
export const deleteHabit = async (habitId: string): Promise<void> => {
  await apiClient.delete(`/habits/${habitId}`);
};

// Obtener los registros de un hábito
export const getHabitLogs = async (
  habitId: string, 
  startDate?: Date, 
  endDate?: Date
): Promise<HabitLog[]> => {
  const params: Record<string, string> = {};
  
  if (startDate) {
    params.start_date = format(startDate, 'yyyy-MM-dd');
  }
  
  if (endDate) {
    params.end_date = format(endDate, 'yyyy-MM-dd');
  }
  
  const response = await apiClient.get<HabitLog[]>(`/habits/${habitId}/logs`, { params });
  return response.data;
};

// Registrar completitud de un hábito
export const logHabitCompletion = async (
  habitId: string, 
  logData: Omit<HabitLogCreate, 'habit_id'>
): Promise<HabitLog> => {
  const data: HabitLogCreate = {
    ...logData,
    habit_id: habitId
  };
  
  const response = await apiClient.post<HabitLog>(`/habits/${habitId}/logs`, data);
  return response.data;
};

// Marcar un hábito como completado hoy
export const markHabitAsCompleted = async (
  habitId: string, 
  notes?: string, 
  rating?: number
): Promise<HabitLog> => {
  return await logHabitCompletion(habitId, {
    completed_date: format(new Date(), 'yyyy-MM-dd'),
    notes,
    quality_rating: rating
  });
};

// Calcular estadísticas para un hábito
export const calculateHabitStatistics = (habit: Habit, logs: HabitLog[] = []) => {
  const now = new Date();
  const parsedLogs = logs.map(log => ({
    ...log,
    parsedDate: parseISO(log.completed_date)
  }));
  
  // Verificar si el hábito fue completado hoy
  const completedToday = parsedLogs.some(log => isToday(log.parsedDate));
  
  // Calcular progreso semanal (cantidad de días esta semana)
  const weekStart = startOfWeek(now);
  const completionsThisWeek = parsedLogs.filter(log => log.parsedDate >= weekStart).length;
  
  // Calcular progreso mensual (cantidad de días este mes)
  const monthStart = startOfMonth(now);
  const completionsThisMonth = parsedLogs.filter(log => log.parsedDate >= monthStart).length;
  
  return {
    ...habit,
    logs,
    progressToday: completedToday,
    progressThisWeek: completionsThisWeek,
    progressThisMonth: completionsThisMonth
  };
}; 