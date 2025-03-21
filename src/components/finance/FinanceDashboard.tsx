import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart,
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Calendar, 
  Target, 
  ArrowRight
} from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { Transaction, Subscription, FinancialGoal, transformDataForDashboard } from '@/lib/finance';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface FinanceDashboardProps {
  userId: string;
  transactions: Transaction[];
  goals: FinancialGoal[];
  subscriptions: Subscription[];
}

export function FinanceDashboard({ userId, transactions, goals, subscriptions }: FinanceDashboardProps) {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  
  // Fechas para el período seleccionado
  const today = new Date();
  const startDate = period === 'month' 
    ? startOfMonth(today) 
    : startOfMonth(subMonths(today, 11));
  const endDate = endOfMonth(today);
  
  // Transformar los datos para el dashboard
  const dashboardData = transformDataForDashboard({
    transactions,
    financialGoals: goals,
    subscriptions,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Resumen Financiero</h2>
        <div className="flex">
          <Tabs value={period} onValueChange={(value: 'month' | 'year') => setPeriod(value)} className="w-auto">
            <TabsList className="grid grid-cols-2 w-[180px]">
              <TabsTrigger value="month">Este Mes</TabsTrigger>
              <TabsTrigger value="year">Este Año</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary.total_income)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {period === 'month' ? 'Este mes' : 'Últimos 12 meses'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary.total_expenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {period === 'month' ? 'Este mes' : 'Últimos 12 meses'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dashboardData.summary.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {period === 'month' ? 'Este mes' : 'Últimos 12 meses'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximos Pagos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                dashboardData.upcomingSubscriptions.reduce((acc, sub) => acc + sub.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En los próximos 30 días
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Principales categorías de gastos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Principales Categorías de Gastos</CardTitle>
          <CardDescription>
            {period === 'month' ? 'Este mes' : 'Últimos 12 meses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.topExpenseCategories.length > 0 ? (
              dashboardData.topExpenseCategories.map((category, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-full max-w-md">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {category.category.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de gastos para este período</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Transacciones recientes y próximas suscripciones */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href="#transactions">
                Ver todas <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboardData.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <div className={`
                        rounded-full p-2 mr-3
                        ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}
                      `}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className={`h-4 w-4 text-green-600`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {transaction.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay transacciones recientes</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Próximas Suscripciones</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href="#subscriptions">
                Ver todas <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingSubscriptions.map((subscription) => (
                  <div 
                    key={subscription.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <div className="rounded-full p-2 mr-3 bg-blue-100">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {subscription.service_name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {subscription.billing_cycle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(subscription.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(subscription.next_billing_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay suscripciones próximas</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Metas financieras */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Metas Financieras</CardTitle>
            <CardDescription>Progreso hacia tus objetivos</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <a href="#goals">
              Ver todas <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-indigo-100">
                    <Target className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium truncate">{goal.title}</p>
                      <p className="text-xs font-medium ml-2">
                        {Math.round((goal.current_amount / goal.target_amount) * 100)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${(goal.current_amount / goal.target_amount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.current_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-muted-foreground mb-2">Aún no tienes metas financieras</p>
              <Button size="sm" asChild>
                <a href="#goals">Crear tu primera meta</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 