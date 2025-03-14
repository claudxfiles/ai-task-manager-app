export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroupId = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs';
export type Equipment = 'bodyweight' | 'dumbbells' | 'barbell' | 'machine' | 'resistance bands';

export interface MuscleGroup {
  id: MuscleGroupId;
  name: string;
  muscles: string[];
  exercises: number;
  icon: string;
  color: string;
  image: string;
  relatedMuscles: string[];
}

export interface MuscleDetail {
  name: string;
  description: string;
  exercises: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  equipment: Equipment[];
  calories: number;
  instructions: string[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: ExerciseDifficulty;
  calories: number;
  image: string;
  targetMuscles: MuscleGroupId[];
  exercises: Exercise[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  duration: number;
  calories: number;
  completedExercises: {
    name: string;
    sets: number;
    reps: number;
  }[];
}