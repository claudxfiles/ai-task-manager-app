import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { 
  Workout, 
  WorkoutExercise, 
  WorkoutFilters, 
  WorkoutWithExercises,
  WorkoutInsert,
  WorkoutExerciseInsert,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
  ExerciseTemplate,
  ExerciseTemplateFilters,
  WorkoutStatistics,
  WorkoutProgress,
  WorkoutProgressData
} from '@/types/workout';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Inicializar cliente Supabase para componentes
const supabase = createClientComponentClient<Database>();

// Función para obtener todos los workouts de un usuario
export async function getUserWorkouts(
  userId: string,
  filters?: WorkoutFilters
): Promise<Workout[]> {
  let query = supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  // Aplicar filtros si existen
  if (filters) {
    if (filters.dateFrom) {
      query = query.gte('date', format(filters.dateFrom, 'yyyy-MM-dd'));
    }
    if (filters.dateTo) {
      query = query.lte('date', format(filters.dateTo, 'yyyy-MM-dd'));
    }
    if (filters.workoutType) {
      query = query.eq('workout_type', filters.workoutType);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }

  return data;
}

// Función para obtener un workout específico con sus ejercicios
export async function getWorkoutWithExercises(
  workoutId: string
): Promise<WorkoutWithExercises | null> {
  // Obtener el workout
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single();

  if (workoutError) {
    console.error('Error fetching workout:', workoutError);
    throw workoutError;
  }

  if (!workout) {
    return null;
  }

  // Obtener los ejercicios asociados a este workout
  const { data: exercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('order_index', { ascending: true });

  if (exercisesError) {
    console.error('Error fetching workout exercises:', exercisesError);
    throw exercisesError;
  }

  return {
    ...workout,
    exercises: exercises || []
  };
}

// Función para crear un nuevo workout
export async function createWorkout(
  workout: WorkoutInsert,
  exercises: WorkoutExerciseInsert[]
): Promise<WorkoutWithExercises> {
  // Iniciar una transacción
  const { data: createdWorkout, error: workoutError } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single();

  if (workoutError) {
    console.error('Error creating workout:', workoutError);
    throw workoutError;
  }

  if (!createdWorkout) {
    throw new Error('Error creating workout: No data returned');
  }

  // Añadir el ID del workout a cada ejercicio
  const exercisesWithWorkoutId = exercises.map((exercise, index) => ({
    ...exercise,
    workout_id: createdWorkout.id,
    order_index: index
  }));

  // Insertar ejercicios
  const { data: createdExercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .insert(exercisesWithWorkoutId)
    .select();

  if (exercisesError) {
    // En caso de error, intentar eliminar el workout creado para mantener consistencia
    await supabase.from('workouts').delete().eq('id', createdWorkout.id);
    console.error('Error creating workout exercises:', exercisesError);
    throw exercisesError;
  }

  // Actualizar el progreso del usuario para cada ejercicio
  await updateUserProgress(workout.user_id, createdExercises || []);

  return {
    ...createdWorkout,
    exercises: createdExercises || []
  };
}

// Función para actualizar un workout existente
export async function updateWorkout(
  workoutId: string,
  workout: Partial<Workout>,
  exercises: WorkoutExerciseInsert[]
): Promise<void> {
  // Actualizar el workout
  const { error: workoutError } = await supabase
    .from('workouts')
    .update(workout)
    .eq('id', workoutId);

  if (workoutError) {
    console.error('Error updating workout:', workoutError);
    throw workoutError;
  }

  // Eliminar los ejercicios existentes
  const { error: deleteError } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('workout_id', workoutId);

  if (deleteError) {
    console.error('Error deleting existing exercises:', deleteError);
    throw deleteError;
  }

  // Añadir el ID del workout a cada ejercicio
  const exercisesWithWorkoutId = exercises.map((exercise, index) => ({
    ...exercise,
    workout_id: workoutId,
    order_index: index
  }));

  // Insertar los nuevos ejercicios
  const { data: createdExercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .insert(exercisesWithWorkoutId)
    .select();

  if (exercisesError) {
    console.error('Error updating workout exercises:', exercisesError);
    throw exercisesError;
  }

  // Obtener el user_id del workout
  const { data: workoutData } = await supabase
    .from('workouts')
    .select('user_id')
    .eq('id', workoutId)
    .single();

  if (workoutData) {
    // Actualizar el progreso del usuario para cada ejercicio
    await updateUserProgress(workoutData.user_id, createdExercises || []);
  }
}

// Función para eliminar un workout
export async function deleteWorkout(workoutId: string): Promise<void> {
  // Eliminar los ejercicios primero (por restricciones de clave foránea)
  const { error: exercisesError } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('workout_id', workoutId);

  if (exercisesError) {
    console.error('Error deleting workout exercises:', exercisesError);
    throw exercisesError;
  }

  // Eliminar el workout
  const { error: workoutError } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);

  if (workoutError) {
    console.error('Error deleting workout:', workoutError);
    throw workoutError;
  }
}

// Función para obtener plantillas de ejercicios
export async function getExerciseTemplates(
  filters?: ExerciseTemplateFilters
): Promise<ExerciseTemplate[]> {
  let query = supabase
    .from('exercise_templates')
    .select('*')
    .order('name');

  // Aplicar filtros si existen
  if (filters) {
    if (filters.muscleGroup) {
      query = query.eq('muscle_group', filters.muscleGroup);
    }
    if (filters.exerciseType) {
      query = query.eq('exercise_type', filters.exerciseType);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching exercise templates:', error);
    throw error;
  }

  return data;
}

// Función para obtener plantillas de workout
export async function getWorkoutTemplates(
  userId: string,
  includePublic: boolean = true
): Promise<WorkoutTemplate[]> {
  let query = supabase
    .from('workout_templates')
    .select('*');

  if (includePublic) {
    query = query.or(`user_id.eq.${userId},is_public.eq.true`);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching workout templates:', error);
    throw error;
  }

  return data;
}

// Función para obtener una plantilla de workout con sus ejercicios
export async function getWorkoutTemplateWithExercises(
  templateId: string
): Promise<WorkoutTemplateWithExercises | null> {
  // Obtener la plantilla
  const { data: template, error: templateError } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) {
    console.error('Error fetching workout template:', templateError);
    throw templateError;
  }

  if (!template) {
    return null;
  }

  // Obtener los ejercicios asociados a esta plantilla
  const { data: exercises, error: exercisesError } = await supabase
    .from('workout_template_exercises')
    .select('*')
    .eq('template_id', templateId)
    .order('order_index', { ascending: true });

  if (exercisesError) {
    console.error('Error fetching template exercises:', exercisesError);
    throw exercisesError;
  }

  return {
    ...template,
    exercises: exercises || []
  };
}

// Función para crear un workout a partir de una plantilla
export async function createWorkoutFromTemplate(
  userId: string,
  templateId: string,
  date: Date
): Promise<string> {
  // Obtener la plantilla con sus ejercicios
  const template = await getWorkoutTemplateWithExercises(templateId);
  
  if (!template) {
    throw new Error('Template not found');
  }

  // Crear el nuevo workout
  const newWorkout: WorkoutInsert = {
    user_id: userId,
    name: template.name,
    date: format(date, 'yyyy-MM-dd'),
    workout_type: template.workout_type,
    duration_minutes: template.estimated_duration,
    notes: `Created from template: ${template.name}`
  };

  // Primero crear el workout para obtener su ID
  const { data: createdWorkout, error: workoutError } = await supabase
    .from('workouts')
    .insert(newWorkout)
    .select()
    .single();

  if (workoutError || !createdWorkout) {
    console.error('Error creating workout from template:', workoutError);
    throw workoutError || new Error('No data returned');
  }

  // Crear los ejercicios para el nuevo workout con el ID del workout
  const exercises: WorkoutExerciseInsert[] = template.exercises.map((exercise, index) => ({
    workout_id: createdWorkout.id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    duration_seconds: exercise.duration_seconds,
    distance: exercise.distance,
    units: exercise.units,
    notes: exercise.notes,
    order_index: index
  }));

  // Insertar los ejercicios
  const { error: exercisesError } = await supabase
    .from('workout_exercises')
    .insert(exercises);

  if (exercisesError) {
    // En caso de error, eliminar el workout creado
    await supabase.from('workouts').delete().eq('id', createdWorkout.id);
    console.error('Error creating exercises for template workout:', exercisesError);
    throw exercisesError;
  }
  
  return createdWorkout.id;
}

// Función para obtener estadísticas de workout
export async function getWorkoutStatistics(
  userId: string
): Promise<WorkoutStatistics> {
  // Obtener todos los workouts del usuario
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching workouts for statistics:', error);
    throw error;
  }

  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      totalExercises: 0,
      favoriteWorkoutType: 'N/A',
      workoutsByType: {},
      workoutsByMonth: {},
      averageDuration: 0,
      streakDays: 0
    };
  }

  // Calcular número total de workouts
  const totalWorkouts = workouts.length;

  // Calcular duración total
  const totalDuration = workouts.reduce((sum, workout) => 
    sum + (workout.duration_minutes || 0), 0);

  // Calcular duración promedio
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

  // Workouts por tipo
  const workoutsByType: Record<string, number> = {};
  workouts.forEach(workout => {
    const type = workout.workout_type || 'unknown';
    workoutsByType[type] = (workoutsByType[type] || 0) + 1;
  });

  // Encontrar el tipo de workout favorito
  let favoriteWorkoutType = 'N/A';
  let maxCount = 0;
  Object.entries(workoutsByType).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteWorkoutType = type;
    }
  });

  // Workouts por mes
  const workoutsByMonth: Record<string, number> = {};
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const month = format(date, 'MMM yyyy');
    workoutsByMonth[month] = (workoutsByMonth[month] || 0) + 1;
  });

  // Obtener el número total de ejercicios
  const { count: totalExercises, error: countError } = await supabase
    .from('workout_exercises')
    .select('*', { count: 'exact', head: true })
    .in('workout_id', workouts.map(w => w.id));

  if (countError) {
    console.error('Error counting exercises:', countError);
    throw countError;
  }

  // Calcular la racha actual de entrenamientos
  let streakDays = 0;
  // Implementación simple de racha - se puede mejorar para detectar días consecutivos
  
  return {
    totalWorkouts,
    totalDuration,
    totalExercises: totalExercises || 0,
    favoriteWorkoutType,
    workoutsByType,
    workoutsByMonth,
    averageDuration,
    streakDays
  };
}

