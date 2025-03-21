import { createClient } from '@supabase/supabase-js';

// Enumeraciones para tipos de transacciones y categorías
export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategory = 
  // Categorías de ingresos
  | 'salary'
  | 'interest'
  | 'bonus'
  | 'gift'
  | 'investment_return'
  | 'other_income'
  // Categorías de gastos
  | 'groceries'
  | 'dining'
  | 'rent'
  | 'utilities'
  | 'transportation'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'education'
  | 'travel'
  | 'subscriptions'
  | 'other_expense'
  // Categorías de transferencias
  | 'account_transfer'
  | 'investment'
  | 'savings'
  | 'withdrawal'
  | 'debt_payment';

// Tipos de metas financieras
export type FinancialGoalType = 'savings' | 'debt_payoff' | 'purchase';

// Estado de una meta financiera
export type FinancialGoalStatus = 'active' | 'completed' | 'cancelled';

// Ciclos de facturación de suscripciones
export type BillingCycle = 'monthly' | 'quarterly' | 'biannual' | 'annual';

// Estado de una suscripción
export type SubscriptionStatus = 'active' | 'cancelled' | 'pending';

// Tipos para el módulo de finanzas
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  date: string; // ISO format date string
  created_at: string; // ISO format date-time string
  notes?: string;
  tags?: string[];
  attachments?: string[]; // URLs to attachment files
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  type: FinancialGoalType;
  target_date: string; // ISO format date string
  created_at: string; // ISO format date-time string
  status: FinancialGoalStatus;
}

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string; // ISO format date string
  category: string;
  created_at: string; // ISO format date-time string
  reminder_days: number; // días antes de recordar la renovación
  notes?: string;
  status: SubscriptionStatus;
}

export interface SavedSearchFilter {
  id: string;
  user_id: string;
  name: string;
  filter_data: {
    search_term?: string;
    categories?: TransactionCategory[];
    types?: TransactionType[];
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
    tags?: string[];
  };
  created_at: string; // ISO format date-time string
}

export interface FinanceSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  period_start: string; // ISO format date string
  period_end: string; // ISO format date string
  by_category: {
    category: TransactionCategory;
    amount: number;
    percentage: number;
  }[];
}

// Inicialización del cliente Supabase
// Nota: Se debe usar el cliente desde un hook personalizado en producción
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Obtiene todas las transacciones para un usuario
 */
export async function getTransactions(userId: string, startDate?: string, endDate?: string) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('finances')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener transacciones:', error);
    throw new Error('No se pudieron cargar las transacciones');
  }

  return data as Transaction[];
}

/**
 * Crea una nueva transacción
 */
export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('finances')
    .insert([transaction])
    .select();

  if (error) {
    console.error('Error al crear transacción:', error);
    throw new Error('No se pudo crear la transacción');
  }

  return data[0] as Transaction;
}

/**
 * Actualiza una transacción existente
 */
export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('finances')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error al actualizar transacción:', error);
    throw new Error('No se pudo actualizar la transacción');
  }

  return data[0] as Transaction;
}

/**
 * Elimina una transacción
 */
export async function deleteTransaction(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('finances')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar transacción:', error);
    throw new Error('No se pudo eliminar la transacción');
  }

  return true;
}

/**
 * Obtiene el resumen financiero de un usuario
 */
