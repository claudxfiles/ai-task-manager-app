import supabase from './supabase';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export type AnalyticsTimeframe = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

export interface UserMetrics {
  tasksCompleted: number;
  tasksCreated: number;
  habitsCompleted: number;
  workoutMinutes: number;
  financialBalance: number;
  goalsProgress: number;
  productivityScore: number;
}

export interface HabitStreakData {
  habitId: string;
  habitTitle: string;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  monthlySavings: number;
  categoryDistribution: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface GoalProgress {
  goalId: string;
  title: string;
  area: string;
  progress: number;
  targetDate: string;
  daysRemaining: number;
  stepsCompleted: number;
  totalSteps: number;
}

export interface ProductivityByDay {
  date: string;
  tasksCompleted: number;
  habitsCompleted: number;
  productivityScore: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

// Función para obtener el rango de fechas según el timeframe
export const getDateRangeFromTimeframe = (timeframe: AnalyticsTimeframe): { startDate: Date, endDate: Date } => {
  const now = new Date();
  let startDate: Date;
  const endDate = now;

  switch (timeframe) {
    case 'week':
      startDate = startOfWeek(now, { locale: es });
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case '3months':
      startDate = subMonths(now, 3);
      break;
    case '6months':
      startDate = subMonths(now, 6);
      break;
    case 'year':
      startDate = subMonths(now, 12);
      break;
    case 'all':
    default:
      startDate = new Date(2020, 0, 1); // Fecha suficientemente antigua para incluir todos los datos
      break;
  }

  return { startDate, endDate };
};

// Obtener métricas generales del usuario
export const getUserMetrics = async (timeframe: AnalyticsTimeframe = 'month'): Promise<UserMetrics> => {
  const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);
  
  try {
    // Obtener tareas completadas en el período
    const { data: completedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    // Obtener tareas creadas en el período
    const { data: createdTasks, error: createdTasksError } = await supabase
      .from('tasks')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Obtener registros de hábitos completados
    const { data: habitLogs, error: habitsError } = await supabase
      .from('habit_logs')
      .select('id')
      .gte('completed_date', startDate.toISOString())
      .lte('completed_date', endDate.toISOString());

    // Obtener minutos de workout
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('duration_minutes')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    // Obtener transacciones financieras
    const { data: finances, error: financesError } = await supabase
      .from('finances')
      .select('type, amount')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    // Obtener progreso de metas
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('progress_percentage')
      .eq('status', 'active');

    // Calcular métricas
    const tasksCompleted = completedTasks?.length || 0;
    const tasksCreated = createdTasks?.length || 0;
    const habitsCompleted = habitLogs?.length || 0;
    
    const workoutMinutes = workouts?.reduce((total, workout) => total + (workout.duration_minutes || 0), 0) || 0;
    
    const totalIncome = finances
      ?.filter(item => item.type === 'income')
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    
    const totalExpenses = finances
      ?.filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    
    const financialBalance = totalIncome - totalExpenses;
    
    const goalsProgress = goals?.length 
      ? goals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0) / goals.length 
      : 0;

    // Calcular una puntuación de productividad simple (esto podría ser más sofisticado)
    const productivityScore = calculateProductivityScore(tasksCompleted, habitsCompleted, workoutMinutes, financialBalance);

    return {
      tasksCompleted,
      tasksCreated,
      habitsCompleted,
      workoutMinutes,
      financialBalance,
      goalsProgress,
      productivityScore
    };
  } catch (error) {
    console.error('Error al obtener métricas del usuario:', error);
    return {
      tasksCompleted: 0,
      tasksCreated: 0,
      habitsCompleted: 0,
      workoutMinutes: 0,
      financialBalance: 0,
      goalsProgress: 0,
      productivityScore: 0
    };
  }
};

// Calcular una puntuación de productividad basada en varias métricas
export const calculateProductivityScore = (
  tasksCompleted: number, 
  habitsCompleted: number, 
  workoutMinutes: number, 
  financialBalance: number
): number => {
  // Ponderaciones para cada métrica (ajustar según la importancia)
  const weights = {
    tasks: 0.4,
    habits: 0.3,
    workout: 0.15,
    finance: 0.15
  };

  // Normalizar cada métrica a una escala de 0-100
  const normalizedTasks = Math.min(tasksCompleted * 10, 100); // 10 tareas = 100%
  const normalizedHabits = Math.min(habitsCompleted * 20, 100); // 5 hábitos = 100%
  const normalizedWorkout = Math.min(workoutMinutes / 60 * 100, 100); // 60 min = 100%
  const normalizedFinance = financialBalance > 0 ? 100 : Math.max(0, 100 + (financialBalance / 1000 * 100)); // +1000 = 100%, -1000 = 0%

  // Calcular puntuación ponderada
  const score = (
    normalizedTasks * weights.tasks +
    normalizedHabits * weights.habits +
    normalizedWorkout * weights.workout +
    normalizedFinance * weights.finance
  );

  return Math.round(score);
};

// Obtener datos de streak de hábitos
export const getHabitStreakData = async (): Promise<HabitStreakData[]> => {
  try {
    const { data: habits, error } = await supabase
      .from('habits')
      .select('id, title, current_streak, best_streak');

    if (error) throw error;

    // Para cada hábito, calculamos la tasa de finalización (requiere cálculos adicionales)
    const streakData: HabitStreakData[] = [];
    for (const habit of habits || []) {
      // Obtenemos los registros de los últimos 30 días para calcular la tasa de finalización
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('completed_date')
        .eq('habit_id', habit.id)
        .gte('completed_date', thirtyDaysAgo.toISOString());
      
      if (logsError) throw logsError;
      
      // Calcular tasa de finalización (días completados / 30 días)
      const completionRate = ((logs?.length || 0) / 30) * 100;
      
      streakData.push({
        habitId: habit.id,
        habitTitle: habit.title,
        currentStreak: habit.current_streak || 0,
        bestStreak: habit.best_streak || 0,
        completionRate: Math.round(completionRate)
      });
    }

    return streakData;
  } catch (error) {
    console.error('Error al obtener datos de streak de hábitos:', error);
    return [];
  }
};

// Obtener métricas financieras
export const getFinancialMetrics = async (timeframe: AnalyticsTimeframe = 'month'): Promise<FinancialMetrics> => {
  const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);
  
