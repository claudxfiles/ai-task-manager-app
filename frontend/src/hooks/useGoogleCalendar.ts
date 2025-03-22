'use client';

// Importar parche para node:events antes de cualquier otra importación
import '../patches/node-events-patch';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUserCalendars,
  syncTaskWithCalendar,
  syncUserCalendar,
  SyncDirection,
  SyncType
} from '@/lib/calendar-service';
import { useToast } from '@/components/ui/use-toast';

// Tipo para el token de Google
interface GoogleToken {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
}

// Hook para obtener eventos del calendario
export function useCalendarEvents(startDate: Date, endDate: Date) {
  const { session, loading: sessionLoading } = useAuth();
  const { isConnected, needsReconnect, statusChecked } = useGoogleCalendarStatus();
  
  return useQuery({
    queryKey: ['calendar-events', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      // Verificar si el usuario está conectado antes de hacer la solicitud
      if (!isConnected) {
        console.error('Usuario no conectado a Google Calendar');
        throw new Error('Usuario no conectado a Google Calendar');
      }
      
      if (needsReconnect) {
        console.error('Token expirado, se requiere reconexión');
        throw new Error('Sesión de Google Calendar expirada. Por favor, reconecta tu cuenta.');
      }
      
      // Verificar si tenemos un ID de usuario
      if (!session?.user?.id) {
        console.error('ID de usuario no disponible');
        throw new Error('ID de usuario no disponible');
      }
      
      return getCalendarEvents(session.user.id, startDate, endDate);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: isConnected ? 3 : false, // Solo reintentar si está conectado
    enabled: !sessionLoading && isConnected && !needsReconnect && !!session?.user?.id && statusChecked, // Solo habilitar si la sesión está cargada y está conectado
  });
}

// Hook para crear un evento en el calendario
export function useCreateCalendarEvent() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Manejo seguro de QueryClient
  let queryClient: QueryClient | undefined;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn('QueryClient no disponible. La invalidación de consultas no funcionará.');
  }
  
  return useMutation({
    mutationFn: (event: {
      summary: string;
      description?: string;
      startDateTime: Date;
      endDateTime: Date;
      location?: string;
      colorId?: string;
    }) => createCalendarEvent(event),
    onSuccess: () => {
      toast({
        title: 'Evento creado',
        description: 'El evento ha sido creado en Google Calendar'
      });
      
      // Invalidar consulta de eventos si el queryClient está disponible
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      }
    },
  });
}

// Hook para actualizar un evento en el calendario
export function useUpdateCalendarEvent() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Manejo seguro de QueryClient
  let queryClient: QueryClient | undefined;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn('QueryClient no disponible. La invalidación de consultas no funcionará.');
  }
  
  return useMutation({
    mutationFn: ({
      eventId,
      event,
    }: {
      eventId: string;
      event: {
        summary?: string;
        description?: string;
        startDateTime?: Date;
        endDateTime?: Date;
        location?: string;
        colorId?: string;
      };
    }) => updateCalendarEvent(eventId, event),
    onSuccess: () => {
      toast({
        title: 'Evento actualizado',
        description: 'El evento ha sido actualizado en Google Calendar'
      });
      
      // Invalidar consulta de eventos si el queryClient está disponible
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      }
    },
  });
}

// Hook para eliminar un evento del calendario
export function useDeleteCalendarEvent() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Manejo seguro de QueryClient
  let queryClient: QueryClient | undefined;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn('QueryClient no disponible. La invalidación de consultas no funcionará.');
  }
  
  return useMutation({
    mutationFn: (eventId: string) => deleteCalendarEvent(eventId),
    onSuccess: () => {
      toast({
        title: 'Evento eliminado',
        description: 'El evento ha sido eliminado de Google Calendar'
      });
      
      // Invalidar consulta de eventos si el queryClient está disponible
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      }
    },
  });
}

