import { Database } from './supabase';

// Tipos básicos de Supabase
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'];
export type ExerciseTemplate = Database['public']['Tables']['exercise_templates']['Row'];
export type WorkoutTemplate = Database['public']['Tables']['workout_templates']['Row'];
export type WorkoutTemplateExercise = Database['public']['Tables']['workout_template_exercises']['Row'];
export type WorkoutProgress = Database['public']['Tables']['workout_progress']['Row'];

// Tipos para inserciones
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
export type WorkoutExerciseInsert = Database['public']['Tables']['workout_exercises']['Insert'];

// Tipos extendidos para el UI
export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExercise[];
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: WorkoutTemplateExercise[];
}

export interface WorkoutProgressData {
  exerciseName: string;
  dates: string[];
  values: number[];
  metric: 'weight' | 'reps' | 'duration' | 'distance';
}

// Enums para opciones predefinidas
export enum WorkoutType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  HIIT = 'hiit',
  YOGA = 'yoga',
  PILATES = 'pilates',
  CROSSFIT = 'crossfit',
  CUSTOM = 'custom'
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  LEGS = 'legs',
  CORE = 'core',
  FULL_BODY = 'full_body',
  CARDIO = 'cardio'
}

export enum ExerciseType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BODYWEIGHT = 'bodyweight',
  COMPOUND = 'compound',
  ISOLATION = 'isolation'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// Interfaces para filtros y búsquedas
export interface WorkoutFilters {
  dateFrom?: Date;
  dateTo?: Date;
  workoutType?: WorkoutType;
  search?: string;
}

export interface ExerciseTemplateFilters {
  muscleGroup?: MuscleGroup;
  exerciseType?: ExerciseType;
  search?: string;
}

// Tipos para estadísticas y análisis
export interface WorkoutStatistics {
  totalWorkouts: number;
  totalDuration: number;
  totalExercises: number;
  favoriteWorkoutType: string;
  workoutsByType: Record<string, number>;
  workoutsByMonth: Record<string, number>;
  averageDuration: number;
  streakDays: number;
}

// Interfaces para recomendaciones de IA
export interface AIWorkoutRecommendation {
  name: string;
  description: string;
  workoutType: WorkoutType;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    restSeconds: number;
    notes?: string;
  }[];
  notes?: string;
} 