'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays, addWeeks, subWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalendarEvents, useGoogleCalendarStatus } from '@/hooks/useGoogleCalendar';
import { ConnectGoogleButton } from './ConnectGoogleButton';
import { CalendarEvent } from './CalendarEvent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Definir la interfaz para los eventos del calendario
interface GoogleEvent {
  id: string;
  summary: string;
  description?: string | null;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string | null;
  colorId?: string | null;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
  
  // Calcular fechas de inicio y fin según la vista
  const startDate = view === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 }) 
    : currentDate;
  
  const endDate = view === 'week' 
    ? endOfWeek(currentDate, { weekStartsOn: 1 }) 
    : currentDate;
  
  // Obtener eventos del calendario
  const { data: calendarEvents = [], isLoading, isError, refetch } = useCalendarEvents(startDate, endDate);
  
  // Transformar la respuesta a nuestro tipo de interfaz para evitar problemas de tipado
  const events = calendarEvents.map(event => ({
    id: event.id || `event-${Math.random()}`,
    summary: event.summary || 'Sin título',
    description: event.description,
    start: {
      dateTime: event.start?.dateTime || new Date().toISOString(),
      timeZone: event.start?.timeZone
    },
    end: {
      dateTime: event.end?.dateTime || new Date().toISOString(),
      timeZone: event.end?.timeZone
    },
    location: event.location,
    colorId: event.colorId
  })) as GoogleEvent[];
  
  // Verificar el estado de conexión con Google Calendar
  const { isConnected, needsReconnect } = useGoogleCalendarStatus();
  
  // Función para navegar por las fechas
  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  };
  
  // Obtener los días de la semana para la vista semanal
  const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Agrupar eventos por día
  const eventsByDay = daysOfWeek.map(day => {
    const dayEvents = events.filter(event => {
      try {
        const eventStart = parseISO(event.start.dateTime);
        return isSameDay(eventStart, day);
      } catch (e) {
        return false;
      }
    });
    
    return {
      date: day,
      events: dayEvents
    };
  });
  
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Conecta tu Google Calendar</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Para ver tus eventos y sincronizar tus tareas, conecta tu cuenta de Google Calendar.
          </p>
          <ConnectGoogleButton />
        </CardContent>
      </Card>
    );
  }
  
  if (needsReconnect) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Necesitas reconectar Google Calendar</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Tu sesión ha expirado. Por favor, vuelve a conectarte para seguir usando el calendario.
          </p>
          <ConnectGoogleButton />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Calendario</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {view === 'week' 
                ? `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM', { locale: es })}`
                : format(currentDate, 'dd MMMM yyyy', { locale: es })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date())}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <Tabs defaultValue="week" onValueChange={(value) => setView(value as 'day' | 'week')}>
          <TabsList className="mx-2 mb-4">
            <TabsTrigger value="day">Día</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
          </TabsList>
          
          <TabsContent value="day" className="m-0">
            <div className="px-2">
              <h3 className="text-lg font-medium mb-4">
                {format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es })}
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <p>Cargando eventos...</p>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-red-500">Error al cargar eventos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <CalendarEvent key={event.id} event={event} />
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No hay eventos para este día
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="m-0">
            <div className="grid grid-cols-7 gap-1">
              {/* Cabeceras de los días */}
              {daysOfWeek.map((day) => (
                <div 
                  key={day.toString()} 
                  className="text-center p-2 border-b"
                >
                  <p className="text-xs text-gray-500">
                    {format(day, 'EEEE', { locale: es })}
                  </p>
                  <p className={`text-sm font-medium ${
                    isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''
                  }`}>
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
              
              {/* Eventos por día */}
              {isLoading ? (
                <div className="col-span-7 flex items-center justify-center h-40">
                  <p>Cargando eventos...</p>
                </div>
              ) : isError ? (
                <div className="col-span-7 flex items-center justify-center h-40">
                  <p className="text-red-500">Error al cargar eventos</p>
                </div>
              ) : (
                eventsByDay.map(({ date, events }) => (
                  <div 
                    key={date.toString()} 
                    className="p-1 min-h-24 max-h-[250px] overflow-y-auto"
                  >
                    {events.length > 0 ? (
                      <div className="space-y-1">
                        {events.map((event) => (
                          <CalendarEvent key={event.id} event={event} compact />
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-gray-400">Sin eventos</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 