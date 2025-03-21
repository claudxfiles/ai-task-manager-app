import { Card } from '@/components/ui/card';
import { FinanceSummary as FinanceSummaryType } from '@/lib/finance';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, CreditCard, TrendingUp } from 'lucide-react';

interface FinanceSummaryProps {
  data: FinanceSummaryType;
  period: 'month' | 'year';
}

export function FinanceSummary({ data, period }: FinanceSummaryProps) {
  const { totalIncome, totalExpenses, netBalance, periodSavings, subscriptionTotal, currency } = data;
  
  // Formatear números para mostrar la moneda adecuada
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };
  
  // Determinar el color del balance (positivo o negativo)
  const getBalanceColor = (amount: number) => {
    return amount >= 0 ? 'text-emerald-600' : 'text-red-600';
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 flex items-start gap-4">
        <div className="rounded-full p-2 bg-indigo-100">
          <ArrowUpCircle className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Ingresos {period === 'month' ? 'Mensuales' : 'Anuales'}</p>
          <h3 className="text-2xl font-bold text-indigo-600">{formatCurrency(totalIncome)}</h3>
        </div>
      </Card>
      
      <Card className="p-6 flex items-start gap-4">
        <div className="rounded-full p-2 bg-red-100">
          <ArrowDownCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Gastos {period === 'month' ? 'Mensuales' : 'Anuales'}</p>
          <h3 className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</h3>
        </div>
      </Card>
      
      <Card className="p-6 flex items-start gap-4">
        <div className="rounded-full p-2 bg-emerald-100">
          <DollarSign className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Balance {period === 'month' ? 'Mensual' : 'Anual'}</p>
          <h3 className={`text-2xl font-bold ${getBalanceColor(netBalance)}`}>{formatCurrency(netBalance)}</h3>
        </div>
      </Card>
      
      <Card className="p-6 flex items-start gap-4">
        <div className="rounded-full p-2 bg-amber-100">
          <CreditCard className="h-8 w-8 text-amber-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Suscripciones Mensuales</p>
          <h3 className="text-2xl font-bold text-amber-600">{formatCurrency(subscriptionTotal)}</h3>
        </div>
      </Card>
      
      <Card className="p-6 col-span-1 md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Análisis Rápido</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium">
              {period === 'month' ? 'Este mes' : 'Este año'}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-500">Tasa de Ahorro</p>
              <p className="text-sm font-medium">
                {totalIncome > 0 
                  ? `${Math.round((periodSavings / totalIncome) * 100)}%` 
                  : '0%'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ 
                  width: totalIncome > 0 
                    ? `${Math.min(Math.max((periodSavings / totalIncome) * 100, 0), 100)}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-500">Suscripciones vs. Gastos</p>
              <p className="text-sm font-medium">
                {totalExpenses > 0 
                  ? `${Math.round((subscriptionTotal / totalExpenses) * 100)}%` 
                  : '0%'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-amber-500 h-2.5 rounded-full" 
                style={{ 
                  width: totalExpenses > 0 
                    ? `${Math.min((subscriptionTotal / totalExpenses) * 100, 100)}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 