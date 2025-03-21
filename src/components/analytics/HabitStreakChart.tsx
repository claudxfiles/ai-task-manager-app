import React from 'react';
import { HabitStreakData } from '@/lib/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceLine
} from 'recharts';

interface HabitStreakChartProps {
  data: HabitStreakData[];
}

// Componente de tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const habit = payload[0].payload;
    
    return (
      <div className="bg-background border p-4 rounded-md shadow-lg">
        <p className="font-medium">{habit.habitTitle}</p>
        <div className="space-y-2 mt-2">
          <p className="text-sm flex justify-between">
            <span>Racha actual:</span> <span>{habit.currentStreak} días</span>
          </p>
          <p className="text-sm flex justify-between">
            <span>Mejor racha:</span> <span>{habit.bestStreak} días</span>
          </p>
          <p className="text-sm flex justify-between">
            <span>Tasa de finalización:</span> <span>{habit.completionRate}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function HabitStreakChart({ data }: HabitStreakChartProps) {
  // Ordenar hábitos por mejor racha (descendente)
  const sortedData = [...data].sort((a, b) => b.bestStreak - a.bestStreak);
  
  // Si no hay datos, mostrar mensaje
  if (!sortedData.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No hay datos de hábitos disponibles.</p>
        <p className="text-sm text-muted-foreground mt-2">Comienza a registrar tus hábitos para visualizar tus rachas.</p>
      </div>
    );
  }

  // Preparamos los datos para el gráfico
  const chartData = sortedData.map(habit => ({
    ...habit,
    // Truncamos el título si es muy largo
    shortTitle: habit.habitTitle.length > 20 
      ? habit.habitTitle.substring(0, 20) + '...' 
      : habit.habitTitle,
  }));

  // Calculamos el máximo valor para escalar el eje Y
  const maxValue = Math.max(
    ...chartData.map(habit => Math.max(habit.currentStreak, habit.bestStreak))
  );

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 30,
            left: 120, // Espacio para nombres de hábitos
            bottom: 10,
          }}
          barGap={0}
          barCategoryGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            domain={[0, Math.max(7, maxValue + 5)]} // Al menos 7 días, o más según datos
            tickCount={8}
            label={{ value: 'Días', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="category"
            dataKey="shortTitle"
            tick={{ fontSize: 12 }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine x={7} strokeDasharray="3 3" stroke="#9ca3af" label="1 semana" />
          <ReferenceLine x={30} strokeDasharray="3 3" stroke="#9ca3af" label="1 mes" />
          <Bar 
            dataKey="currentStreak" 
            name="Racha actual" 
            fill="#10b981" 
            radius={[0, 4, 4, 0]}
          >
            <LabelList dataKey="currentStreak" position="right" formatter={(value: number) => value > 0 ? value : ''} />
          </Bar>
          <Bar 
            dataKey="bestStreak" 
            name="Mejor racha" 
            fill="#4f46e5" 
            radius={[0, 4, 4, 0]} 
            fillOpacity={0.7}
          >
            <LabelList dataKey="bestStreak" position="right" formatter={(value: number) => value > 0 ? value : ''} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda de tasa de finalización */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {chartData.map(habit => (
          <div key={habit.habitId} className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full" style={{ 
              backgroundColor: habit.completionRate > 80 
                ? '#10b981' // Verde para alta tasa
                : habit.completionRate > 50 
                  ? '#f59e0b' // Ámbar para media
                  : '#ef4444', // Rojo para baja
            }} />
            <span className="text-xs truncate">{habit.habitTitle}</span>
            <span className="text-xs font-medium">{habit.completionRate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
} 