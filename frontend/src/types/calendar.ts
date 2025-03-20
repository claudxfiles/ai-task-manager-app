export type EventSource = 'app' | 'google' | 'habit' | 'task' | 'goal' | 'workout';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description?: string;
  source: EventSource;
  color?: string;
  sourceId?: string;
  userId?: string;
  relatedId?: string;
  relatedType?: 'task' | 'goal' | 'habit' | 'workout';
}

export interface CalendarEventInput {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  goalId?: string;
  taskId?: string;
  habitId?: string;
  workoutId?: string;
}

export interface CalendarSettings {
  userId: string;
  defaultView: 'day' | 'week' | 'month';
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showWeekends: boolean;
  workingHoursStart: number;
  workingHoursEnd: number;
  showCompleted: boolean;
}

export interface GoogleCalendarCredentials {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type: string;
  scope: string;
} 