// Función para actualizar el progreso del usuario para ejercicios
async function updateUserProgress(
  userId: string,
  exercises: WorkoutExercise[]
): Promise<void> {
  for (const exercise of exercises) {
    // Buscar si ya existe un registro de progreso para este ejercicio
    const { data: progressData, error: progressError } = await supabase
      .from('workout_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_name', exercise.name)
      .single();

    if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = No data found
      console.error('Error fetching progress:', progressError);
      continue;
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    if (!progressData) {
      // Crear un nuevo registro de progreso
      await supabase.from('workout_progress').insert({
        user_id: userId,
        exercise_name: exercise.name,
        max_weight: exercise.weight,
        max_reps: exercise.reps,
        max_duration: exercise.duration_seconds,
        max_distance: exercise.distance,
        start_date: today,
        last_updated: today
      });
    } else {
      // Actualizar el registro de progreso si los nuevos valores son mayores
      const updates: Partial<WorkoutProgress> = {
        last_updated: today
      };

      if (exercise.weight && (!progressData.max_weight || exercise.weight > progressData.max_weight)) {
        updates.max_weight = exercise.weight;
      }

      if (exercise.reps && (!progressData.max_reps || exercise.reps > progressData.max_reps)) {
        updates.max_reps = exercise.reps;
      }

      if (exercise.duration_seconds && (!progressData.max_duration || exercise.duration_seconds > progressData.max_duration)) {
        updates.max_duration = exercise.duration_seconds;
      }

      if (exercise.distance && (!progressData.max_distance || exercise.distance > progressData.max_distance)) {
        updates.max_distance = exercise.distance;
      }

      // Solo actualizar si hay cambios
      if (Object.keys(updates).length > 1) { // > 1 porque last_updated siempre está
        await supabase
          .from('workout_progress')
          .update(updates)
          .eq('id', progressData.id);
      }
    }
  }
}