  try {
    const { data: finances, error } = await supabase
      .from('finances')
      .select('type, amount, category')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (error) throw error;

    // Calcular ingresos y gastos totales
    const totalIncome = finances
      ?.filter(item => item.type === 'income')
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    
    const totalExpenses = finances
      ?.filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    
    // Calcular distribución por categoría (solo para gastos)
    const expensesByCategory: Record<string, number> = {};
    finances
      ?.filter(item => item.type === 'expense')
      .forEach(item => {
        const category = item.category || 'Sin categoría';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (item.amount || 0);
      });
    
    const categoryDistribution = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }));
    
    // Calcular tasa de ahorro y ahorro mensual
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const monthlySavings = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      savingsRate,
      monthlySavings,
      categoryDistribution
    };
  } catch (error) {
    console.error('Error al obtener métricas financieras:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      savingsRate: 0,
      monthlySavings: 0,
      categoryDistribution: []
    };
  }
};

// Obtener progreso de metas
export const getGoalsProgress = async (): Promise<GoalProgress[]> => {
  try {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('id, title, area, progress_percentage, target_date')
      .eq('status', 'active');

    if (error) throw error;

    // Para cada meta, obtenemos los pasos completados y totales
    const goalsProgress: GoalProgress[] = [];
    for (const goal of goals || []) {
      const { data: steps, error: stepsError } = await supabase
        .from('goal_steps')
        .select('status')
        .eq('goal_id', goal.id);
      
      if (stepsError) throw stepsError;
      
      const stepsCompleted = steps?.filter(step => step.status === 'completed').length || 0;
      const totalSteps = steps?.length || 0;
      
      // Calcular días restantes hasta la fecha objetivo
      const targetDate = goal.target_date ? parseISO(goal.target_date) : new Date();
      const today = new Date();
      const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      
      goalsProgress.push({
        goalId: goal.id,
        title: goal.title,
        area: goal.area,
        progress: goal.progress_percentage || 0,
        targetDate: goal.target_date,
        daysRemaining,
        stepsCompleted,
        totalSteps
      });
    }

    return goalsProgress;
  } catch (error) {
    console.error('Error al obtener progreso de metas:', error);
    return [];
  }
};

// Obtener datos de productividad por día
export const getProductivityByDay = async (timeframe: AnalyticsTimeframe = 'month'): Promise<ProductivityByDay[]> => {
  const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);
  
  try {
    // Obtener tareas completadas por día
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('status, updated_at')
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    // Obtener hábitos completados por día
    const { data: habitLogs, error: habitsError } = await supabase
      .from('habit_logs')
      .select('completed_date')
      .gte('completed_date', startDate.toISOString())
      .lte('completed_date', endDate.toISOString());

    if (tasksError || habitsError) throw tasksError || habitsError;

    // Agrupar por día
    const tasksByDay: Record<string, number> = {};
    const habitsByDay: Record<string, number> = {};
    
    // Procesar tareas
    tasks?.forEach(task => {
      const day = format(parseISO(task.updated_at), 'yyyy-MM-dd');
      tasksByDay[day] = (tasksByDay[day] || 0) + 1;
    });
    
    // Procesar hábitos
    habitLogs?.forEach(log => {
      const day = format(parseISO(log.completed_date), 'yyyy-MM-dd');
      habitsByDay[day] = (habitsByDay[day] || 0) + 1;
    });
    
    // Generar array de fechas para el período
    const productivityData: ProductivityByDay[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const tasksCompleted = tasksByDay[dateStr] || 0;
      const habitsCompleted = habitsByDay[dateStr] || 0;
      
      // Calcular score simplificado para el día
      const dailyScore = calculateProductivityScore(tasksCompleted, habitsCompleted, 0, 0);
      
      productivityData.push({
        date: dateStr,
        tasksCompleted,
        habitsCompleted,
        productivityScore: dailyScore
      });
      
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return productivityData;
  } catch (error) {
    console.error('Error al obtener datos de productividad por día:', error);
    return [];
  }
};

// Obtener distribución por categoría de tareas
export const getTaskCategoryDistribution = async (timeframe: AnalyticsTimeframe = 'month'): Promise<CategoryDistribution[]> => {
  const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);
  
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('category')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Contar por categoría
    const categoryCounts: Record<string, number> = {};
    
    tasks?.forEach(task => {
      const category = task.category || 'Sin categoría';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Calcular total y porcentajes
    const totalTasks = tasks?.length || 0;
    
    const distribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0
    }));

    return distribution;
  } catch (error) {
    console.error('Error al obtener distribución por categoría:', error);
    return [];
  }
}; 