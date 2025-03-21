import React from 'react';
import { FinancialMetrics } from '@/lib/analytics';
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface FinancialBreakdownChartProps {
  data?: FinancialMetrics;
}

// Array de colores para las categorías
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
  '#6366f1', // Indigo (shade)
];

// Función para formatear moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Componente de tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-background border p-4 rounded-md shadow-lg">
        <p className="font-medium">{data.category}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm flex justify-between">
            <span>Monto:</span> <span>{formatCurrency(data.amount)}</span>
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

// Componente para renderizar una etiqueta dentro del gráfico
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? ( // Solo mostrar etiquetas para porciones significativas
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

export function FinancialBreakdownChart({ data }: FinancialBreakdownChartProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No hay datos financieros disponibles.</p>
        <p className="text-sm text-muted-foreground mt-2">Registra tus ingresos y gastos para visualizar el desglose.</p>
      </div>
    );
  }

  // Si no hay categorías de gastos, mostrar mensaje
  if (!data.categoryDistribution.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No hay categorías de gastos registradas.</p>
        <p className="text-sm text-muted-foreground mt-2">Asigna categorías a tus gastos para visualizar el desglose.</p>
      </div>
    );
  }

  // Preparar los datos para el gráfico de pastel
  const pieData = data.categoryDistribution
    .filter(item => item.amount > 0) // Filtrar solo montos positivos
    .sort((a, b) => b.amount - a.amount); // Ordenar por monto (descendente)

  // Calcular el resumen financiero
  const savingsColor = data.monthlySavings >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* Resumen de ingresos, gastos y ahorro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
            <h3 className="text-2xl font-bold text-primary mt-1">
              {formatCurrency(data.totalIncome)}
            </h3>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Gastos</p>
            <h3 className="text-2xl font-bold text-red-500 mt-1">
              {formatCurrency(data.totalExpenses)}
            </h3>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Ahorro</p>
            <h3 
              className="text-2xl font-bold mt-1"
              style={{ color: savingsColor }}
            >
              {formatCurrency(data.monthlySavings)}
            </h3>
            <p className="text-xs mt-1">
              Tasa de ahorro: <span className="font-medium">{data.savingsRate.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de distribución de gastos */}
      <div className="h-80 w-full mt-6">
        <h3 className="text-base font-medium mb-4">Distribución de Gastos por Categoría</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 