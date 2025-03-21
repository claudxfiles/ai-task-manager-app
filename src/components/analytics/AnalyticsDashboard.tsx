import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsTimeframe } from '@/lib/analytics';

// Componentes de gráficos
import { MetricCards } from './MetricCards';
import { ProductivityChart } from './ProductivityChart';
import { GoalsProgressChart } from './GoalsProgressChart';
import { HabitStreakChart } from './HabitStreakChart';
import { FinancialBreakdownChart } from './FinancialBreakdownChart';
import { CategoryDistributionChart } from './CategoryDistributionChart';

const timeframeOptions: { value: AnalyticsTimeframe; label: string }[] = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: '3months', label: 'Últimos 3 meses' },
  { value: '6months', label: 'Últimos 6 meses' },
  { value: 'year', label: 'Este año' },
  { value: 'all', label: 'Todo el tiempo' },
];

export function AnalyticsDashboard() {
  const { 
    userMetrics, 
    habitStreakData, 
    financialMetrics,
    goalsProgress,
    productivityByDay,
    taskCategoryDistribution,
    isLoading,
    hasErrors,
    setTimeframe,
    timeframe
  } = useAnalytics('month');

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as AnalyticsTimeframe);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="p-6 border rounded-lg bg-red-50">
        <h3 className="text-lg font-medium text-red-800">Ha ocurrido un error al cargar los datos de analítica</h3>
        <p className="text-red-600 mt-2">Por favor, intenta nuevamente más tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Analítica Personal</h1>
        <Select value={timeframe} onValueChange={handleTimeframeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {timeframeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tarjetas de métricas principales */}
      <MetricCards metrics={userMetrics} />

      <Tabs defaultValue="productivity" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="productivity">Productividad</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="habits">Hábitos</TabsTrigger>
          <TabsTrigger value="finances">Finanzas</TabsTrigger>
        </TabsList>

        {/* Contenido de la pestaña de Productividad */}
        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Tendencia de Productividad</CardTitle>
                <CardDescription>
                  Análisis de tu productividad diaria basada en tareas y hábitos completados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductivityChart data={productivityByDay || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Tareas</CardTitle>
                <CardDescription>
                  Porcentaje de tareas por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDistributionChart data={taskCategoryDistribution || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contenido de la pestaña de Metas */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Metas</CardTitle>
              <CardDescription>
                Análisis del progreso hacia tus metas actuales
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <GoalsProgressChart goals={goalsProgress || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenido de la pestaña de Hábitos */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Racha de Hábitos</CardTitle>
              <CardDescription>
                Análisis de consistencia en tus hábitos actuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HabitStreakChart data={habitStreakData || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenido de la pestaña de Finanzas */}
        <TabsContent value="finances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desglose Financiero</CardTitle>
              <CardDescription>
                Análisis de ingresos, gastos y distribución por categorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialBreakdownChart data={financialMetrics} />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Tasa de ahorro: {financialMetrics?.savingsRate.toFixed(1)}%
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 