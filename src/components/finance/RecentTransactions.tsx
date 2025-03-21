import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/lib/finance';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Trash2, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { useFinance } from '@/hooks/useFinance';

interface RecentTransactionsProps {
  transactions: Transaction[];
  showViewAll?: () => void;
  showFilters?: boolean;
  userId?: string;
}

export function RecentTransactions({ 
  transactions, 
  showViewAll, 
  showFilters = false,
  userId
}: RecentTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const { deleteTransaction } = useFinance({ userId: userId || '' });
  
  // Obtener todas las categorías únicas de las transacciones
  const allCategories = Array.from(new Set(transactions.map(t => t.category)));
  
  // Filtrar transacciones según los filtros aplicados
  const filteredTransactions = transactions.filter(transaction => {
    // Filtro por término de búsqueda (descripción o categoría)
    const matchesSearch = 
      searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tipo de transacción
    const matchesType = 
      typeFilter === 'all' || 
      transaction.type === typeFilter;
    
    // Filtro por categoría
    const matchesCategory = 
      categoryFilter === 'all' || 
      transaction.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });
  
  // Formatear fecha en formato legible
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };
  
  // Formatear moneda
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Manejar eliminación de transacción
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error al eliminar la transacción:', error);
        alert('No se pudo eliminar la transacción.');
      }
    }
  };
  
  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="w-full md:w-40">
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {filteredTransactions.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No hay transacciones que mostrar.
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-2 ${
                  transaction.type === 'income' ? 'bg-indigo-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{transaction.description || transaction.category}</p>
                  <div className="flex text-sm text-gray-500">
                    <span>{transaction.category}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.recurring && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Recurrente ({transaction.recurring_frequency})</span>
                      </>
                    )}
                    {transaction.payment_method && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{transaction.payment_method}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className={`text-right ${
                  transaction.type === 'income' ? 'text-indigo-600' : 'text-red-600'
                }`}>
                  <p className="font-bold">
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                </div>
                
                {userId && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {showViewAll && transactions.length > 5 && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={showViewAll}>
            Ver todas ({transactions.length})
          </Button>
        </div>
      )}
      
      {editingTransaction && userId && (
        <TransactionForm
          userId={userId}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
} 