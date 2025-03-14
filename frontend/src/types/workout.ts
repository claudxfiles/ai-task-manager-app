export type ExerciseDifficulty = 'Principiante' | 'Intermedio' | 'Avanzado';
export type MuscleGroupId = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'abs';
export type Equipment = 'Ninguno' | 'Mancuernas' | 'Barra' | 'Máquina' | 'Bandas';

export interface MuscleGroup {
  id: MuscleGroupId;
  name: string;
  muscles: string[];
  exercises: number;
  image: string;
  relatedMuscles: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restTime: number;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: ExerciseDifficulty;
  calories: number;
  targetMuscles: string[];
  exercises: Exercise[];
}

export interface MuscleDetail {
  name: string;
  description: string;
  exercises: string[];
}

export interface WorkoutSession {
  id: string;
  date: Date;
  duration: number;
  calories: number;
  completedExercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
} 