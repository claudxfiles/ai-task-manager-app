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

/**
 * Tipos relacionados con entrenamientos
 */

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
  ABS = 'abs',
  BICEPS = 'biceps',
  CALVES = 'calves',
  CHEST = 'chest',
  FOREARMS = 'forearms',
  GLUTES = 'glutes',
  HAMSTRING = 'hamstring',
  OBLIQUES = 'obliques',
  QUADRICEPS = 'quadriceps',
  SHOULDER = 'shoulder',
  TRICEPS = 'triceps',
  BACK = 'back',
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

// Interfaces para la aplicación
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  date: string;
  created_at: string;
  calories_burned?: number;
  workout_type: WorkoutType;
  related_goal_id?: string;
  rating?: number;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration_seconds?: number;
  rest_seconds: number;
  order_index: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExercise[];
}

// Tipo para ser usado en contexto del asistente de IA
export interface WorkoutData extends WorkoutWithExercises {
  totalWorkoutsThisWeek?: number;
  totalWorkoutsThisMonth?: number;
  favoriteExercises?: string[];
  recentProgress?: WorkoutProgressData[];
  nextScheduledWorkout?: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  estimated_duration_minutes: number;
  workout_type: WorkoutType;
  difficulty_level: DifficultyLevel;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  tags?: string[];
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  name: string;
  sets: number;
  reps: number;
  suggested_weight?: number;
  rest_seconds: number;
  order_index: number;
  notes?: string;
  muscle_group: MuscleGroup;
  exercise_type: ExerciseType;
  created_at: string;
  updated_at: string;
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

export interface WorkoutProgressRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  max_weight: number;
  max_reps: number;
  total_volume: number;
  last_performed: string;
  best_set: {
    date: string;
    weight: number;
    reps: number;
    volume: number;
  };
  progress_history: Array<{
    date: string;
    weight: number;
    reps: number;
    volume: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface WorkoutFilters {
  dateFrom?: Date;
  dateTo?: Date;
  workoutType?: WorkoutType;
  muscleGroups?: MuscleGroup[];
  search?: string;
}

export interface ExerciseTemplateFilters {
  muscleGroup?: MuscleGroup;
  exerciseType?: ExerciseType;
  search?: string;
}

export interface WorkoutStatistics {
  totalWorkouts: number;
  totalDuration: number;
  totalExercises: number;
  favoriteWorkoutType: string;
  workoutsByType: Record<string, number>;
  workoutsByMonth: Record<string, number>;
  mostWorkedMuscleGroups: Record<string, number>;
  averageDuration: number;
  streakDays: number;
}

export interface AIWorkoutRecommendation {
  name: string;
  description: string;
  workoutType: WorkoutType;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  muscleGroups: MuscleGroup[];
  exercises: {
    name: string;
    sets: number;
    reps: number;
    restSeconds: number;
    notes?: string;
  }[];
  notes?: string;
} 