// Hook para obtener los calendarios del usuario
export function useUserCalendars() {
  return useQuery({
    queryKey: ['user-calendars'],
    queryFn: () => getUserCalendars(),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

// Hook para sincronizar una tarea con el calendario
export function useSyncTaskWithCalendar() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Manejo seguro de QueryClient
  let queryClient: QueryClient | undefined;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn('QueryClient no disponible. La invalidación de consultas no funcionará.');
  }
  
  return useMutation({
    mutationFn: (task: {
      id: string;
      title: string;
      description?: string;
      due_date: string;
      status: string;
      priority: string;
    }) => syncTaskWithCalendar(task),
    onSuccess: () => {
      toast({
        title: 'Tarea sincronizada',
        description: 'La tarea ha sido sincronizada con Google Calendar'
      });
      
      // Invalidar consulta de eventos si el queryClient está disponible
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      }
    },
  });
}

// Hook para verificar si el usuario tiene conectado Google Calendar
export function useGoogleCalendarStatus() {
  const { session } = useAuth();
  const [statusChecked, setStatusChecked] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<{
    isConnected: boolean;
    isTokenExpired: boolean;
    expiryDate?: Date;
  }>({
    isConnected: false,
    isTokenExpired: true,
    expiryDate: undefined
  });
  
  // Agregamos un ref para evitar logs duplicados
  const prevStatusRef = useRef<{
    isConnected: boolean;
    isTokenExpired: boolean;
    expiryDate?: string;
    componentId?: string;
  }>({
    isConnected: false,
    isTokenExpired: true,
    expiryDate: undefined
  });
  
  // Obtener la información del token de la sesión, si está disponible
  const googleToken = session?.user?.user_metadata?.google_token as GoogleToken | undefined;
  const userId = session?.user?.id;
  
  // Verificar estado de conexión actual basado en la sesión (método original)
  const sessionBasedConnected = !!googleToken?.access_token;
  const sessionBasedExpired = googleToken?.expires_at ? googleToken.expires_at < Date.now() / 1000 : true;
  
  // Efecto para verificar el estado de la integración con Google Calendar
  useEffect(() => {
    async function checkCalendarStatus() {
      // Si tenemos el token en la sesión, usamos esa información
      if (googleToken) {
        setCalendarStatus({
          isConnected: !!googleToken.access_token,
          isTokenExpired: googleToken.expires_at ? googleToken.expires_at < Date.now() / 1000 : true,
          expiryDate: googleToken.expires_at ? new Date(googleToken.expires_at * 1000) : undefined
        });
        setStatusChecked(true);
      } 
      // Si no tenemos token en sesión pero tenemos userId, intentamos con API
      else if (userId) {
        try {
          // Llamar a nuestra nueva API para verificar estado de integración
          const response = await fetch(`/api/v1/auth/user-metadata?userId=${userId}`);
          
          if (response.ok) {
            const data = await response.json();
            const token = data.google_token;
            
            if (token) {
              setCalendarStatus({
                isConnected: !!token.access_token,
                isTokenExpired: token.expires_at ? token.expires_at < Date.now() / 1000 : true,
                expiryDate: token.expires_at ? new Date(token.expires_at * 1000) : undefined
              });
            } else {
              setCalendarStatus({
                isConnected: false,
                isTokenExpired: true
              });
            }
          } else {
            // Si hay error, asumimos que no hay conexión
            setCalendarStatus({
              isConnected: false,
              isTokenExpired: true
            });
          }
        } catch (error) {
          console.error('Error verificando estado de calendario:', error);
          setCalendarStatus({
            isConnected: false,
            isTokenExpired: true
          });
        } finally {
          setStatusChecked(true);
        }
      }
    }
    
    checkCalendarStatus();
  }, [userId, googleToken]);
  
  // Modificado: usar useEffect con comprobación de cambios reales para evitar logs duplicados
  useEffect(() => {
    if (!session) return;
    
    // Formatear expiryDate para comparación
    const currentExpiryStr = calendarStatus.expiryDate?.toLocaleString();
    
    // Verificar si el estado ha cambiado realmente
    const hasChanged = 
      calendarStatus.isConnected !== prevStatusRef.current.isConnected ||
      calendarStatus.isTokenExpired !== prevStatusRef.current.isTokenExpired ||
      currentExpiryStr !== prevStatusRef.current.expiryDate;
    
    // Solo generar logs cuando hay un cambio real de estado
    if (hasChanged) {
      // Actualizar la referencia para evitar logs duplicados
      prevStatusRef.current = {
        isConnected: calendarStatus.isConnected,
        isTokenExpired: calendarStatus.isTokenExpired,
        expiryDate: currentExpiryStr,
        componentId: prevStatusRef.current.componentId
      };
      
      // Registrar el estado solo cuando cambia
      if (calendarStatus.isConnected) {
        console.log(
          `[CalendarStatus:${prevStatusRef.current.componentId}] Estado de conexión con Google Calendar: Conectado`
        );
        
        if (calendarStatus.expiryDate) {
          console.log(
            `[CalendarStatus:${prevStatusRef.current.componentId}] Token Google disponible, expira: ${calendarStatus.expiryDate.toLocaleString()}`
          );
        }
      } else {
        console.log(
          `[CalendarStatus:${prevStatusRef.current.componentId}] Estado de conexión con Google Calendar: ${
            !statusChecked ? 'Verificando...' : 'No conectado'
          }`
        );
      }
    }
  }, [calendarStatus, session, statusChecked]);
  
  return {
    isConnected: calendarStatus.isConnected,
    isTokenExpired: calendarStatus.isTokenExpired,
    needsReconnect: calendarStatus.isConnected && calendarStatus.isTokenExpired,
    statusChecked
  };
}

