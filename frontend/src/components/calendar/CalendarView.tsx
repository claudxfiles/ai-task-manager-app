'use client';

import { useState } from 'react';
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
  const { session } = useAuth();
  
  // Estado de conexión con Google Calendar
  const { isConnected, needsReconnect, statusChecked } = useGoogleCalendarStatus();
  
  // Hook de sincronización
  const { syncCalendar, isSyncing, lastSyncStats } = useSyncCalendar();
  
  // Calcular fechas de inicio y fin según la vista
  const startDate = view === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 }) 
    : view === 'month'
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      : currentDate;
  
  const endDate = view === 'week' 
    ? endOfWeek(currentDate, { weekStartsOn: 1 }) 
    : view === 'month'
      ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      : currentDate;
  
  // Obtener eventos del calendario
  const { data: calendarEvents = [], isLoading, isError, refetch } = useCalendarEvents(startDate, endDate);
  
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
    return (
      <div className="px-2">
        <div className="space-y-2">
          {calendarEvents.length > 0 ? (
            calendarEvents.map((event) => (
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
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No hay eventos para este día</p>
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
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <CardTitle>Calendario</CardTitle>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Tabs 
            defaultValue="week" 
            value={view} 
            onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Día</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mes</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando eventos...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Bug className="h-12 w-12 text-destructive" />
            <p className="text-destructive font-medium">Error al cargar eventos</p>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-2">
              <div className="text-lg font-semibold">
                {formatDateHeader()}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Indicador de estado de sincronización */}
                {isConnected && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={needsReconnect ? "destructive" : "outline"} className="ml-2">
                          {needsReconnect ? "Reconexión requerida" : "Conectado a Google"}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {needsReconnect 
                          ? "Tu sesión de Google Calendar ha expirado. Haz clic en 'Reconectar' para renovar el acceso."
                          : "Tu cuenta está conectada a Google Calendar"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Botón de sincronización manual */}
                {isConnected && !needsReconnect && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSync} 
                    disabled={isSyncing}
                    className="flex items-center space-x-1"
                  >
                    {isSyncing ? (
                      <>
                        <RotateCw className="h-4 w-4 animate-spin" />
                        <span>Sincronizando...</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="h-4 w-4" />
                        <span>Sincronizar</span>
                      </>
                    )}
                  </Button>
                )}
                
                {/* Botón para conectar con Google Calendar */}
                {(!isConnected || needsReconnect) && (
                  <ConnectGoogleButton />
                )}
                
                {/* Botón para recargar eventos manualmente */}
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Última sincronización */}
            {lastSyncStats && (
              <div className="text-xs text-muted-foreground text-right px-6 pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      Última sincronización: {format(new Date(lastSyncStats.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eventos añadidos: {lastSyncStats.eventsCreated}</p>
                      <p>Eventos actualizados: {lastSyncStats.eventsUpdated}</p>
                      <p>Eventos eliminados: {lastSyncStats.eventsDeleted}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            <Tabs
              defaultValue="week"
              value={view}
              onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}
              className="mt-2"
            >
              {/* Renderizar la vista seleccionada */}
              <TabsContent value="day" className="m-0 py-2">
                {renderDayView()}
              </TabsContent>
              
              <TabsContent value="week" className="m-0 py-2">
                {renderWeekView()}
              </TabsContent>
              
              <TabsContent value="month" className="m-0 py-2">
                {renderMonthView()}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
} 