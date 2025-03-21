import React from 'react';
import { CategoryDistribution } from '@/lib/analytics';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface CategoryDistributionChartProps {
  data: CategoryDistribution[];
}

// Colores para las categorías
const COLORS = [
  '#4f46e5', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#64748b', // Slate (para "Sin categoría")
];

// Componente para el tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-background border p-4 rounded-md shadow-lg">
        <p className="font-medium">{data.category}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm flex justify-between">
            <span>Cantidad:</span> <span>{data.count} tareas</span>
          </p>
          <p className="text-sm flex justify-between">
            <span>Porcentaje:</span> <span>{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Componente para renderizar etiquetas dentro del gráfico
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? ( // Solo mostrar etiquetas para segmentos significativos
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  // Si no hay datos, mostrar mensaje
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No hay categorías de tareas disponibles.</p>
        <p className="text-sm text-muted-foreground mt-2">Asigna categorías a tus tareas para visualizar la distribución.</p>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = [...data]
    .sort((a, b) => b.count - a.count); // Ordenar por cantidad (descendente)

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="category"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Lista de categorías y cantidades */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {chartData.map((category, index) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{category.category}</span>
            <span className="ml-auto font-medium">{category.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 