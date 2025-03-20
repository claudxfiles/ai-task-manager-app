// Servicio para interactuar con las APIs de calendario

import { supabase } from "./supabase";
import { CalendarEvent, EventSource } from "@/types/calendar";
import { parseISO, format, addHours, addMinutes, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

// Tipos para la integración con Google Calendar
type GoogleCalendarCredentials = {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
};

type CalendarEventInput = {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  goalId?: string;
  taskId?: string;
  habitId?: string;
  workoutId?: string;
};

// Función para verificar y obtener credenciales de Google Calendar
export async function getCalendarCredentials(userId: string): Promise<GoogleCalendarCredentials | null> {
  try {
    const { data, error } = await supabase
      .from('user_integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .maybeSingle();

    if (error) {
      console.error('Error fetching calendar credentials:', error);
      return null;
    }

    // Si no hay datos, verificar si hay credenciales en user_metadata
    if (!data) {
      // Intentar obtener credenciales desde los metadatos del usuario
      const { data: authData } = await supabase.auth.getUser();
      const googleToken = authData.user?.user_metadata?.google_token;
      
      if (googleToken) {
        return {
          access_token: googleToken.access_token,
          refresh_token: googleToken.refresh_token,
          expiry_date: googleToken.expires_at * 1000 // Convertir a milisegundos
        };
      }
      
      console.log('No se encontraron credenciales de Google Calendar para el usuario');
      return null;
    }

    return data.credentials as GoogleCalendarCredentials;
  } catch (error) {
    console.error('Error in getCalendarCredentials:', error);
    return null;
  }
}

// Función para refrescar el token de acceso si es necesario
export async function refreshTokenIfNeeded(userId: string, credentials: GoogleCalendarCredentials): Promise<GoogleCalendarCredentials> {
  // Si el token expira en menos de 5 minutos, refrescarlo
  if (credentials.expiry_date < Date.now() + 5 * 60 * 1000) {
    try {
      const { data, error } = await supabase.functions.invoke('refresh-google-token', {
        body: { refresh_token: credentials.refresh_token }
      });

      if (error || !data) {
        throw new Error(`Error refreshing token: ${error?.message || 'Unknown error'}`);
      }

      // Actualizar las credenciales en la base de datos
      const { error: updateError } = await supabase
        .from('user_integrations')
        .update({
          credentials: {
            access_token: data.access_token,
            refresh_token: credentials.refresh_token, // Mantener el refresh token actual
            expiry_date: Date.now() + (data.expires_in * 1000)
          }
        })
        .eq('user_id', userId)
        .eq('provider', 'google_calendar');

      if (updateError) {
        console.error('Error updating credentials:', updateError);
      }

      return {
        access_token: data.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: Date.now() + (data.expires_in * 1000)
      };
    } catch (error) {
      console.error('Error in refreshTokenIfNeeded:', error);
      throw error;
    }
  }

  return credentials;
}

// Función para obtener eventos del calendario
export async function getCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  try {
    // Obtener credenciales de Google Calendar
    const credentials = await getCalendarCredentials(userId);
    if (!credentials) {
      return []; // Si no hay credenciales, devolver array vacío
    }

    // Refrescar token si es necesario
    const refreshedCredentials = await refreshTokenIfNeeded(userId, credentials);

    // Formatear fechas para la API
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();

    // Llamar a la API de Google Calendar
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`, {
      headers: {
        'Authorization': `Bearer ${refreshedCredentials.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching calendar events:', errorData);
      return [];
    }

    const data = await response.json();
    
    // Transformar eventos de Google Calendar a nuestro formato
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.summary,
      start: item.start.dateTime || item.start.date,
      end: item.end.dateTime || item.end.date,
      allDay: !item.start.dateTime,
      description: item.description || '',
      source: 'google' as EventSource,
      color: '#4285F4', // Color de Google
      sourceId: item.id
    }));
  } catch (error) {
    console.error('Error in getCalendarEvents:', error);
    return [];
  }
}

