import React from 'react';
import { GoalProgress } from '@/lib/analytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GoalsProgressChartProps {
  goals: GoalProgress[];
}

// Función para truncar texto largo
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Colores por área
const areaColors: Record<string, string> = {
  desarrollo_personal: '#4f46e5', // Indigo
  salud_bienestar: '#10b981', // Emerald
  educacion: '#f59e0b', // Amber
  finanzas: '#ef4444', // Red
  hobbies: '#8b5cf6', // Purple
  default: '#64748b' // Slate
};

// Componente para el tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const goal = payload[0].payload;
    
    return (
      <div className="bg-background border p-4 rounded-md shadow-lg min-w-[250px]">
        <p className="font-medium text-base">{goal.title}</p>
        <div className="mt-2 space-y-2">
          <p className="text-sm flex justify-between">
            <span>Área:</span> 
            <Badge 
              className="ml-2"
              style={{ backgroundColor: areaColors[goal.area] || areaColors.default }}
            >
              {goal.area}
            </Badge>
          </p>
          <p className="text-sm flex justify-between">
            <span>Progreso:</span> <span>{goal.progress}%</span>
          </p>
          <p className="text-sm flex justify-between">
            <span>Pasos completados:</span> <span>{goal.stepsCompleted}/{goal.totalSteps}</span>
          </p>
          <p className="text-sm flex justify-between">
            <span>Días restantes:</span> <span>{goal.daysRemaining}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function GoalsProgressChart({ goals }: GoalsProgressChartProps) {
  // Ordenar metas por progreso (descendente)
  const sortedGoals = [...goals].sort((a, b) => b.progress - a.progress);
  
  // Si no hay metas, mostrar mensaje
  if (!sortedGoals.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No hay metas activas actualmente.</p>
        <p className="text-sm text-muted-foreground mt-2">Crea nuevas metas para comenzar a visualizar tu progreso.</p>
      </div>
    );
  }

  // Determinar si mostrar gráfico o lista según cantidad de metas
  const showChart = sortedGoals.length > 3;

  // Si tenemos pocas metas, mejor mostrar una lista
  if (!showChart) {
    return (
      <div className="space-y-5">
        {sortedGoals.map((goal) => (
          <div key={goal.goalId} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{goal.title}</h3>
              <Badge 
                style={{ backgroundColor: areaColors[goal.area] || areaColors.default }}
              >
                {goal.area}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Progress value={goal.progress} className="flex-1" />
              <span className="text-sm font-medium">{goal.progress}%</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pasos: {goal.stepsCompleted}/{goal.totalSteps}</span>
              <span>Días restantes: {goal.daysRemaining}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Para el gráfico, preparamos los datos
  const chartData = sortedGoals.map(goal => ({
    ...goal,
    // Truncamos el título si es muy largo
    shortTitle: truncateText(goal.title, 20),
  }));

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 30,
            left: 120, // Espacio para títulos de metas
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickCount={6} unit="%" />
          <YAxis 
            type="category" 
            dataKey="shortTitle" 
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="progress" name="Progreso de Meta" barSize={20}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={areaColors[entry.area] || areaColors.default}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 