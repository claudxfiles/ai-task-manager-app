'use client';

// Importar parche para node:events antes de cualquier otra importación
import '../patches/node-events-patch';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUserCalendars,
  syncTaskWithCalendar
} from '@/lib/calendar-service';

// Tipo para el token de Google
interface GoogleToken {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
}

// Hook para obtener eventos del calendario
export function useCalendarEvents(startDate: Date, endDate: Date) {
  const { session } = useAuth();
  const { isConnected, needsReconnect } = useGoogleCalendarStatus();
  
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
    enabled: isConnected && !needsReconnect && !!session?.user?.id, // Solo habilitar si está conectado y no necesita reconexión
  });
}

// Hook para crear un evento en el calendario
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

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
      // Invalidar consultas relacionadas con eventos del calendario
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

// Hook para actualizar un evento en el calendario
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

// Hook para eliminar un evento del calendario
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteCalendarEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
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
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

// Hook para verificar si el usuario tiene conectado Google Calendar
export function useGoogleCalendarStatus() {
  const { session } = useAuth();
  const [statusChecked, setStatusChecked] = useState(false);
  const googleToken = session?.user?.user_metadata?.google_token as GoogleToken | undefined;
  
  const isConnected = !!googleToken?.access_token;
  const isTokenExpired = googleToken?.expires_at ? googleToken.expires_at < Date.now() / 1000 : true;
  
  useEffect(() => {
    if (session) {
      console.log('Estado de conexión con Google Calendar:', 
        isConnected ? 'Conectado' : 'No conectado',
        isConnected && isTokenExpired ? '(Token expirado)' : ''
      );
      
      if (googleToken) {
        console.log('Token Google disponible, expira:', 
          googleToken.expires_at ? new Date(googleToken.expires_at * 1000).toLocaleString() : 'desconocido'
        );
      }
      
      setStatusChecked(true);
    }
  }, [session, isConnected, isTokenExpired, googleToken]);
  
  return {
    isConnected,
    isTokenExpired,
    needsReconnect: isConnected && isTokenExpired,
    statusChecked
  };
} 