// Hook para sincronizar calendario
export function useSyncCalendar() {
  const { session } = useAuth();
  
  // Añadir manejo de error para cuando el QueryClient no está disponible
  let queryClient: QueryClient | undefined;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn('QueryClient no disponible. La invalidación de consultas no funcionará.');
  }
  
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStats, setLastSyncStats] = useState<{
    success: boolean;
    eventsCreated: number;
    eventsUpdated: number;
    eventsDeleted: number;
    errors: string[];
    timestamp: Date;
  } | null>(null);

  const { isConnected, needsReconnect } = useGoogleCalendarStatus();

  const syncCalendar = useCallback(async (
    startDate: Date, 
    endDate: Date, 
    direction: SyncDirection = SyncDirection.BIDIRECTIONAL,
    syncType: SyncType = SyncType.MANUAL
  ) => {
    // Obtener userId de la sesión
    const userId = session?.user?.id;
    
    if (!userId) {
      toast({
        title: "Error de sincronización",
        description: "Usuario no autenticado. No se pudo obtener el ID de usuario.",
        variant: "destructive"
      });
      return false;
    }

    if (!isConnected) {
      toast({
        title: "Error de sincronización",
        description: "No estás conectado a Google Calendar",
        variant: "destructive"
      });
      return false;
    }

    if (needsReconnect) {
      toast({
        title: "Sesión expirada",
        description: "Tu sesión de Google Calendar ha expirado. Por favor, reconecta tu cuenta.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsSyncing(true);

      toast({
        title: "Sincronizando calendario",
        description: "Esto puede tardar unos momentos...",
      });

      console.log(`Iniciando sincronización para usuario ${userId} desde ${startDate.toISOString()} hasta ${endDate.toISOString()}`);
      
      const result = await syncUserCalendar(
        userId,
        startDate,
        endDate,
        direction,
        syncType
      );

      setLastSyncStats({
        ...result,
        timestamp: new Date()
      });

      // Invalidar consultas de calendario para refrescar datos
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      }

      if (result.success) {
        toast({
          title: "Sincronización completada",
          description: `Se han ${result.eventsCreated > 0 ? `creado ${result.eventsCreated},` : ''} ${result.eventsUpdated > 0 ? `actualizado ${result.eventsUpdated},` : ''} ${result.eventsDeleted > 0 ? `eliminado ${result.eventsDeleted}` : ''} eventos.`,
        });
      } else if (result.errors.length > 0) {
        toast({
          title: "Sincronización parcial",
          description: `Hubo ${result.errors.length} errores. Por favor, intenta de nuevo.`,
          variant: "destructive"
        });
      }

      return result.success;
    } catch (error: any) {
      console.error("Error en la sincronización del calendario:", error);
      toast({
        title: "Error de sincronización",
        description: error.message || "Ha ocurrido un error al sincronizar el calendario",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [session, isConnected, needsReconnect, queryClient, toast]);

  return {
    syncCalendar,
    isSyncing,
    lastSyncStats
  };
} 