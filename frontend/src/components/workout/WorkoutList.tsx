"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { 
  SearchIcon, 
  MoreVerticalIcon, 
  DumbbellIcon, 
  CalendarIcon, 
  ClockIcon,
  EditIcon,
  Trash2Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusCircleIcon
} from "lucide-react";
import { getUserWorkouts, deleteWorkout } from "@/lib/workout";
import { Workout, WorkoutType } from "@/types/workout";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";

interface WorkoutListProps {
  onRefresh: () => void;
}

export default function WorkoutList({ onRefresh }: WorkoutListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"date" | "name">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const loadWorkouts = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const workoutsData = await getUserWorkouts(user.id, {
        search: searchTerm || undefined,
        workoutType: workoutTypeFilter !== "all" ? (workoutTypeFilter as WorkoutType) : undefined,
      });
      setWorkouts(workoutsData);
    } catch (error) {
      console.error("Error loading workouts:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los entrenamientos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [user?.id, searchTerm, workoutTypeFilter]);

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkout(workoutId);
      toast({
        title: "Entrenamiento eliminado",
        description: "El entrenamiento se ha eliminado correctamente",
      });
      loadWorkouts();
      onRefresh();
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento",
        variant: "destructive",
      });
    }
  };

  const handleEditWorkout = (workoutId: string) => {
    router.push(`/dashboard/workout/${workoutId}`);
  };

  const handleViewWorkout = (workoutId: string) => {
    router.push(`/dashboard/workout/${workoutId}`);
  };

  const handleSort = (field: "date" | "name") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedWorkouts = [...workouts].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
  });

  const renderSortIcon = (field: "date" | "name") => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 ml-1" />
    );
  };

  const renderWorkoutTypeLabel = (type: string | null) => {
    if (!type) return "Otro";
    
    switch (type) {
      case WorkoutType.STRENGTH:
        return "Fuerza";
      case WorkoutType.CARDIO:
        return "Cardio";
      case WorkoutType.FLEXIBILITY:
        return "Flexibilidad";
      case WorkoutType.HIIT:
        return "HIIT";
      case WorkoutType.YOGA:
        return "Yoga";
      case WorkoutType.PILATES:
        return "Pilates";
      case WorkoutType.CROSSFIT:
        return "CrossFit";
      default:
        return capitalize(type);
    }
  };

  const getWorkoutTypeBadgeColor = (type: string | null) => {
    if (!type) return "bg-gray-500";
    
    switch (type) {
      case WorkoutType.STRENGTH:
        return "bg-red-500";
      case WorkoutType.CARDIO:
        return "bg-blue-500";
      case WorkoutType.FLEXIBILITY:
        return "bg-purple-500";
      case WorkoutType.HIIT:
        return "bg-orange-500";
      case WorkoutType.YOGA:
        return "bg-green-500";
      case WorkoutType.PILATES:
        return "bg-pink-500";
      case WorkoutType.CROSSFIT:
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tus Entrenamientos</CardTitle>
        <CardDescription>Historial de tus sesiones de entrenamiento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar entrenamientos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={workoutTypeFilter}
            onValueChange={setWorkoutTypeFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tipo de entrenamiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={WorkoutType.STRENGTH}>Fuerza</SelectItem>
              <SelectItem value={WorkoutType.CARDIO}>Cardio</SelectItem>
              <SelectItem value={WorkoutType.FLEXIBILITY}>Flexibilidad</SelectItem>
              <SelectItem value={WorkoutType.HIIT}>HIIT</SelectItem>
              <SelectItem value={WorkoutType.YOGA}>Yoga</SelectItem>
              <SelectItem value={WorkoutType.PILATES}>Pilates</SelectItem>
              <SelectItem value={WorkoutType.CROSSFIT}>CrossFit</SelectItem>
              <SelectItem value={WorkoutType.CUSTOM}>Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : sortedWorkouts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <DumbbellIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay entrenamientos</h3>
            <p className="text-muted-foreground mt-2">
              No se encontraron entrenamientos. ¡Comienza a registrar tu progreso!
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/workout/new")}
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Nuevo Entrenamiento
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer w-[180px]"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      <span>Fecha</span>
                      {renderSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      <span>Nombre</span>
                      {renderSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWorkouts.map((workout) => (
                  <TableRow
                    key={workout.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewWorkout(workout.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(workout.date), "d MMMM yyyy", { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>{workout.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getWorkoutTypeBadgeColor(workout.workout_type)} text-white`}>
                        {renderWorkoutTypeLabel(workout.workout_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        {workout.duration_minutes ? `${workout.duration_minutes} min` : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditWorkout(workout.id);
                          }}>
                            <EditIcon className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkout(workout.id);
                            }}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 