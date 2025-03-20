'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, Bug } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays, addWeeks, subWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalendarEvents, useGoogleCalendarStatus } from '@/hooks/useGoogleCalendar';
import { useAuth } from '@/hooks/useAuth';
import { ConnectGoogleButton } from './ConnectGoogleButton';
import { CalendarEvent } from './CalendarEvent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const { session } = useAuth();
  
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
  const { isConnected, needsReconnect, statusChecked } = useGoogleCalendarStatus();
  
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
  
  // Función para mostrar información de diagnóstico
  const showDebugInfo = () => {
    console.log('Estado de conexión con Google Calendar:', isConnected ? 'Conectado' : 'No conectado');
    console.log('Información de depuración de Google Calendar:');
    console.log('- Estado de conexión:', isConnected ? 'Conectado' : 'No conectado');
    console.log('- Necesita reconexión:', needsReconnect ? 'Sí' : 'No');
    
    if (session) {
      console.log('- Sesión activa:', !!session);
      console.log('- User ID:', session.user?.id);
      console.log('- Email:', session.user?.email);
      
      // Información detallada sobre metadata
      const metadata = session.user?.user_metadata || {};
      console.log('- User metadata:', metadata);
      
      // Información sobre el token de Google
      const googleToken = metadata.google_token || {};
      console.log('- Google token:', {
        hasAccessToken: !!googleToken.access_token,
        accessTokenLength: googleToken.access_token ? googleToken.access_token.length : 0,
        hasRefreshToken: !!googleToken.refresh_token,
        expiresAt: googleToken.expires_at ? new Date(googleToken.expires_at * 1000).toISOString() : 'N/A',
        scope: googleToken.scope || 'N/A'
      });
      
      // Verificar app_metadata también
      const appMetadata = session.user?.app_metadata || {};
      console.log('- App metadata:', appMetadata);
      console.log('- Provider:', appMetadata.provider);
    } else {
      console.log('- No hay sesión activa');
    }
    
    toast({
      title: 'Información de depuración',
      description: 'Se ha registrado información de diagnóstico en la consola. Por favor, comparte estos detalles con el soporte técnico.',
      duration: 5000,
    });

    // Intentar reconectar con Google Calendar después de mostrar la información
    if (!isConnected || needsReconnect) {
      toast({
        title: 'Recomendación',
        description: 'Es necesario volver a conectar tu cuenta de Google Calendar. Haz clic en el botón "Conectar con Google Calendar".',
        duration: 8000,
      });
    }
  };
  
  // Función para forzar reconexión (limpiar cookies y reconectar)
  const forceReconnect = async () => {
    try {
      toast({
        title: 'Reconexión forzada',
        description: 'Iniciando proceso de reconexión completo...',
      });
      
      // Llamar a la API de reconexión
      const response = await fetch(`/api/v1/auth/reconnect?t=${Date.now()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido');
      }
      
      // La redirección ocurrirá automáticamente por el proceso de OAuth
      toast({
        title: 'Redirección',
        description: 'Serás redirigido a Google para autorizar el acceso',
      });
    } catch (error: any) {
      console.error('Error al forzar reconexión:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo iniciar la reconexión',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent mb-4"></div>
            <p className="text-sm text-muted-foreground">Cargando eventos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Error al cargar el calendario</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {needsReconnect ? 
              'Tu sesión con Google Calendar ha expirado.' : 
              'No se pudieron cargar los eventos del calendario.'}
          </p>
          <ConnectGoogleButton />
          <button 
            onClick={() => refetch()} 
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Intentar nuevamente
          </button>
        </CardContent>
      </Card>
    );
  }
  
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
          
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-500"
              onClick={forceReconnect}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Forzar reconexión
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={showDebugInfo}
            >
              <Bug className="h-3 w-3 mr-1" />
              Diagnóstico
            </Button>
          </div>
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
          
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-500"
              onClick={forceReconnect}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Forzar reconexión
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={showDebugInfo}
            >
              <Bug className="h-3 w-3 mr-1" />
              Diagnóstico
            </Button>
          </div>
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