export type GoalType = "desarrollo" | "salud" | "educacion" | "finanzas" | "hobby";
export type GoalStatus = 'pendiente' | 'en progreso' | 'completada';
export type GoalPriority = 'baja' | 'media' | 'alta';
export type LifeAreaType = "desarrollo-personal" | "salud-bienestar" | "educacion" | "finanzas" | "hobbies";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  dueDate: string;
  category: LifeAreaType | 'all';
  isProject: boolean;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: GoalPriority;
  status: GoalStatus;
  tasks: Task[];
  points: number;
}

export interface LifeArea {
  id: LifeAreaType;
  name: string;
  description: string;
  icon: string;
}

export const LIFE_AREAS = {
  'desarrollo-personal': {
    label: 'Desarrollo Personal',
    description: 'Metas relacionadas con el crecimiento personal y habilidades',
    color: 'blue'
  },
  'salud-bienestar': {
    label: 'Salud y Bienestar',
    description: 'Metas relacionadas con la salud física y mental',
    color: 'green'
  },
  'educacion': {
    label: 'Educación',
    description: 'Metas relacionadas con el aprendizaje y formación',
    color: 'purple'
  },
  'finanzas': {
    label: 'Finanzas',
    description: 'Metas relacionadas con el dinero y las inversiones',
    color: 'yellow'
  },
  'hobbies': {
    label: 'Hobbies',
    description: 'Metas relacionadas con pasatiempos e intereses',
    color: 'pink'
  }
} as const;

export type LifeAreaKey = keyof typeof LIFE_AREAS;

export interface FinancialAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: "checking" | "savings" | "investment" | "credit";
} 