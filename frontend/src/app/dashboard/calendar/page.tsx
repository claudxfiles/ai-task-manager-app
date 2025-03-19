import dynamic from 'next/dynamic';

// Importar el componente de forma dinámica sin SSR
const CalendarViewDynamic = dynamic(
  () => import('@/components/calendar/CalendarView').then(mod => ({ default: mod.CalendarView })),
  { ssr: false }
);

export const metadata = {
  title: 'Calendario | SoulDream',
  description: 'Visualiza y gestiona todos tus eventos en un solo lugar',
};

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todos tus eventos y tareas en un solo lugar.
          </p>
        </div>
        
        <div className="grid gap-6">
          <CalendarViewDynamic />
        </div>
      </div>
    </div>
  );
} 