import { MuscleGroup, WorkoutProgram, MuscleDetail } from '@/types/workout';

export const muscleDetails: Record<string, MuscleDetail> = {
  'Chest.png': {
    name: 'Pectorales',
    description: 'Músculos principales del pecho',
    exercises: ['Press de Banca', 'Aperturas', 'Push-ups']
  },
  'Shoulder.png': {
    name: 'Hombros',
    description: 'Deltoides anterior, medio y posterior',
    exercises: ['Press Militar', 'Elevaciones Laterales', 'Face Pulls']
  },
  'triceps.png': {
    name: 'Tríceps',
    description: 'Tríceps braquial',
    exercises: ['Extensiones', 'Press Francés', 'Fondos']
  },
  'Biceps.png': {
    name: 'Bíceps',
    description: 'Bíceps braquial y braquial anterior',
    exercises: ['Curl con Barra', 'Curl con Mancuernas', 'Curl de Martillo']
  },
  'forearms.png': {
    name: 'Antebrazos',
    description: 'Músculos del antebrazo',
    exercises: ['Curl de Muñeca', 'Agarre de Barra']
  },
  'abs.png': {
    name: 'Abdominales',
    description: 'Recto abdominal y oblicuos',
    exercises: ['Crunches', 'Plancha', 'Russian Twists']
  },
  'Quadriceps.png': {
    name: 'Cuádriceps',
    description: 'Músculo frontal del muslo',
    exercises: ['Sentadillas', 'Prensa', 'Extensiones de Pierna']
  },
  'Hamstring.png': {
    name: 'Isquiotibiales',
    description: 'Músculo posterior del muslo',
    exercises: ['Peso Muerto', 'Curl Femoral']
  },
  'Calves.png': {
    name: 'Gemelos',
    description: 'Músculo de la pantorrilla',
    exercises: ['Elevación de Talones', 'Saltos']
  },
  'Glutes.png': {
    name: 'Glúteos',
    description: 'Músculos de los glúteos',
    exercises: ['Hip Thrust', 'Peso Muerto']
  },
  'Obliques.png': {
    name: 'Oblicuos',
    description: 'Músculos laterales del abdomen',
    exercises: ['Rotaciones Rusas', 'Flexiones Laterales']
  }
};

export const muscleGroups: MuscleGroup[] = [
  {
    id: 'chest',
    name: 'Pecho',
    muscles: ['Pectoral Mayor', 'Pectoral Menor'],
    exercises: 12,
    image: '/images/workout/Chest.png',
    relatedMuscles: ['Chest.png', 'Shoulder.png', 'triceps.png']
  },
  {
    id: 'back',
    name: 'Espalda',
    muscles: ['Dorsal Ancho', 'Trapecio', 'Romboides'],
    exercises: 15,
    image: '/images/workout/Shoulder.png',
    relatedMuscles: ['Shoulder.png', 'Biceps.png', 'triceps.png']
  },
  {
    id: 'shoulders',
    name: 'Hombros',
    muscles: ['Deltoides Anterior', 'Deltoides Medio', 'Deltoides Posterior'],
    exercises: 10,
    image: '/images/workout/Shoulder.png',
    relatedMuscles: ['Shoulder.png', 'triceps.png', 'Chest.png']
  },
  {
    id: 'arms',
    name: 'Brazos',
    muscles: ['Bíceps', 'Tríceps', 'Antebrazos'],
    exercises: 14,
    image: '/images/workout/Biceps.png',
    relatedMuscles: ['Biceps.png', 'triceps.png', 'forearms.png']
  },
  {
    id: 'legs',
    name: 'Piernas',
    muscles: ['Cuádriceps', 'Isquiotibiales', 'Gemelos'],
    exercises: 16,
    image: '/images/workout/Quadriceps.png',
    relatedMuscles: ['Quadriceps.png', 'Hamstring.png', 'Calves.png', 'Glutes.png']
  },
  {
    id: 'abs',
    name: 'Abdominales',
    muscles: ['Recto Abdominal', 'Oblicuos', 'Transverso'],
    exercises: 12,
    image: '/images/workout/abs.png',
    relatedMuscles: ['abs.png', 'Obliques.png']
  }
];

export const workoutPrograms: WorkoutProgram[] = [
  {
    id: 'full-body',
    name: 'Full Body Express',
    description: 'Entrenamiento completo para todo el cuerpo',
    duration: '45 min',
    difficulty: 'Intermedio',
    calories: 450,
    targetMuscles: ['Chest.png', 'Quadriceps.png', 'abs.png'],
    exercises: [
      {
        name: 'Sentadillas',
        sets: 4,
        reps: '12',
        restTime: 60
      },
      {
        name: 'Press de Banca',
        sets: 4,
        reps: '10',
        restTime: 60
      },
      {
        name: 'Plancha',
        sets: 3,
        reps: '45s',
        restTime: 45
      }
    ]
  },
  {
    id: 'upper-body',
    name: 'Upper Body Power',
    description: 'Enfoque en la fuerza del tren superior',
    duration: '50 min',
    difficulty: 'Avanzado',
    calories: 380,
    targetMuscles: ['Chest.png', 'Shoulder.png', 'Biceps.png', 'triceps.png'],
    exercises: [
      {
        name: 'Press Militar',
        sets: 4,
        reps: '8',
        restTime: 90
      },
      {
        name: 'Curl con Barra',
        sets: 4,
        reps: '10',
        restTime: 90
      }
    ]
  },
  {
    id: 'core-blast',
    name: 'Core Blast',
    description: 'Rutina intensiva para el core',
    duration: '30 min',
    difficulty: 'Principiante',
    calories: 250,
    targetMuscles: ['abs.png', 'Obliques.png'],
    exercises: [
      {
        name: 'Plancha',
        sets: 3,
        reps: '45s',
        restTime: 45
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: '20',
        restTime: 45
      }
    ]
  }
];