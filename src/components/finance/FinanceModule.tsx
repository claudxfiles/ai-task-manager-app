import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useFinance } from '@/hooks/useFinance';
import { RecentTransactions } from './RecentTransactions';
import { SavingsCalculator } from './SavingsCalculator';
import { SubscriptionsTracker } from './SubscriptionsTracker';
import { FinancialGoals } from './FinancialGoals';
import { FinanceDashboard } from './FinanceDashboard';

export function FinanceModule() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { 
    transactions, 
    financialGoals, 
    subscriptions,
    isLoading,
  } = useFinance({ userId: user?.id || '' });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-xl">Módulo de Finanzas</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center">
                <LineChart className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Transacciones</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center">
                <PieChart className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Suscripciones</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center">
                <LineChart className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Metas</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Calculadora</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-0 pt-0">
              <FinanceDashboard 
                userId={user?.id || ''} 
                transactions={transactions}
                goals={financialGoals}
                subscriptions={subscriptions}
              />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0 pt-0">
              <RecentTransactions 
                userId={user?.id || ''} 
                transactions={transactions}
                viewOptions={{
                  showSearch: true,
                  showFilters: true,
                  showPagination: true,
                }}
                filterOptions={{
                  categories: true,
                  dateRange: true,
                  transactionType: true,
                  amount: true,
                }}
              />
            </TabsContent>
            
            <TabsContent value="subscriptions" className="mt-0 pt-0">
              <SubscriptionsTracker 
                userId={user?.id || ''} 
                subscriptions={subscriptions}
              />
            </TabsContent>
            
            <TabsContent value="goals" className="mt-0 pt-0">
              <FinancialGoals 
                userId={user?.id || ''} 
                goals={financialGoals}
              />
            </TabsContent>
            
            <TabsContent value="calculator" className="mt-0 pt-0">
              <SavingsCalculator 
                userId={user?.id || ''} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 