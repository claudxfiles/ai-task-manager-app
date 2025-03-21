'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Referencia para controlar el renderizado inicial
  const isInitialRender = useRef(true);
  
  // Efecto para mostrar mensaje de error si ocurre
  useEffect(() => {
    if (isError && error instanceof Error) {
      // Verificar si el mensaje de error indica un problema de reconexión
      if (
        error.message.includes('reconecta tu cuenta') || 
        error.message.includes('expirado') ||
        error.message.includes('permisos')
      ) {
        toast({
          title: "Problema de conexión con Google Calendar",
          description: "Tu sesión con Google Calendar ha expirado o tiene problemas de permisos. Por favor, reconecta tu cuenta.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/auth/reconnect?source=calendar_error'}
            >
              Reconectar
            </Button>
          )
        });
      } else {
        toast({
          title: "Error al cargar eventos",
          description: error.message || "Hubo un problema al cargar los eventos del calendario",
          variant: "destructive"
        });
      }
    }
  }, [isError, error, toast]);
  
  // Efecto para depurar eventos del calendario
  useEffect(() => {
    // Usar un flag de renderizado para evitar logs duplicados
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Solo mostrar logs cuando no está cargando y no hay error
    if (!isLoading && !isError) {
      if (calendarEvents.length > 0) {
        console.log(`Eventos cargados (${calendarEvents.length}) para el rango:`, 
          format(startDate, 'dd/MM/yyyy'), 'hasta', format(endDate, 'dd/MM/yyyy'));
      } else {
        // Evitar spam de logs "No se encontraron eventos"
        console.debug('No se encontraron eventos para el rango:', 
          format(startDate, 'dd/MM/yyyy'), 'hasta', format(endDate, 'dd/MM/yyyy'));
      }
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
  
  // Agregar un mensaje de estado en el calendario
  function renderStatusMessage() {
    // Mostrar mensaje cuando no está conectado a Google Calendar
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <CalendarIcon className="h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-center">No estás conectado a Google Calendar</p>
          <ConnectGoogleButton />
        </div>
      );
    }

    // Mostrar mensaje cuando se requiere reconexión
    if (needsReconnect) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2 p-4 border rounded-md bg-orange-50 dark:bg-orange-900/20">
          <Bug className="h-8 w-8 text-orange-500" />
          <p className="text-muted-foreground text-center">Tu sesión con Google Calendar ha expirado</p>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => window.location.href = '/auth/reconnect?source=calendar_view'}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Reconectar Google Calendar
          </Button>
        </div>
      );
    }

    // Mostrar mensaje cuando está cargando
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <RotateCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Cargando eventos del calendario...</p>
        </div>
      );
    }

    return null;
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>
            Calendario
            {isConnected && (
              <Badge variant={needsReconnect ? "destructive" : "outline"} className="ml-2">
                {needsReconnect ? "Requiere reconexión" : "Conectado a Google"}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoy
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleSync}
                    disabled={!isConnected || needsReconnect || isSyncing}
                  >
                    {isSyncing ? <RotateCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sincronizar con Google Calendar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">{formatDateHeader()}</div>
          <div>
            <Tabs defaultValue="week" value={view} onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="day">Día</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {lastSyncStats && lastSyncStats.timestamp && (
          <div className="text-xs text-muted-foreground mt-1">
            Última sincronización: {format(lastSyncStats.timestamp, 'dd/MM/yyyy HH:mm', { locale: es })}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Mostrar el mensaje de estado */}
        {renderStatusMessage()}
        
        {/* Contenido del calendario según la vista */}
        {isConnected && !needsReconnect && !isLoading && (
          <>
            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
          </>
        )}
      </CardContent>
    </Card>
  );
} 