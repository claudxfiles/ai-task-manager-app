import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ProductivityByDay } from '@/lib/analytics';

interface ProductivityChartProps {
  data: ProductivityByDay[];
}

// Función auxiliar para formatear fechas en el tooltip
const formatDate = (dateStr: string) => {
  return format(parseISO(dateStr), 'EEEE d MMM', { locale: es });
};

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-4 rounded-md shadow-lg">
        <p className="font-medium">{formatDate(label)}</p>
        <div className="space-y-1 mt-2">
          <p className="text-sm text-indigo-600">
            <span className="font-medium">Productividad:</span> {payload[0].value}/100
          </p>
          <p className="text-sm text-emerald-500">
            <span className="font-medium">Tareas completadas:</span> {payload[1].value}
          </p>
          <p className="text-sm text-amber-500">
            <span className="font-medium">Hábitos completados:</span> {payload[2].value}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export function ProductivityChart({ data }: ProductivityChartProps) {
  // Preparar datos para el gráfico
  const chartData = data.map(item => ({
    date: item.date,
    productivityScore: item.productivityScore,
    tasksCompleted: item.tasksCompleted,
    habitsCompleted: item.habitsCompleted,
    // Formatear la fecha para mostrar en el eje X
    formattedDate: format(parseISO(item.date), 'dd/MM')
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            yAxisId="left"
            tickMargin={10}
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
            tickCount={6}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tickMargin={10}
            tick={{ fontSize: 12 }}
            domain={[0, dataMax => Math.max(5, Math.ceil(dataMax * 1.2))]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="productivityScore"
            name="Productividad"
            stroke="#4f46e5"
            fill="#4f46e580"
            strokeWidth={2}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="tasksCompleted"
            name="Tareas"
            stroke="#10b981"
            fill="#10b98180"
            strokeWidth={2}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="habitsCompleted"
            name="Hábitos"
            stroke="#f59e0b"
            fill="#f59e0b80"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 