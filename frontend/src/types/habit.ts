export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'specific_days';
  specific_days?: string[];
  category?: string;
  reminder_time?: string;
  cue?: string;
  reward?: string;
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
};

export type HabitCreate = {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'specific_days';
  specific_days?: string[];
  category?: string;
  reminder_time?: string;
  cue?: string;
  reward?: string;
};

export type HabitUpdate = Partial<HabitCreate>;

export type HabitLog = {
  id: string;
  habit_id: string;
  completed_date: string;
  notes?: string;
  quality_rating?: number;
  emotion?: string;
  created_at: string;
};

export type HabitLogCreate = {
  habit_id: string;
  completed_date: string;
  notes?: string;
  quality_rating?: number;
  emotion?: string;
};

export type HabitWithLogsAndProgress = Habit & {
  logs?: HabitLog[];
  progressToday: boolean;
  progressThisWeek: number;
  progressThisMonth: number;
};

export type HabitCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const HABIT_CATEGORIES: HabitCategory[] = [
  {
    id: 'health',
    name: 'Salud',
    icon: 'heart',
    color: 'text-red-500',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: 'dumbbell',
    color: 'text-blue-500',
  },
  {
    id: 'productivity',
    name: 'Productividad',
    icon: 'briefcase',
    color: 'text-indigo-500',
  },
  {
    id: 'learning',
    name: 'Aprendizaje',
    icon: 'book',
    color: 'text-emerald-500',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: 'brain',
    color: 'text-purple-500',
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'user',
    color: 'text-amber-500',
  },
  {
    id: 'finance',
    name: 'Finanzas',
    icon: 'dollar-sign',
    color: 'text-green-500',
  },
  {
    id: 'other',
    name: 'Otros',
    icon: 'grid',
    color: 'text-gray-500',
  },
]; 