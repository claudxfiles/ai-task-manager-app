'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, Bug, RotateCw } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays, addWeeks, subWeeks, parseISO, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalendarEvents, useGoogleCalendarStatus, useSyncCalendar } from '@/hooks/useGoogleCalendar';
import { useAuth } from '@/hooks/useAuth';
import { ConnectGoogleButton } from './ConnectGoogleButton';
import { CalendarEvent } from './CalendarEvent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { CalendarEvent as CalendarEventType, EventSource } from '@/types/calendar';

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

// Interfaz para las estadísticas de sincronización
interface SyncStats {
  lastSync: Date;
  added: number;
  updated: number;
  deleted: number;
  success: boolean;
  errors: string[];
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const { toast } = useToast();
  const { session, loading: sessionLoading } = useAuth();
  
  // Estado de conexión con Google Calendar
  const { isConnected, needsReconnect, statusChecked } = useGoogleCalendarStatus();
  
  // Hook de sincronización
  const { syncCalendar, isSyncing, lastSyncStats } = useSyncCalendar();
  
  // Calcular fechas de inicio y fin según la vista
  const startDate = view === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 }) 
    : view === 'month'
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0); // Inicio del día
  
  const endDate = view === 'week' 
    ? endOfWeek(currentDate, { weekStartsOn: 1 }) 
    : view === 'month'
      ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59); // Fin del día
  
  // Obtener eventos del calendario
  const { data: calendarEvents = [], isLoading, isError, error, refetch } = useCalendarEvents(startDate, endDate);
  
  // Mostrar mensaje de error si ocurre
  useEffect(() => {
    if (isError && error instanceof Error) {
      toast({
        title: "Error al cargar eventos",
        description: error.message || "Hubo un problema al cargar los eventos del calendario",
        variant: "destructive"
      });
    }
  }, [isError, error, toast]);
  
  // Efecto para depurar eventos del calendario
  useEffect(() => {
    if (calendarEvents.length > 0) {
      console.log(`Eventos cargados (${calendarEvents.length}) para el rango:`, 
        format(startDate, 'dd/MM/yyyy'), 'hasta', format(endDate, 'dd/MM/yyyy'));
    } else if (!isLoading && !isError) {
      console.log('No se encontraron eventos para el rango:', 
        format(startDate, 'dd/MM/yyyy'), 'hasta', format(endDate, 'dd/MM/yyyy'));
    }
  }, [calendarEvents, startDate, endDate, isLoading, isError]);
  
  // Función para navegar por las fechas
  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  };
  
  // Función para sincronizar manualmente el calendario
  const handleSync = async () => {
    if (!isConnected) {
      toast({
        title: "No conectado",
        description: "Primero debes conectar tu cuenta de Google Calendar",
        variant: "destructive"
      });
      return;
    }
    
    if (needsReconnect) {
      toast({
        title: "Sesión expirada",
        description: "Tu sesión de Google Calendar ha expirado. Por favor, reconecta tu cuenta.",
        variant: "destructive"
      });
      return;
    }
    
    // Calcular fechas para sincronización (un rango más amplio que la vista actual)
    const syncStartDate = view === 'month'
      ? subMonths(startDate, 1)  // Un mes antes
      : subWeeks(startDate, 2);  // Dos semanas antes
      
    const syncEndDate = view === 'month'
      ? addMonths(endDate, 1)    // Un mes después
      : addWeeks(endDate, 2);    // Dos semanas después
    
    // Iniciar sincronización
    await syncCalendar(syncStartDate, syncEndDate);
  };
  
  // Formatea el encabezado de fecha según la vista
  function formatDateHeader() {
    if (view === 'day') {
      return format(currentDate, 'EEEE, d MMMM yyyy', { locale: es });
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'd', { locale: es })} - ${format(end, 'd MMMM yyyy', { locale: es })}`;
    } else {
      return format(currentDate, 'MMMM yyyy', { locale: es });
    }
  }
  
  // Render de la vista diaria
  function renderDayView() {
    // Filtrar eventos para mostrar solo los del día seleccionado
    const dayEvents = calendarEvents.filter(event => {
      const eventDate = parseISO(event.start);
      return isSameDay(eventDate, currentDate);
    });
    
    return (
      <div className="px-2">
        <div className="space-y-2">
          {dayEvents.length > 0 ? (
            dayEvents.map((event) => (
              <CalendarEvent key={event.id} event={{
                id: event.id,
                summary: event.title,
                description: event.description,
                start: { dateTime: event.start },
                end: { dateTime: event.end },
                location: event.location,
                colorId: event.color
              }} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <CalendarIcon className="h-8 w-8 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No hay eventos para el {format(currentDate, 'dd MMMM yyyy', { locale: es })}</p>
              <Button variant="outline" size="sm" onClick={handleSync} disabled={!isConnected || needsReconnect || isSyncing} className="mt-1">
                {isSyncing ? <RotateCw className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                Sincronizar
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render de la vista semanal
  function renderWeekView() {
    // Obtener los días de la semana
    const daysOfWeek = eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });
    
    // Agrupar eventos por día
    const eventsByDay = daysOfWeek.map(day => {
      const dayEvents = calendarEvents.filter(event => {
        const eventDate = parseISO(event.start);
        return isSameDay(eventDate, day);
      });
      
      return { date: day, events: dayEvents };
    });
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeceras de los días */}
        {daysOfWeek.map((day) => (
          <div 
            key={day.toString()} 
            className="text-center p-2 border-b"
          >
            <p className="text-xs text-muted-foreground">
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
        {eventsByDay.map(({ date, events }) => (
          <div 
            key={date.toString()} 
            className="p-1 min-h-24 max-h-[250px] overflow-y-auto"
          >
            {events.length > 0 ? (
              <div className="space-y-1">
                {events.map((event) => (
                  <CalendarEvent key={event.id} event={{
                    id: event.id,
                    summary: event.title,
                    description: event.description,
                    start: { dateTime: event.start },
                    end: { dateTime: event.end },
                    location: event.location,
                    colorId: event.color
                  }} compact />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Sin eventos</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  // Render de la vista mensual
  function renderMonthView() {
    // Obtener el primer día del mes
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // Obtener el último día del mes
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Obtener el primer día de la semana que contiene el primer día del mes
    const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    // Obtener el último día de la semana que contiene el último día del mes
    const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
    
    // Obtener todos los días entre startDate y endDate
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Nombres de los días de la semana
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return (
      <div className="calendar-month">
        {/* Cabecera con los días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center py-2 font-medium text-xs text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Cuadrícula de días */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            // Eventos para este día
            const dayEvents = calendarEvents.filter(event => {
              const eventStart = parseISO(event.start);
              return isSameDay(eventStart, day);
            });
            
            // Determinar si el día es del mes actual
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            // Determinar si es hoy
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[100px] p-1 border rounded-sm
                  ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
                  ${isToday ? 'border-primary' : 'border-border'}
                `}
              >
                {/* Número del día */}
                <div className={`
                  text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mb-1
                  ${isToday ? 'bg-primary text-primary-foreground' : ''}
                `}>
                  {format(day, 'd')}
                </div>
                
                {/* Eventos del día */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`
                        text-xs truncate rounded px-1 py-0.5
                        ${event.color ? `bg-${event.color}-100 text-${event.color}-800` : 'bg-blue-100 text-blue-800'}
                      `}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {/* Indicador de más eventos */}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{formatDateHeader()}</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs defaultValue={view} onValueChange={(value) => setView(value as any)}>
              <TabsList>
                <TabsTrigger value="day">Día</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mes</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSync}
                    disabled={!isConnected || needsReconnect || isSyncing}
                  >
                    {isSyncing ? (
                      <RotateCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Sincronizar calendario
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Estado de conexión */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {statusChecked ? (
              isConnected ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Conectado a Google Calendar
                </Badge>
              ) : (
                <ConnectGoogleButton />
              )
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Verificando conexión...
              </Badge>
            )}
            
            {isConnected && needsReconnect && (
              <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-800">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                Sesión expirada
              </Badge>
            )}
          </div>
          
          {lastSyncStats && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Última sincronización:</span>
              {format(lastSyncStats.timestamp, 'dd/MM HH:mm')}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Estado de carga */}
        {(sessionLoading || (isLoading && !isError)) ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <RotateCw className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Cargando eventos...</p>
            </div>
          </div>
        ) : !isConnected && statusChecked ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <CalendarIcon className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Calendario no conectado</h3>
              <p className="text-muted-foreground mb-4">Conecta tu cuenta de Google Calendar para ver y gestionar tus eventos</p>
              <ConnectGoogleButton />
            </div>
          </div>
        ) : (
          // Renderizado condicional según la vista
          view === 'day' ? renderDayView() : 
          view === 'week' ? renderWeekView() : 
          renderMonthView()
        )}
      </CardContent>
    </Card>
  );
} 