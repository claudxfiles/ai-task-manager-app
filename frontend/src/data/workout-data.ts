import { MuscleGroup, MuscleDetail, WorkoutProgram } from '@/types/workout';

export const muscleDetails: Record<string, MuscleDetail> = {
  'pectoralis-major.png': {
    name: 'Pectoral Mayor',
    description: 'Músculo principal del pecho, responsable de la aducción y flexión del brazo',
    exercises: ['Press de Banca', 'Flexiones', 'Aperturas con Mancuernas']
  },
  'pectoralis-minor.png': {
    name: 'Pectoral Menor',
    description: 'Músculo profundo que estabiliza la escápula',
    exercises: ['Push-ups', 'Dips', 'Cable Crossovers']
  },
  'latissimus-dorsi.png': {
    name: 'Dorsal Ancho',
    description: 'Músculo más grande de la espalda, responsable de la aducción y extensión del brazo',
    exercises: ['Dominadas', 'Remo con Barra', 'Pulldowns']
  },
  'trapezius.png': {
    name: 'Trapecio',
    description: 'Músculo que controla el movimiento de los hombros y la escápula',
    exercises: ['Encogimientos', 'Remo Alto', 'Face Pulls']
  },
  'quadriceps.png': {
    name: 'Cuádriceps',
    description: 'Grupo muscular frontal del muslo, crucial para la extensión de la rodilla',
    exercises: ['Sentadillas', 'Prensa de Piernas', 'Extensiones de Pierna']
  },
  'hamstrings.png': {
    name: 'Isquiotibiales',
    description: 'Músculos posteriores del muslo, flexionan la rodilla',
    exercises: ['Peso Muerto', 'Curl de Piernas', 'Buenos Días']
  },
  'deltoids.png': {
    name: 'Deltoides',
    description: 'Músculos del hombro que permiten el movimiento del brazo en todas direcciones',
    exercises: ['Press Militar', 'Elevaciones Laterales', 'Face Pulls']
  },
  'biceps.png': {
    name: 'Bíceps',
    description: 'Músculo anterior del brazo, flexiona el codo',
    exercises: ['Curl con Barra', 'Curl con Mancuernas', 'Curl de Martillo']
  },
  'triceps.png': {
    name: 'Tríceps',
    description: 'Músculo posterior del brazo, extiende el codo',
    exercises: ['Extensiones de Tríceps', 'Press Francés', 'Pushdowns']
  },
  'rectus-abdominis.png': {
    name: 'Recto Abdominal',
    description: 'Músculo principal del abdomen, flexiona el tronco',
    exercises: ['Crunches', 'Plancha', 'Elevaciones de Piernas']
  }
};

export const muscleGroups: MuscleGroup[] = [
  {
    id: 'chest',
    name: 'Pecho',
    muscles: ['Pectoral Mayor', 'Pectoral Menor'],
    exercises: 12,
    icon: 'dumbbell',
    color: 'from-red-500 to-orange-500',
    image: '/images/workout/chest-base.png',
    relatedMuscles: ['pectoralis-major.png', 'pectoralis-minor.png']
  },
  {
    id: 'back',
    name: 'Espalda',
    muscles: ['Dorsal Ancho', 'Trapecio'],
    exercises: 15,
    icon: 'activity',
    color: 'from-blue-500 to-cyan-500',
    image: '/images/workout/back-base.png',
    relatedMuscles: ['latissimus-dorsi.png', 'trapezius.png']
  },
  {
    id: 'legs',
    name: 'Piernas',
    muscles: ['Cuádriceps', 'Isquiotibiales'],
    exercises: 10,
    icon: 'flame',
    color: 'from-green-500 to-emerald-500',
    image: '/images/workout/legs-base.png',
    relatedMuscles: ['quadriceps.png', 'hamstrings.png']
  },
  {
    id: 'shoulders',
    name: 'Hombros',
    muscles: ['Deltoides Anterior', 'Deltoides Medio', 'Deltoides Posterior'],
    exercises: 8,
    icon: 'target',
    color: 'from-purple-500 to-pink-500',
    image: '/images/workout/shoulders-base.png',
    relatedMuscles: ['deltoids.png']
  },
  {
    id: 'arms',
    name: 'Brazos',
    muscles: ['Bíceps', 'Tríceps'],
    exercises: 10,
    icon: 'zap',
    color: 'from-yellow-500 to-amber-500',
    image: '/images/workout/arms-base.png',
    relatedMuscles: ['biceps.png', 'triceps.png']
  },
  {
    id: 'abs',
    name: 'Abdominales',
    muscles: ['Recto Abdominal', 'Oblicuos'],
    exercises: 8,
    icon: 'grid',
    color: 'from-indigo-500 to-violet-500',
    image: '/images/workout/abs-base.png',
    relatedMuscles: ['rectus-abdominis.png']
  }
];

export const workoutPrograms: WorkoutProgram[] = [
  {
    id: 'full-body',
    name: 'Full Body Express',
    description: 'Entrenamiento completo para todo el cuerpo en 45 minutos',
    duration: 45,
    difficulty: 'intermediate',
    calories: 450,
    image: '/images/workout/workouts/full-body.png',
    targetMuscles: ['chest', 'back', 'legs'],
    exercises: [
      {
        name: 'Sentadillas',
        sets: 4,
        reps: 12,
        restTime: 60,
        equipment: ['bodyweight'],
        calories: 8,
        instructions: [
          'Pies a la altura de los hombros',
          'Mantén la espalda recta',
          'Baja hasta que los muslos estén paralelos al suelo',
          'Empuja a través de los talones para subir'
        ]
      },
      {
        name: 'Push-ups',
        sets: 3,
        reps: 15,
        restTime: 45,
        equipment: ['bodyweight'],
        calories: 5,
        instructions: [
          'Manos a la altura de los hombros',
          'Mantén el core activado',
          'Baja el pecho cerca del suelo',
          'Empuja para volver a la posición inicial'
        ]
      }
    ]
  },
  {
    id: 'upper-body',
    name: 'Upper Body Power',
    description: 'Rutina intensa para desarrollar fuerza en el tren superior',
    duration: 60,
    difficulty: 'advanced',
    calories: 500,
    image: '/images/workout/workouts/upper-body.png',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms'],
    exercises: [
      {
        name: 'Press de Banca',
        sets: 5,
        reps: 5,
        restTime: 120,
        equipment: ['barbell'],
        calories: 12,
        instructions: [
          'Agarre ligeramente más ancho que los hombros',
          'Mantén los codos a 45 grados',
          'Toca el pecho con la barra',
          'Empuja explosivamente hacia arriba'
        ]
      }
    ]
  }
];