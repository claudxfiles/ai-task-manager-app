"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BarChart3Icon, DumbbellIcon, TimerIcon, PlusIcon, SparklesIcon, PlusCircleIcon, BookmarkIcon, LayoutTemplateIcon } from "lucide-react";
import WorkoutList from "./WorkoutList";
import WorkoutStatisticsView from "./WorkoutStatisticsView";
import WorkoutProgressView from "./WorkoutProgressView";
import WorkoutProgressChart from "./WorkoutProgressChart";
import WorkoutTracker from "./WorkoutTracker";
import WorkoutRecommendationEngine from "./WorkoutRecommendationEngine";
import CreateWorkoutDialog from "./CreateWorkoutDialog";
import WorkoutCalendarIntegration from "./WorkoutCalendarIntegration";
import AIWorkoutRecommendations from "./AIWorkoutRecommendations";
import { useToast } from "@/components/ui/use-toast";
import { getUserWorkouts, getWorkoutStatistics } from "@/lib/workout";
import { WorkoutStatistics } from "@/types/workout";
import { useAuth } from "@/hooks/useAuth";
import WorkoutTemplateSelector from "./WorkoutTemplateSelector";
import Link from "next/link";

export default function WorkoutDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("workouts");
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<WorkoutStatistics | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;
      try {
        const statsData = await getWorkoutStatistics(user.id);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading workout statistics:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas de entrenamiento",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.id, refreshKey, toast]);

  return (
    <div className="space-y-8">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <DumbbellIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Registra tus entrenamientos</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Realiza un seguimiento de tus entrenamientos, mide tu progreso y
            visualiza tus resultados a lo largo del tiempo.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              className="gap-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <PlusCircleIcon className="h-4 w-4" />
              Nuevo Entrenamiento
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowTemplateSelector(true)}
            >
              <LayoutTemplateIcon className="h-4 w-4" />
              Seleccionar Rutina
            </Button>
            <Link href="/dashboard/workout/tracker">
              <Button variant="secondary" className="gap-2">
                <TimerIcon className="h-4 w-4" />
                Iniciar Rastreador
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WorkoutList onRefresh={handleRefresh} key={`list-${refreshKey}`} />
        </div>
        <div>
          <WorkoutRecommendationEngine />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkoutStatisticsView stats={stats} isLoading={isLoading} />
        <WorkoutProgressView />
      </div>

      <Tabs defaultValue="advanced-charts">
        <TabsList className="grid grid-cols-2 w-[400px] mb-4">
          <TabsTrigger value="advanced-charts">Análisis Avanzado</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>
        <TabsContent value="advanced-charts" className="space-y-4">
          <WorkoutProgressChart />
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <WorkoutCalendarIntegration />
        </TabsContent>
      </Tabs>

      <AIWorkoutRecommendations onCreateWorkout={setShowCreateDialog} />

      <CreateWorkoutDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleRefresh}
      />
      
      <WorkoutTemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSuccess={handleRefresh}
      />
    </div>
  );
} 