// Función para obtener datos de progreso para un ejercicio específico
export async function getExerciseProgressData(
  userId: string,
  exerciseName: string,
  metric: 'weight' | 'reps' | 'duration' | 'distance'
): Promise<WorkoutProgressData> {
  // Determinar qué campo buscar basado en la métrica
  let metricField = '';
  switch (metric) {
    case 'weight':
      metricField = 'weight';
      break;
    case 'reps':
      metricField = 'reps';
      break;
    case 'duration':
      metricField = 'duration_seconds';
      break;
    case 'distance':
      metricField = 'distance';
      break;
  }

  // Obtener los workouts del usuario
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id, date')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (workoutsError) {
    console.error('Error fetching workouts for progress:', workoutsError);
    throw workoutsError;
  }

  if (!workouts || workouts.length === 0) {
    return {
      exerciseName,
      dates: [],
      values: [],
      metric
    };
  }

  // Obtener los ejercicios que coinciden con el nombre
  const { data: exercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .select(`workout_id, ${metricField}`)
    .eq('name', exerciseName)
    .in('workout_id', workouts.map(w => w.id));

  if (exercisesError) {
    console.error('Error fetching exercises for progress:', exercisesError);
    throw exercisesError;
  }

  if (!exercises || exercises.length === 0) {
    return {
      exerciseName,
      dates: [],
      values: [],
      metric
    };
  }

  // Mapear los workouts con sus fechas
  const workoutMap = new Map(workouts.map(w => [w.id, w.date]));
  
  // Construir los arrays de datos
  const dates: string[] = [];
  const values: number[] = [];

  // Convertir el tipo de ejercicios para trabajar con ellos de manera segura
  type ExerciseWithMetric = { workout_id: string; [key: string]: any };
  const typedExercises = exercises as unknown as ExerciseWithMetric[];

  typedExercises.forEach(exercise => {
    const date = workoutMap.get(exercise.workout_id);
    const value = exercise[metricField];
    
    if (date && typeof value === 'number') {
      dates.push(date);
      values.push(value);
    }
  });

  return {
    exerciseName,
    dates,
    values,
    metric
  };
}

// Función para obtener ejercicios recientes (para sugerencias)
export async function getRecentExercises(
  userId: string,
  limit: number = 10
): Promise<string[]> {
  // Obtener los workouts más recientes
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(5);

  if (workoutsError) {
    console.error('Error fetching recent workouts:', workoutsError);
    throw workoutsError;
  }

  if (!workouts || workouts.length === 0) {
    return [];
  }

  // Obtener ejercicios únicos de esos workouts
  const { data: exercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .select('name')
    .in('workout_id', workouts.map(w => w.id));

  if (exercisesError) {
    console.error('Error fetching recent exercises:', exercisesError);
    throw exercisesError;
  }

  if (!exercises || exercises.length === 0) {
    return [];
  }

  // Eliminar duplicados y limitar al número especificado
  const uniqueExercises = Array.from(new Set(exercises.map(e => e.name)));
  return uniqueExercises.slice(0, limit);
} 