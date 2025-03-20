// Servicio para interactuar con las APIs de calendario

// Función para obtener eventos del calendario
export async function getCalendarEvents(startDate: Date, endDate: Date, calendarId = 'primary') {
  try {
    console.log(`Solicitando eventos del calendario desde ${startDate.toISOString()} hasta ${endDate.toISOString()}`);
    
    const response = await fetch(`/api/v1/calendar?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&calendarId=${calendarId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error de servidor' }));
      console.error('Error de respuesta al obtener eventos:', errorData);
      
      // Mensajes de error más específicos
      if (response.status === 401) {
        console.error('Error de autenticación (401):', errorData);
        throw new Error(errorData.error || 'Usuario no conectado a Google Calendar');
      }
      
      throw new Error(errorData.error || 'Error al obtener eventos del calendario');
    }
    
    const data = await response.json();
    console.log(`Eventos obtenidos correctamente: ${data.length} eventos`);
    return data;
  } catch (error) {
    console.error('Error al obtener eventos del calendario:', error);
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