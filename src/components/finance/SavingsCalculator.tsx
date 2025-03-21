import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  calculateSavings, 
  calculateTimeToGoal, 
  calculateRequiredContribution 
} from '@/lib/finance';
import { useFinance } from '@/hooks/useFinance';
import { LineChart, BarChart, PieChart } from 'lucide-react';

interface SavingsCalculatorProps {
  userId: string;
}

export function SavingsCalculator({ userId }: SavingsCalculatorProps) {
  // Estados para los valores de entrada
  const [initialAmount, setInitialAmount] = useState<number>(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(200);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(5);
  const [years, setYears] = useState<number>(10);
  const [targetAmount, setTargetAmount] = useState<number>(50000);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  // Estados para los resultados calculados
  const [projections, setProjections] = useState<{ year: number; balance: number }[]>([]);
  const [timeToTarget, setTimeToTarget] = useState<number | null>(null);
  const [requiredContribution, setRequiredContribution] = useState<number | null>(null);
  
  // Obtener datos financieros del usuario
  const { summary } = useFinance({ userId });
  
  // Calcular proyecciones cuando cambien los valores de entrada
  useEffect(() => {
    // Calcular proyecciones de ahorro
    const savingsProjections = calculateSavings(
      initialAmount,
      monthlyContribution,
      annualInterestRate,
      years
    );
    setProjections(savingsProjections);
    
    // Calcular tiempo hasta alcanzar el objetivo
    const timeToGoal = calculateTimeToGoal(
      targetAmount,
      initialAmount,
      monthlyContribution,
      annualInterestRate
    );
    setTimeToTarget(timeToGoal);
    
    // Calcular contribución mensual requerida
    const neededContribution = calculateRequiredContribution(
      targetAmount,
      initialAmount,
      years,
      annualInterestRate
    );
    setRequiredContribution(neededContribution);
  }, [initialAmount, monthlyContribution, annualInterestRate, years, targetAmount]);
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: summary.currency || 'EUR',
    }).format(amount);
  };
  
  // Formatear años
  const formatYears = (years: number) => {
    if (years === Infinity) return 'Nunca';
    
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);
    
    if (years < 1) {
      return `${months} meses`;
    } else if (months === 0) {
      return `${wholeYears} años`;
    } else {
      return `${wholeYears} años y ${months} meses`;
    }
  };
  
  // Determinar el color de la barra según el porcentaje
  const getBarColor = (year: number, maxYears: number) => {
    const ratio = year / maxYears;
    if (ratio < 0.3) return 'bg-indigo-400';
    if (ratio < 0.7) return 'bg-indigo-600';
    return 'bg-indigo-800';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calculadora de Ahorros</h2>
        <div className="flex gap-2">
          <Button 
            variant={chartType === 'line' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setChartType('line')}
          >
            <LineChart className="h-4 w-4" />
          </Button>
          <Button 
            variant={chartType === 'bar' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setChartType('bar')}
          >
            <BarChart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de entradas */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-medium mb-4">Configura tus parámetros</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="initialAmount">Ahorro inicial</Label>
              <Input
                id="initialAmount"
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                min="0"
                step="100"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="monthlyContribution">Aporte mensual</Label>
                <span className="text-sm text-gray-500">{formatCurrency(monthlyContribution)}</span>
              </div>
              <Slider
                id="monthlyContribution"
                value={[monthlyContribution]}
                onValueChange={(values) => setMonthlyContribution(values[0])}
                min={0}
                max={2000}
                step={10}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="annualInterestRate">Tasa de interés anual</Label>
                <span className="text-sm text-gray-500">{annualInterestRate}%</span>
              </div>
              <Slider
                id="annualInterestRate"
                value={[annualInterestRate]}
                onValueChange={(values) => setAnnualInterestRate(values[0])}
                min={0}
                max={15}
                step={0.1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="years">Años</Label>
                <span className="text-sm text-gray-500">{years} años</span>
              </div>
              <Slider
                id="years"
                value={[years]}
                onValueChange={(values) => setYears(values[0])}
                min={1}
                max={40}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Objetivo de ahorro</Label>
              <Input
                id="targetAmount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
          </div>
        </Card>
        
        {/* Visualización de proyecciones */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Proyección de ahorro a {years} años</h3>
          
          {/* Gráfico de proyecciones */}
          <div className="h-64 mb-6">
            {chartType === 'line' ? (
              // Gráfico de línea simplificado
              <div className="relative h-full flex items-end">
                <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 border-t border-gray-200">
                  {[0.8, 0.6, 0.4, 0.2].map((pos, i) => (
                    <div key={i} className="border-b border-gray-200 relative">
                      <span className="absolute -left-10 top-0 text-xs text-gray-500">
                        {formatCurrency(projections.length > 0 ? projections[projections.length - 1].balance * pos : 0)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>
                
                <div className="relative z-10 flex items-end justify-between w-full h-full pl-2">
                  {projections.map((point, index) => {
                    const maxBalance = projections.length > 0 ? projections[projections.length - 1].balance : 0;
                    const height = (point.balance / maxBalance) * 100;
                    const isLast = index === projections.length - 1;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex flex-col items-center"
                        style={{ width: `${100 / projections.length}%` }}
                      >
                        <div 
                          className={`w-1.5 bg-indigo-600 rounded-t ${isLast ? 'bg-emerald-600' : ''}`}
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs mt-1">{point.year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Gráfico de barras simplificado
              <div className="relative h-full flex items-end space-x-1">
                {projections.map((projection, index) => {
                  const maxBalance = projections.length > 0 ? projections[projections.length - 1].balance : 0;
                  const height = (projection.balance / maxBalance) * 100;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex flex-col items-center"
                      style={{ width: `${100 / projections.length}%` }}
                    >
                      <div className="relative w-full group">
                        <div 
                          className={`w-full ${getBarColor(projection.year, years)} rounded-t transition-all duration-200 group-hover:opacity-80`}
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(projection.balance)}
                        </div>
                      </div>
                      <span className="text-xs mt-1">{projection.year}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Información resumida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-indigo-50">
              <h4 className="text-sm font-medium text-indigo-900">Balance Final</h4>
              <p className="text-2xl font-bold text-indigo-700">
                {projections.length > 0 ? formatCurrency(projections[projections.length - 1].balance) : formatCurrency(0)}
              </p>
              <p className="text-xs text-indigo-700 mt-1">En {years} años</p>
            </Card>
            
            <Card className="p-4 bg-emerald-50">
              <h4 className="text-sm font-medium text-emerald-900">Tiempo para Objetivo</h4>
              <p className="text-2xl font-bold text-emerald-700">
                {timeToTarget !== null ? formatYears(timeToTarget) : 'N/A'}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Para {formatCurrency(targetAmount)}
              </p>
            </Card>
            
            <Card className="p-4 bg-amber-50">
              <h4 className="text-sm font-medium text-amber-900">Aporte Mensual Necesario</h4>
              <p className="text-2xl font-bold text-amber-700">
                {requiredContribution !== null && requiredContribution !== Infinity 
                  ? formatCurrency(requiredContribution) 
                  : 'No es posible'}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Para alcanzar tu objetivo en {years} años
              </p>
            </Card>
          </div>
        </Card>
      </div>
      
      {/* Recomendaciones inteligentes */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recomendaciones Inteligentes</h3>
        
        <div className="space-y-4">
          {monthlyContribution < summary.periodSavings * 0.5 && summary.periodSavings > 0 && (
            <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50">
              <h4 className="font-medium text-emerald-800">¡Puedes ahorrar más!</h4>
              <p className="text-sm text-emerald-700">
                Basado en tus ingresos y gastos recientes, podrías aumentar tu aporte mensual hasta {formatCurrency(summary.periodSavings * 0.7)} sin afectar tu estilo de vida.
              </p>
            </div>
          )}
          
          {annualInterestRate < 3 && (
            <div className="p-4 border-l-4 border-amber-500 bg-amber-50">
              <h4 className="font-medium text-amber-800">Considera mejores instrumentos de inversión</h4>
              <p className="text-sm text-amber-700">
                Una tasa de interés del {annualInterestRate}% es baja. Considera fondos indexados que históricamente han rendido entre 7-10% anual a largo plazo.
              </p>
            </div>
          )}
          
          {monthlyContribution > 0 && targetAmount > 0 && (
            <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
              <h4 className="font-medium text-indigo-800">Efecto del interés compuesto</h4>
              <p className="text-sm text-indigo-700">
                Si mantienes tu aporte de {formatCurrency(monthlyContribution)} al mes durante {years} años, el interés compuesto generará aproximadamente {formatCurrency(projections.length > 0 ? projections[projections.length - 1].balance - (initialAmount + monthlyContribution * 12 * years) : 0)} adicionales.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 