// Definición de tipos para hábitos

// Tipo base para un hábito
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
  specific_days?: string[]; // Para frecuencia personalizada, ej: ["monday", "wednesday", "friday"]
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
  related_goal_id?: string;
  category?: string;
  reminder_time?: string; // Formato HH:MM
  cue?: string; // Disparador del hábito
  reward?: string; // Recompensa asociada
  is_active: boolean;
}

// Tipo para crear un nuevo hábito
export interface HabitCreate {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
  specific_days?: string[];
  related_goal_id?: string;
  category?: string;
  reminder_time?: string;
  cue?: string;
  reward?: string;
  is_active?: boolean;
}

// Tipo para actualizar un hábito existente
export interface HabitUpdate {
  id: string;
  title?: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
  specific_days?: string[];
  related_goal_id?: string;
  category?: string;
  reminder_time?: string;
  cue?: string;
  reward?: string;
  is_active?: boolean;
}

// Tipo para un registro de hábito completado
export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string; // Formato ISO
  notes?: string;
  quality_rating?: number; // Opcional, 1-5
  emotion?: string; // Opcional, cómo se sintió
  created_at: string;
}

// Tipo para crear un nuevo registro de hábito
export interface HabitLogCreate {
  habit_id: string;
  completed_date: string;
  notes?: string;
  quality_rating?: number;
  emotion?: string;
}

// Tipo para estadísticas de un hábito
export interface HabitStats {
  total_completions: number;
  completion_rate: number; // Porcentaje
  current_streak: number;
  best_streak: number;
  average_quality?: number;
  monthly_stats: {
    month: string;
    completions: number;
    total_days: number;
    rate: number;
  }[];
}

// Tipo para un hábito con sus estadísticas
export interface HabitWithStats extends Habit {
  stats: HabitStats;
} 