// Función para crear un evento en Google Calendar
export async function createGoogleCalendarEvent(
  userId: string, 
  eventData: CalendarEventInput
): Promise<string | null> {
  try {
    // Obtener credenciales de Google Calendar
    const credentials = await getCalendarCredentials(userId);
    if (!credentials) {
      throw new Error('No se encontraron credenciales de Google Calendar');
    }

    // Refrescar token si es necesario
    const refreshedCredentials = await refreshTokenIfNeeded(userId, credentials);

    // Preparar datos del evento para Google Calendar
    const googleEvent = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    // Llamar a la API de Google Calendar para crear el evento
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshedCredentials.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleEvent)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating Google Calendar event:', errorData);
      throw new Error('Error al crear evento en Google Calendar');
    }

    const data = await response.json();
    
    // Guardar la relación del evento en nuestra base de datos
    const eventRelation = {
      user_id: userId,
      google_event_id: data.id,
      goal_id: eventData.goalId || null,
      task_id: eventData.taskId || null,
      habit_id: eventData.habitId || null,
      workout_id: eventData.workoutId || null,
      event_title: eventData.title,
      start_time: eventData.startDateTime,
      end_time: eventData.endDateTime
    };

    const { error } = await supabase
      .from('calendar_event_relations')
      .insert(eventRelation);

    if (error) {
      console.error('Error saving calendar event relation:', error);
    }

    return data.id;
  } catch (error) {
    console.error('Error in createGoogleCalendarEvent:', error);
    throw error;
  }
}

// Función para añadir un workout al calendario
export async function addWorkoutToCalendar(eventData: CalendarEventInput): Promise<string | null> {
  // Obtener el ID de usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  try {
    // Crear el evento en Google Calendar
    const eventId = await createGoogleCalendarEvent(user.id, eventData);
    return eventId;
  } catch (error) {
    console.error('Error al añadir workout al calendario:', error);
    throw error;
  }
}

// Función para crear un evento en el calendario
export async function createCalendarEvent(event: {
  summary: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  colorId?: string;
  calendarId?: string;
}) {
  try {
    const { calendarId = 'primary', ...eventData } = event;
    
    const response = await fetch('/api/v1/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...eventData,
        startDateTime: eventData.startDateTime.toISOString(),
        endDateTime: eventData.endDateTime.toISOString(),
        calendarId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear evento en el calendario');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al crear evento en el calendario:', error);
    throw error;
  }
}

// Función para actualizar un evento en el calendario
export async function updateCalendarEvent(
  eventId: string,
  event: {
    summary?: string;
    description?: string;
    startDateTime?: Date;
    endDateTime?: Date;
    location?: string;
    colorId?: string;
    calendarId?: string;
  }
) {
  try {
    const { calendarId = 'primary', ...eventData } = event;
    
    // Convertir fechas a ISO string si existen
    const payload = {
      ...eventData,
      startDateTime: eventData.startDateTime?.toISOString(),
      endDateTime: eventData.endDateTime?.toISOString(),
      calendarId,
    };
    
    const response = await fetch(`/api/v1/calendar/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar evento en el calendario');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar evento en el calendario:', error);
    throw error;
  }
}

// Función para eliminar un evento del calendario
export async function deleteCalendarEvent(eventId: string, calendarId = 'primary') {
  try {
    const response = await fetch(`/api/v1/calendar/${eventId}?calendarId=${calendarId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar evento del calendario');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar evento del calendario:', error);
    throw error;
  }
}

// Función para obtener los calendarios del usuario
export async function getUserCalendars() {
  try {
    const response = await fetch('/api/v1/calendar/userCalendars');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener calendarios del usuario');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener calendarios del usuario:', error);
    throw error;
  }
}

// Función para sincronizar una tarea con el calendario
export async function syncTaskWithCalendar(task: {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  priority: string;
}) {
  if (!task.due_date) {
    throw new Error('La tarea no tiene fecha límite definida');
  }
  
  // Crear fecha de inicio (fecha límite de la tarea)
  const startDateTime = new Date(task.due_date);
  
  // Crear fecha de fin (1 hora después por defecto)
  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(endDateTime.getHours() + 1);
  
  // Crear el evento
  return createCalendarEvent({
    summary: task.title,
    description: `Tarea de SoulDream: ${task.description || ''}
Prioridad: ${task.priority}
Estado: ${task.status}`,
    startDateTime,
    endDateTime,
    // Asignar color según prioridad
    colorId: task.priority === 'high' ? '4' : (task.priority === 'medium' ? '5' : '9'),
  });
} 