import { apiClient } from '@/lib/api-client';
import { Habit, HabitCreate, HabitUpdate, HabitLog, HabitLogCreate } from '@/types/habit';

// Servicio para gestionar hábitos
export const habitService = {
  // Obtener todos los hábitos
  getHabits: async (): Promise<Habit[]> => {
    try {
      const response = await apiClient.get('/api/v1/habits/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener hábitos:', error);
      return [];
    }
  },
  
  // Obtener un hábito por ID
  getHabitById: async (habitId: string): Promise<Habit> => {
    const response = await apiClient.get(`/api/v1/habits/${habitId}/`);
    return response.data;
  },
  
  // Crear un nuevo hábito
  createHabit: async (habit: HabitCreate): Promise<Habit> => {
    const response = await apiClient.post('/api/v1/habits/', habit);
    return response.data;
  },
  
  // Actualizar un hábito existente
  updateHabit: async (habit: HabitUpdate & { id: string }): Promise<Habit> => {
    const response = await apiClient.put(`/api/v1/habits/${habit.id}/`, habit);
    return response.data;
  },
  
  // Eliminar un hábito
  deleteHabit: async (habitId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/habits/${habitId}/`);
  },
  
  // Obtener logs de un hábito
  getHabitLogs: async (habitId: string): Promise<HabitLog[]> => {
    const response = await apiClient.get(`/api/v1/habits/${habitId}/logs/`);
    return response.data;
  },
  
  // Registrar un nuevo log de hábito
  logHabit: async (logData: HabitLogCreate): Promise<HabitLog> => {
    const response = await apiClient.post(`/api/v1/habits/${logData.habit_id}/logs/`, logData);
    return response.data;
  },
  
  // Eliminar un log de hábito
  deleteHabitLog: async (logId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/habit-logs/${logId}/`);
  },
  
  // Obtener estadísticas de un hábito
  getHabitStats: async (habitId: string): Promise<any> => {
    const response = await apiClient.get(`/api/v1/habits/${habitId}/stats/`);
    return response.data;
  }
}; 