export async function getFinanceSummary(userId: string, period: 'month' | 'year' = 'month'): Promise<FinanceSummary> {
  const supabase = getSupabaseClient();
  const now = new Date();
  
  // Definir el rango de fechas para el período
  let startDate;
  if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
  }
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = now.toISOString().split('T')[0];

  // Obtener transacciones del período
  const { data: transactions, error } = await supabase
    .from('finances')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDateStr);

  if (error) {
    console.error('Error al obtener resumen financiero:', error);
    throw new Error('No se pudo obtener el resumen financiero');
  }

  // Obtener suscripciones activas
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions_tracker')
    .select('*')
    .eq('user_id', userId);

  if (subscriptionsError) {
    console.error('Error al obtener suscripciones:', subscriptionsError);
    throw new Error('No se pudieron obtener las suscripciones');
  }

  // Calcular totales
  const totalIncome = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const totalExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const subscriptionTotal = subscriptions
    ?.reduce((sum, s) => {
      // Normalizar montos mensuales
      if (s.billing_cycle === 'yearly') {
        return sum + (s.amount / 12);
      } else if (s.billing_cycle === 'quarterly') {
        return sum + (s.amount / 3);
      } else if (s.billing_cycle === 'weekly') {
        return sum + (s.amount * 4.33); // Promedio de semanas en un mes
      }
      return sum + s.amount;
    }, 0) || 0;

  const netBalance = totalIncome - totalExpenses;
  const periodSavings = netBalance;
  
  // Por simplicidad, asumimos una sola moneda
  const currency = transactions?.length > 0 ? transactions[0].currency : 'USD';

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    periodSavings,
    subscriptionTotal,
    currency
  };
}

/**
 * Obtiene las metas financieras de un usuario
 */
export async function getFinancialGoals(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('finance_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener metas financieras:', error);
    throw new Error('No se pudieron cargar las metas financieras');
  }

  return data as FinancialGoal[];
}

/**
 * Crea una nueva meta financiera
 */
export async function createFinancialGoal(goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('finance_goals')
    .insert([goal])
    .select();

  if (error) {
    console.error('Error al crear meta financiera:', error);
    throw new Error('No se pudo crear la meta financiera');
  }

  return data[0] as FinancialGoal;
}

/**
 * Actualiza el progreso de una meta financiera
 */
export async function updateFinancialGoalProgress(id: string, currentAmount: number) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('finance_goals')
    .update({ current_amount: currentAmount, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error al actualizar progreso de meta:', error);
    throw new Error('No se pudo actualizar el progreso de la meta');
  }

  return data[0] as FinancialGoal;
}

/**
 * Obtiene las suscripciones de un usuario
 */
export async function getSubscriptions(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscriptions_tracker')
    .select('*')
    .eq('user_id', userId)
    .order('next_billing_date', { ascending: true });

  if (error) {
    console.error('Error al obtener suscripciones:', error);
    throw new Error('No se pudieron cargar las suscripciones');
  }

  return data as Subscription[];
}

/**
 * Crea una nueva suscripción
 */
export async function createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscriptions_tracker')
    .insert([subscription])
    .select();

  if (error) {
    console.error('Error al crear suscripción:', error);
    throw new Error('No se pudo crear la suscripción');
  }

  return data[0] as Subscription;
}

/**
 * Actualiza una suscripción existente
 */
export async function updateSubscription(id: string, updates: Partial<Subscription>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscriptions_tracker')
    .update({...updates, updated_at: new Date().toISOString()})
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error al actualizar suscripción:', error);
    throw new Error('No se pudo actualizar la suscripción');
  }

  return data[0] as Subscription;
}

/**
 * Elimina una suscripción
 */
export async function deleteSubscription(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('subscriptions_tracker')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar suscripción:', error);
    throw new Error('No se pudo eliminar la suscripción');
  }

  return true;
}

/**
 * Calcula las proyecciones de ahorro basado en un importe inicial, aportaciones mensuales y tasa de interés
 */
export function calculateSavingsProjection(
  initialAmount: number,
  monthlyContribution: number,
  interestRate: number,
  years: number
): { year: number; balance: number }[] {
  const monthlyRate = interestRate / 100 / 12;
  const months = years * 12;
  const projections: { year: number; balance: number }[] = [];

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
}

/**
 * Calcula el tiempo necesario para alcanzar una meta financiera
 */
export function calculateTimeToGoal(
  initialAmount: number,
  monthlyContribution: number,
  interestRate: number,
  targetAmount: number
): number | null {
  if (monthlyContribution <= 0 && (initialAmount >= targetAmount || interestRate <= 0)) {
    return null; // No es posible alcanzar la meta sin contribuciones ni interés
  }
  
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
}

