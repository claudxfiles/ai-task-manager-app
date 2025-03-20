"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BarChart3Icon, DumbbellIcon, TimerIcon, PlusIcon } from "lucide-react";
import WorkoutList from "./WorkoutList";
import WorkoutStatisticsView from "./WorkoutStatisticsView";
import WorkoutProgressView from "./WorkoutProgressView";
import CreateWorkoutDialog from "./CreateWorkoutDialog";
import { useToast } from "@/components/ui/use-toast";
import { getUserWorkouts, getWorkoutStatistics } from "@/lib/workout";
import { WorkoutStatistics } from "@/types/workout";
import { useAuth } from "@/hooks/useAuth";

export default function WorkoutDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("workouts");
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="workouts" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="workouts" className="flex gap-2 items-center">
              <DumbbellIcon className="h-4 w-4" />
              <span>Entrenamientos</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex gap-2 items-center">
              <BarChart3Icon className="h-4 w-4" />
              <span>Progreso</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex gap-2 items-center">
              <TimerIcon className="h-4 w-4" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-end mb-4 mt-4">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Entrenamiento
            </Button>
          </div>

          <TabsContent value="workouts" className="space-y-4">
            <WorkoutList onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <WorkoutProgressView />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {stats ? (
              <WorkoutStatisticsView stats={stats} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                  <CardDescription>Cargando estadísticas de entrenamiento...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateWorkoutDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          handleRefresh();
          router.push("/dashboard/workout");
        }}
      />
    </div>
  );
} 