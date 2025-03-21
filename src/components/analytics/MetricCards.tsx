import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserMetrics } from '@/lib/analytics';
import { 
  TrendingUp, 
  CheckSquare, 
  Calendar, 
  Dumbbell, 
  DollarSign, 
  Target, 
  Zap 
} from 'lucide-react';

interface MetricCardsProps {
  metrics?: UserMetrics;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  format?: (value: number) => string;
}

const MetricCard = ({ title, value, description, icon, format }: MetricCardProps) => {
  const formattedValue = typeof value === 'number' && format ? format(value) : value;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h2 className="text-3xl font-bold">{formattedValue}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function MetricCards({ metrics }: MetricCardsProps) {
  if (!metrics) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${remainingMinutes}m`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Tareas Completadas"
        value={metrics.tasksCompleted}
        description="En este período"
        icon={<CheckSquare size={20} />}
      />
      
      <MetricCard
        title="Hábitos Completados"
        value={metrics.habitsCompleted}
        description="En este período"
        icon={<Calendar size={20} />}
      />
      
      <MetricCard
        title="Tiempo de Ejercicio"
        value={metrics.workoutMinutes}
        description="Total de minutos"
        icon={<Dumbbell size={20} />}
        format={formatTime}
      />
      
      <MetricCard
        title="Balance Financiero"
        value={metrics.financialBalance}
        description="Ingresos - Gastos"
        icon={<DollarSign size={20} />}
        format={formatCurrency}
      />
      
      <MetricCard
        title="Progreso de Metas"
        value={metrics.goalsProgress}
        description="Promedio de todas las metas"
        icon={<Target size={20} />}
        format={formatPercent}
      />
      
      <MetricCard
        title="Productividad"
        value={metrics.productivityScore}
        description="Puntuación global"
        icon={<Zap size={20} />}
        format={(value) => `${value}/100`}
      />
    </div>
  );
} 