import { apiClient } from '@/lib/api-client';
import { Habit, HabitCreate, HabitUpdate, HabitLog, HabitLogCreate } from '@/types/habit';

// Servicio para gestionar hábitos
export const habitService = {
  // Obtener todos los hábitos
  getHabits: async (): Promise<Habit[]> => {
    try {
      console.log('Solicitando lista de hábitos al servidor...');
      const response = await apiClient.get('/api/v1/habits/');
      console.log('Respuesta del servidor (hábitos):', response.data);
      
      // Log detallado para depuración
      if (Array.isArray(response.data)) {
        console.log(`Se encontraron ${response.data.length} hábitos en la respuesta`);
        if (response.data.length === 0) {
          console.log('La respuesta contiene un array vacío, verificar base de datos');
        }
      } else {
        console.log('La respuesta no es un array:', typeof response.data);
      }
      
      return response.data || [];
    } catch (error: any) {
      console.error('Error al obtener hábitos:', error);
      // Mostrar detalles completos del error
      if (error.response) {
        console.error('Detalles de la respuesta de error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      return [];
    }
  },
  
  // Obtener un hábito por ID
  getHabitById: async (habitId: string): Promise<Habit> => {
    try {
      console.log(`Solicitando hábito ${habitId} al servidor...`);
      const response = await apiClient.get(`/api/v1/habits/${habitId}/`);
      console.log(`Respuesta del servidor (hábito ${habitId}):`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener hábito ${habitId}:`, error);
      throw error;
    }
  },
  
  // Crear un nuevo hábito
  createHabit: async (habit: HabitCreate): Promise<Habit> => {
    try {
      // Formato simplificado de envío con valores predeterminados
      const habitData = {
        title: habit.title,
        description: habit.description || null,
        frequency: habit.frequency || 'daily',
        specific_days: habit.specific_days || null,
        category: habit.category || null,
        goal_value: habit.goal_value || 1,
        is_active: true
      };
      
      console.log('Enviando nuevo hábito al servidor:', habitData);
      const response = await apiClient.post('/api/v1/habits/', habitData);
      console.log('Respuesta del servidor (nuevo hábito):', response.data);
      
      // Verificar la respuesta
      if (response.data && response.data.id) {
        console.log(`Hábito creado exitosamente con ID: ${response.data.id}`);
      } else {
        console.warn('Se creó el hábito pero la respuesta no contiene un ID válido:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error al crear hábito:', error);
      // Mostrar detalles completos del error
      if (error.response) {
        console.error('Detalles de la respuesta de error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  },
  
  // Actualizar un hábito existente
  updateHabit: async (habit: HabitUpdate & { id: string }): Promise<Habit> => {
    try {
      console.log(`Actualizando hábito ${habit.id}:`, habit);
      const response = await apiClient.put(`/api/v1/habits/${habit.id}/`, habit);
      console.log(`Respuesta del servidor (actualización de hábito ${habit.id}):`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar hábito ${habit.id}:`, error);
      throw error;
    }
  },
  
  // Eliminar un hábito
  deleteHabit: async (habitId: string): Promise<void> => {
    try {
      console.log(`Eliminando hábito ${habitId}...`);
      await apiClient.delete(`/api/v1/habits/${habitId}/`);
      console.log(`Hábito ${habitId} eliminado correctamente`);
    } catch (error) {
      console.error(`Error al eliminar hábito ${habitId}:`, error);
      throw error;
    }
  },
  
  // Obtener logs de un hábito
  getHabitLogs: async (habitId: string): Promise<HabitLog[]> => {
    try {
      console.log(`Solicitando logs del hábito ${habitId}...`);
      const response = await apiClient.get(`/api/v1/habits/${habitId}/logs/`);
      console.log(`Respuesta del servidor (logs del hábito ${habitId}):`, response.data);
      return response.data || [];
    } catch (error) {
      console.error(`Error al obtener logs del hábito ${habitId}:`, error);
      return [];
    }
  },
  
  // Registrar un nuevo log de hábito
  logHabit: async (logData: HabitLogCreate): Promise<HabitLog> => {
    try {
      const logToSend = {
        habit_id: logData.habit_id,
        completed_date: logData.completed_date,
        notes: logData.notes || null,
        quality_rating: logData.quality_rating || null,
        emotion: logData.emotion || null,
        value: logData.value || 1
      };
      
      console.log(`Registrando log para hábito ${logData.habit_id}:`, logToSend);
      const response = await apiClient.post(`/api/v1/habits/${logData.habit_id}/logs/`, logToSend);
      console.log(`Respuesta del servidor (nuevo log para hábito ${logData.habit_id}):`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al registrar log para hábito ${logData.habit_id}:`, error);
      throw error;
    }
  },
  
  // Eliminar un log de hábito
  deleteHabitLog: async (logId: string): Promise<void> => {
    try {
      console.log(`Eliminando log ${logId}...`);
      await apiClient.delete(`/api/v1/habit-logs/${logId}/`);
      console.log(`Log ${logId} eliminado correctamente`);
    } catch (error) {
      console.error(`Error al eliminar log ${logId}:`, error);
      throw error;
    }
  },
  
  // Obtener estadísticas de un hábito
  getHabitStats: async (habitId: string): Promise<any> => {
    try {
      console.log(`Solicitando estadísticas del hábito ${habitId}...`);
      const response = await apiClient.get(`/api/v1/habits/${habitId}/stats/`);
      console.log(`Respuesta del servidor (estadísticas del hábito ${habitId}):`, response.data);
      return response.data || {};
    } catch (error) {
      console.error(`Error al obtener estadísticas del hábito ${habitId}:`, error);
      return {};
    }
  },
  
  // Función de diagnóstico para depurar problemas de hábitos
  getDiagnostic: async (): Promise<any> => {
    try {
      console.log('Solicitando diagnóstico de hábitos...');
      const response = await apiClient.get('/api/v1/habits/diagnostic');
      console.log('Respuesta del diagnóstico:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener diagnóstico:', error);
      throw error;
    }
  }
}; 