/**
 * Calcula la contribución mensual requerida para alcanzar una meta en un tiempo específico
 */
export function calculateRequiredContribution(
  initialAmount: number,
  interestRate: number,
  targetAmount: number,
  months: number
): number {
  if (months <= 0) return 0;
  
  // Si el interés es 0, es un cálculo simple
  if (interestRate === 0) {
    return (targetAmount - initialAmount) / months;
  }
  
  const monthlyRate = interestRate / 100 / 12;
  
  // Fórmula para calcular la contribución mensual necesaria
  // PMT = (FV - PV * (1 + r)^n) / (((1 + r)^n - 1) / r)
  const futureValue = targetAmount;
  const presentValue = initialAmount;
  
  const factor1 = Math.pow(1 + monthlyRate, months);
  const factor2 = (factor1 - 1) / monthlyRate;
  
  const requiredContribution = (futureValue - presentValue * factor1) / factor2;
  
  return Math.round(requiredContribution * 100) / 100;
}

/**
 * Calcula el valor futuro de una inversión
 */
export function calculateFutureValue(
  principal: number,
  interestRate: number,
  years: number
): number {
  const annualRate = interestRate / 100;
  return principal * Math.pow(1 + annualRate, years);
}

/**
 * Agrupa transacciones por categoría
 */
export function groupTransactionsByCategory(transactions: Transaction[]): Record<TransactionCategory, number> {
  return transactions.reduce((acc, transaction) => {
    const { category, amount, type } = transaction;
    const value = type === 'income' ? amount : -amount;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += value;
    
    return acc;
  }, {} as Record<TransactionCategory, number>);
}

/**
 * Calcula el resumen financiero para un conjunto de transacciones
 */
export function calculateFinanceSummary(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): FinanceSummary {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Filtrar transacciones en el rango de fechas
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= start && date <= end;
  });
  
  let totalIncome = 0;
  let totalExpenses = 0;
  
  // Calcular totales
  filteredTransactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpenses += t.amount;
    }
  });
  
  // Agrupar por categoría
  const categoryTotals: Record<string, number> = {};
  
  filteredTransactions.forEach(t => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    
    if (t.type === 'income') {
      categoryTotals[t.category] += t.amount;
    } else if (t.type === 'expense') {
      categoryTotals[t.category] += t.amount;
    }
  });
  
  // Convertir a array y calcular porcentajes
  const byCategory = Object.entries(categoryTotals)
    .map(([category, amount]) => {
      const percentage = amount / (totalIncome + totalExpenses) * 100;
      return {
        category: category as TransactionCategory,
        amount,
        percentage: Math.round(percentage * 10) / 10,
      };
    })
    .sort((a, b) => b.amount - a.amount);
  
  return {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    balance: totalIncome - totalExpenses,
    period_start: startDate,
    period_end: endDate,
    by_category: byCategory,
  };
}

// Función para transformar los datos para una mejor visualización en el dashboard
export const transformDataForDashboard = (data: {
  transactions: Transaction[];
  financialGoals: FinancialGoal[];
  subscriptions: Subscription[];
  startDate: string;
  endDate: string;
}) => {
  const { transactions, startDate, endDate } = data;
  
  const summary = calculateFinanceSummary(transactions, startDate, endDate);
  
  return {
    summary,
    recentTransactions: transactions.slice(0, 5),
    upcomingSubscriptions: data.subscriptions
      .filter(sub => {
        const nextBillingDate = new Date(sub.next_billing_date);
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        return nextBillingDate >= today && nextBillingDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime())
      .slice(0, 3),
    topExpenseCategories: summary.by_category
      .filter(cat => cat.amount < 0)
      .map(cat => ({ ...cat, amount: Math.abs(cat.amount) }))
      .slice(0, 5),
  };
}; 