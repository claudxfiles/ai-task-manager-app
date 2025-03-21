import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinanceSummary,
  getFinancialGoals,
  createFinancialGoal,
  updateFinancialGoalProgress,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  Transaction,
  FinancialGoal,
  Subscription,
  FinanceSummary,
  TransactionCategory,
  TransactionType,
  SavedSearchFilter
} from '@/lib/finance';

// Este hook asume que tienes acceso al userId desde algún contexto de autenticación
interface UseFinanceProps {
  userId: string;
  initialPeriod?: 'month' | 'year';
}

export function useFinance({ userId, initialPeriod = 'month' }: UseFinanceProps) {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<'month' | 'year'>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [isDeletingSubscription, setIsDeletingSubscription] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isUpdatingGoalProgress, setIsUpdatingGoalProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configurar fechas para filtrar transacciones
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];
  
  const startDate = period === 'month' ? startOfMonth : startOfYear;
  
  // Consulta para obtener transacciones
  const transactionsQuery = useQuery({
    queryKey: ['transactions', userId, startDate, today],
    queryFn: () => getTransactions(userId, startDate, today),
    staleTime: 300000, // 5 minutos
  });
  
  // Consulta para obtener el resumen financiero
  const summaryQuery = useQuery({
    queryKey: ['financeSummary', userId, period],
    queryFn: () => getFinanceSummary(userId, period),
    staleTime: 300000, // 5 minutos
  });
  
  // Consulta para obtener metas financieras
  const goalsQuery = useQuery({
    queryKey: ['financialGoals', userId],
    queryFn: () => getFinancialGoals(userId),
    staleTime: 300000, // 5 minutos
  });
  
  // Consulta para obtener suscripciones
  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: () => getSubscriptions(userId),
    staleTime: 300000, // 5 minutos
  });
  
  // Mutación para crear transacción
  const createTransactionMutation = useMutation({
    mutationFn: (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => 
      createTransaction(newTransaction),
    onSuccess: () => {
      // Invalidar consultas relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
    },
  });
  
  // Mutación para actualizar transacción
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Transaction> }) => 
      updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
    },
  });
  
  // Mutación para eliminar transacción
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
    },
  });
  
  // Mutación para crear meta financiera
  const createFinancialGoalMutation = useMutation({
    mutationFn: (newGoal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>) => 
      createFinancialGoal(newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals'] });
    },
  });
  
  // Mutación para actualizar progreso de meta
  const updateGoalProgressMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string, amount: number }) => 
      updateFinancialGoalProgress(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals'] });
    },
  });
  
  // Mutación para crear suscripción
  const createSubscriptionMutation = useMutation({
    mutationFn: (newSubscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => 
      createSubscription(newSubscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
    },
  });
  
  // Mutación para actualizar suscripción
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Subscription> }) => 
      updateSubscription(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
    },
  });
  
  // Mutación para eliminar suscripción
  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id: string) => deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
    },
  });
  
  // Función para cambiar el período del resumen
  const changePeriod = (newPeriod: 'month' | 'year') => {
    setPeriod(newPeriod);
  };
  
  // Simular datos financieros del usuario
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedSearchFilter[]>([]);

  // Transacciones
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    setIsAddingTransaction(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTransaction: Transaction = {
        id: `trans_${Date.now()}`,
        user_id: userId,
        amount: transaction.amount,
        currency: transaction.currency || 'EUR',
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
        date: transaction.date,
        created_at: new Date().toISOString(),
        notes: transaction.notes || '',
        tags: transaction.tags || [],
        attachments: transaction.attachments || [],
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError('Error al añadir la transacción');
      throw err;
    } finally {
      setIsAddingTransaction(false);
    }
  }, [userId]);

  const updateTransaction = useCallback(async (transaction: Partial<Transaction> & { id: string }) => {
    setIsUpdatingTransaction(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTransactions(prev => 
        prev.map(item => 
          item.id === transaction.id ? { ...item, ...transaction } : item
        )
      );
      
      return transaction;
    } catch (err) {
      setError('Error al actualizar la transacción');
      throw err;
    } finally {
      setIsUpdatingTransaction(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setIsDeletingTransaction(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTransactions(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError('Error al eliminar la transacción');
      throw err;
    } finally {
      setIsDeletingTransaction(false);
    }
  }, []);

  // Suscripciones
  const addSubscription = useCallback(async (subscription: Omit<Subscription, 'id' | 'created_at'>) => {
    setIsAddingSubscription(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        user_id: userId,
        service_name: subscription.service_name,
        amount: subscription.amount,
        currency: subscription.currency || 'EUR',
        billing_cycle: subscription.billing_cycle,
        next_billing_date: subscription.next_billing_date,
        category: subscription.category,
        created_at: new Date().toISOString(),
        reminder_days: subscription.reminder_days || 7,
        notes: subscription.notes || '',
        status: 'active',
      };
      
      setSubscriptions(prev => [newSubscription, ...prev]);
      return newSubscription;
    } catch (err) {
      setError('Error al añadir la suscripción');
      throw err;
    } finally {
      setIsAddingSubscription(false);
    }
  }, [userId]);

  const updateSubscription = useCallback(async (subscription: Partial<Subscription> & { id: string }) => {
    setIsUpdatingSubscription(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubscriptions(prev => 
        prev.map(item => 
          item.id === subscription.id ? { ...item, ...subscription } : item
        )
      );
      
      return subscription;
    } catch (err) {
      setError('Error al actualizar la suscripción');
      throw err;
    } finally {
      setIsUpdatingSubscription(false);
    }
  }, []);

  const deleteSubscription = useCallback(async (id: string) => {
    setIsDeletingSubscription(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubscriptions(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError('Error al eliminar la suscripción');
      throw err;
    } finally {
      setIsDeletingSubscription(false);
    }
  }, []);

  // Metas financieras
  const addFinancialGoal = useCallback(async (goal: Omit<FinancialGoal, 'id' | 'created_at'>) => {
    setIsAddingGoal(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newGoal: FinancialGoal = {
        id: `goal_${Date.now()}`,
        user_id: userId,
        title: goal.title,
        description: goal.description || '',
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        type: goal.type || 'savings',
        target_date: goal.target_date,
        created_at: new Date().toISOString(),
        status: goal.status || 'active',
      };
      
      setFinancialGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      setError('Error al añadir la meta financiera');
      throw err;
    } finally {
      setIsAddingGoal(false);
    }
  }, [userId]);

  const updateGoalProgress = useCallback(async ({ id, amount }: { id: string; amount: number }) => {
    setIsUpdatingGoalProgress(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFinancialGoals(prev => 
        prev.map(goal => 
          goal.id === id 
            ? { 
                ...goal, 
                current_amount: amount,
                status: amount >= goal.target_amount ? 'completed' : 'active'
              } 
            : goal
        )
      );
      
      return true;
    } catch (err) {
      setError('Error al actualizar el progreso de la meta');
      throw err;
    } finally {
      setIsUpdatingGoalProgress(false);
    }
  }, []);

  // Filtros guardados
  const saveSearchFilter = useCallback(async (filter: Omit<SavedSearchFilter, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newFilter: SavedSearchFilter = {
        id: `filter_${Date.now()}`,
        user_id: userId,
        name: filter.name,
        filter_data: filter.filter_data,
        created_at: new Date().toISOString(),
      };
      
      setSavedFilters(prev => [newFilter, ...prev]);
      return newFilter;
    } catch (err) {
      setError('Error al guardar el filtro');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const deleteFilter = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular petición API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSavedFilters(prev => prev.filter(filter => filter.id !== id));
      return true;
    } catch (err) {
      setError('Error al eliminar el filtro');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cálculos financieros
  const calculateSavingsProjection = useCallback(
    (initialAmount: number, monthlyContribution: number, interestRate: number, years: number) => {
      const monthlyRate = interestRate / 100 / 12;
      const months = years * 12;
      const projections = [];

      let balance = initialAmount;
      
      for (let i = 1; i <= months; i++) {
        // Añadir aportación mensual
        balance += monthlyContribution;
        
        // Añadir interés
        balance *= (1 + monthlyRate);
        
        // Añadir a las proyecciones en cada año completo
        if (i % 12 === 0) {
          projections.push({
            year: i / 12,
            balance: Math.round(balance * 100) / 100,
          });
        }
      }

      return projections;
    },
    []
  );

  const calculateTimeToGoal = useCallback(
    (initialAmount: number, monthlyContribution: number, interestRate: number, targetAmount: number) => {
      const monthlyRate = interestRate / 100 / 12;
      let months = 0;
      let balance = initialAmount;
      const maxMonths = 1200; // Límite de 100 años
      
      while (balance < targetAmount && months < maxMonths) {
        // Añadir aportación mensual
        balance += monthlyContribution;
        
        // Añadir interés
        balance *= (1 + monthlyRate);
        
        months++;
      }
      
      return months < maxMonths ? months : null;
    },
    []
  );

  const calculateRequiredContribution = useCallback(
    (initialAmount: number, interestRate: number, targetAmount: number, months: number) => {
      const monthlyRate = interestRate / 100 / 12;
      
      if (months <= 0) return 0;
      
      // Si el interés es 0, es un cálculo simple
      if (interestRate === 0) {
        return (targetAmount - initialAmount) / months;
      }
      
      // Fórmula para calcular la contribución mensual necesaria
      // PMT = (FV - PV * (1 + r)^n) / (((1 + r)^n - 1) / r)
      const futureValue = targetAmount;
      const presentValue = initialAmount;
      
      const factor1 = Math.pow(1 + monthlyRate, months);
      const factor2 = (factor1 - 1) / monthlyRate;
      
      const requiredContribution = (futureValue - presentValue * factor1) / factor2;
      
      return Math.round(requiredContribution * 100) / 100;
    },
    []
  );

  return {
    // Datos de consultas
    transactions: transactionsQuery.data || [],
    isLoadingTransactions: transactionsQuery.isLoading,
    
    summary: summaryQuery.data || {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      periodSavings: 0,
      subscriptionTotal: 0,
      currency: 'USD'
    },
    isLoadingSummary: summaryQuery.isLoading,
    
    goals: goalsQuery.data || [],
    isLoadingGoals: goalsQuery.isLoading,
    
    subscriptions: subscriptionsQuery.data || [],
    isLoadingSubscriptions: subscriptionsQuery.isLoading,
    
    // Estado general
    period,
    changePeriod,
    isLoading,
    
    // Estado de mutación
    isAddingTransaction,
    isUpdatingTransaction,
    isDeletingTransaction,
    isAddingSubscription,
    isUpdatingSubscription,
    isDeletingSubscription,
    isAddingGoal,
    isUpdatingGoalProgress,
    error,
    
    // Datos
    transactions,
    subscriptions,
    financialGoals,
    savedFilters,
    
    // Funciones de mutación
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    addSubscription,
    updateSubscription,
    deleteSubscription,
    
    addFinancialGoal,
    updateGoalProgress,
    
    saveSearchFilter,
    deleteFilter,
    
    // Cálculos financieros
    calculateSavingsProjection,
    calculateTimeToGoal,
    calculateRequiredContribution,
  };
} 