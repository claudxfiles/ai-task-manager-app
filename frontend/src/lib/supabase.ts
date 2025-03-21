import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Estas variables de entorno deben configurarse en un archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente para el lado del servidor
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Variable para almacenar la instancia del cliente entre módulos
let supabaseClientInstance: ReturnType<typeof createClientComponentClient> | null = null;

// Implementación del patrón singleton para el cliente de componentes
export const createClientComponent = () => {
  if (typeof window === 'undefined') {
    // En el lado del servidor, siempre crear una nueva instancia (se ejecutará solo durante SSR)
    return createClientComponentClient();
  }
  
  // En el lado del cliente, reutilizar la instancia existente o crear una si es la primera vez
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClientComponentClient();
    console.log('Creando instancia única de GoTrueClient');
  }
  
  return supabaseClientInstance;
};

// Exportar la instancia del cliente para componentes (usando el mismo singleton)
export const supabaseClient = createClientComponent();

// Tipos para las tablas de Supabase
export type Tables = {
  users: {
    id: string;
    email: string;
    created_at: string;
  };
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
    email_notifications: boolean;
    subscription_tier: 'free' | 'pro' | 'business';
    created_at: string;
    updated_at: string;
  };
  tasks: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    column_order: number;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    related_goal_id?: string;
    category: string;
    tags: string[];
  };
  transactions: {
    id: string;
    user_id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    date: string;
    payment_method?: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
  };
  financial_goals: {
    id: string;
    user_id: string;
    title: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    category: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
  };
  conversations: {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
  };
  messages: {
    id: string;
    user_id: string;
    conversation_id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
    created_at: string;
    updated_at?: string;
  };
  // Añadir más tipos según sea necesario
}; 