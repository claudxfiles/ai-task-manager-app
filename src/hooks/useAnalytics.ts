import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getUserMetrics,
  getHabitStreakData,
  getFinancialMetrics,
  getGoalsProgress,
  getProductivityByDay,
  getTaskCategoryDistribution,
  AnalyticsTimeframe,
  UserMetrics,
  HabitStreakData,
  FinancialMetrics,
  GoalProgress,
  ProductivityByDay,
  CategoryDistribution
} from '@/lib/analytics';

export function useAnalytics(initialTimeframe: AnalyticsTimeframe = 'month') {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>(initialTimeframe);

  // Consulta para métricas generales del usuario
  const { 
    data: userMetrics, 
    isLoading: isLoadingUserMetrics,
    error: userMetricsError
  } = useQuery<UserMetrics>({
    queryKey: ['userMetrics', timeframe],
    queryFn: () => getUserMetrics(timeframe)
  });

  // Consulta para datos de racha de hábitos
  const { 
    data: habitStreakData, 
    isLoading: isLoadingHabitStreak,
    error: habitStreakError
  } = useQuery<HabitStreakData[]>({
    queryKey: ['habitStreakData'],
    queryFn: getHabitStreakData
  });

  // Consulta para métricas financieras
  const { 
    data: financialMetrics, 
    isLoading: isLoadingFinancialMetrics,
    error: financialMetricsError
  } = useQuery<FinancialMetrics>({
    queryKey: ['financialMetrics', timeframe],
    queryFn: () => getFinancialMetrics(timeframe)
  });

  // Consulta para progreso de metas
  const { 
    data: goalsProgress, 
    isLoading: isLoadingGoalsProgress,
    error: goalsProgressError 
  } = useQuery<GoalProgress[]>({
    queryKey: ['goalsProgress'],
    queryFn: getGoalsProgress
  });

  // Consulta para productividad diaria
  const { 
    data: productivityByDay, 
    isLoading: isLoadingProductivityByDay,
    error: productivityByDayError
  } = useQuery<ProductivityByDay[]>({
    queryKey: ['productivityByDay', timeframe],
    queryFn: () => getProductivityByDay(timeframe)
  });

  // Consulta para distribución de categorías de tareas
  const { 
    data: taskCategoryDistribution, 
    isLoading: isLoadingTaskCategoryDistribution,
    error: taskCategoryDistributionError
  } = useQuery<CategoryDistribution[]>({
    queryKey: ['taskCategoryDistribution', timeframe],
    queryFn: () => getTaskCategoryDistribution(timeframe)
  });

  const isLoading = 
    isLoadingUserMetrics || 
    isLoadingHabitStreak || 
    isLoadingFinancialMetrics || 
    isLoadingGoalsProgress || 
    isLoadingProductivityByDay || 
    isLoadingTaskCategoryDistribution;
  
  const hasErrors = 
    userMetricsError || 
    habitStreakError || 
    financialMetricsError || 
    goalsProgressError || 
    productivityByDayError || 
    taskCategoryDistributionError;

  return {
    // Datos
    userMetrics,
    habitStreakData,
    financialMetrics,
    goalsProgress,
    productivityByDay,
    taskCategoryDistribution,
    
    // Estados
    isLoading,
    hasErrors,
    
    // Funciones
    setTimeframe,
    timeframe
  };
} 