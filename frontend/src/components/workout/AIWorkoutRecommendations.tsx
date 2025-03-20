"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DumbbellIcon, Loader2Icon, SparklesIcon, CalendarIcon, TimerIcon, HeartIcon } from "lucide-react";
import { AIWorkoutRecommendation, DifficultyLevel, MuscleGroup, WorkoutInsert, WorkoutExerciseInsert, WorkoutType } from "@/types/workout";
import { createWorkout } from "@/lib/workout";
import { useAuth } from "@/hooks/useAuth";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import Image from "next/image";

interface AIWorkoutRecommendationsProps {
  onCreateWorkout: (value: boolean) => void;
}

export default function AIWorkoutRecommendations({ onCreateWorkout }: AIWorkoutRecommendationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateResponse, isLoading } = useAIAssistant();
  
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [duration, setDuration] = useState<number>(30);
  const [includeCardio, setIncludeCardio] = useState<boolean>(true);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);
  const [workoutRecommendations, setWorkoutRecommendations] = useState<AIWorkoutRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Función para mapear el valor del slider de dificultad a un nivel de dificultad
  const getDifficultyLevelText = (value: number): DifficultyLevel => {
    switch (value) {
      case 0: return DifficultyLevel.BEGINNER;
      case 1: return DifficultyLevel.INTERMEDIATE;
      case 2: return DifficultyLevel.ADVANCED;
      default: return DifficultyLevel.INTERMEDIATE;
    }
  };
  
  const toggleMuscleGroup = (muscleGroup: MuscleGroup) => {
    if (selectedMuscleGroups.includes(muscleGroup)) {
      setSelectedMuscleGroups(selectedMuscleGroups.filter(mg => mg !== muscleGroup));
    } else {
      setSelectedMuscleGroups([...selectedMuscleGroups, muscleGroup]);
    }
  };
  
  const generateWorkoutRecommendations = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debe iniciar sesión para generar recomendaciones",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const prompt = `
        Genera 3 planes de entrenamiento diferentes con estas características:
        - Nivel de dificultad: ${getDifficultyLevelText(difficultyLevel)}
        - Duración aproximada: ${duration} minutos
        - Incluir cardio: ${includeCardio ? 'Sí' : 'No'}
        - Grupos musculares: ${selectedMuscleGroups.length > 0 ? selectedMuscleGroups.join(', ') : 'Cualquiera'}
        
        Cada plan debe tener:
        - Nombre atractivo
        - Breve descripción
        - Tipo de entrenamiento
        - Lista de ejercicios con series, repeticiones y descanso
        
        Devuelve los resultados en formato JSON siguiendo esta estructura exacta para cada plan:
        {
          "name": "Nombre del entrenamiento",
          "description": "Descripción breve",
          "workoutType": "Una de estas opciones: strength, cardio, flexibility, hiit, yoga, pilates, crossfit, custom",
          "difficultyLevel": "${getDifficultyLevelText(difficultyLevel)}",
          "estimatedDuration": ${duration},
          "muscleGroups": ["Lista de grupos musculares trabajados"],
          "exercises": [
            {
              "name": "Nombre del ejercicio",
              "sets": 3,
              "reps": 12,
              "restSeconds": 60,
              "notes": "Nota opcional"
            }
          ],
          "notes": "Notas adicionales (opcional)"
        }
      `;
      
      const response = await generateResponse(prompt);
      
      try {
        // Encontrar y extraer el JSON de la respuesta
        const jsonMatch = response.match(/\[.*\]/s);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          const parsedRecommendations = JSON.parse(jsonString) as AIWorkoutRecommendation[];
          setWorkoutRecommendations(parsedRecommendations);
        } else {
          throw new Error("No se pudo encontrar JSON en la respuesta");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        toast({
          title: "Error",
          description: "No se pudo procesar la respuesta de la IA",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating workout recommendations:", error);
      toast({
        title: "Error",
        description: "Error al generar recomendaciones de entrenamiento",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const createWorkoutFromRecommendation = async (recommendation: AIWorkoutRecommendation) => {
    if (!user?.id) return;
    
    try {
      const now = new Date();
      
      const newWorkout: WorkoutInsert = {
        user_id: user.id,
        name: recommendation.name,
        description: recommendation.description,
        workout_type: recommendation.workoutType as WorkoutType,
        duration_minutes: recommendation.estimatedDuration,
        date: now.toISOString(),
        muscle_groups: recommendation.muscleGroups,
        notes: recommendation.notes || ""
      };
      
      const exercises: WorkoutExerciseInsert[] = recommendation.exercises.map((exercise, index) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_seconds: exercise.restSeconds,
        order_index: index,
        notes: exercise.notes || ""
      }));
      
      await createWorkout(newWorkout, exercises);
      
      toast({
        title: "Éxito",
        description: "Entrenamiento creado a partir de la recomendación",
      });
      
      // Redirigir a la lista de entrenamientos
      onCreateWorkout(false);
    } catch (error) {
      console.error("Error creating workout from recommendation:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el entrenamiento",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <span>Recomendaciones de Entrenamiento Personalizadas</span>
          </CardTitle>
          <CardDescription>
            Configura tus preferencias y la IA generará rutinas de entrenamiento adaptadas a tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Nivel de dificultad</h3>
                <Slider
                  min={0}
                  max={2}
                  step={1}
                  value={[difficultyLevel]}
                  onValueChange={(value) => setDifficultyLevel(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Principiante</span>
                  <span>Intermedio</span>
                  <span>Avanzado</span>
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 font-medium">Duración aproximada (minutos)</h3>
                <Slider
                  min={15}
                  max={90}
                  step={5}
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>15 min</span>
                  <span>45 min</span>
                  <span>90 min</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-cardio" 
                  checked={includeCardio}
                  onCheckedChange={setIncludeCardio}
                />
                <Label htmlFor="include-cardio">Incluir cardio</Label>
              </div>
            </div>
            
            <div>
              <h3 className="mb-2 font-medium">Grupos musculares a trabajar</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(MuscleGroup).map((muscleGroup) => (
                  <Button
                    key={muscleGroup}
                    variant={selectedMuscleGroups.includes(muscleGroup as MuscleGroup) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMuscleGroup(muscleGroup as MuscleGroup)}
                    className="justify-start"
                  >
                    {muscleGroup}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generateWorkoutRecommendations}
            disabled={isGenerating || isLoading}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Generando recomendaciones...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 h-4 w-4" />
                Generar Recomendaciones
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {workoutRecommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Rutinas Recomendadas</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {workoutRecommendations.map((recommendation, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle>{recommendation.name}</CardTitle>
                  <CardDescription>{recommendation.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">
                      <DumbbellIcon className="h-3 w-3 mr-1" />
                      {recommendation.workoutType}
                    </Badge>
                    <Badge variant="outline">
                      <TimerIcon className="h-3 w-3 mr-1" />
                      {recommendation.estimatedDuration} min
                    </Badge>
                    <Badge variant="outline">
                      <HeartIcon className="h-3 w-3 mr-1" />
                      {recommendation.difficultyLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Ejercicios</h4>
                  <ul className="space-y-2">
                    {recommendation.exercises.map((exercise, i) => (
                      <li key={i} className="text-sm">
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-muted-foreground">
                          {exercise.sets} series × {exercise.reps} reps, {exercise.restSeconds}s descanso
                        </div>
                        {exercise.notes && (
                          <div className="text-xs italic mt-1">{exercise.notes}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                  {recommendation.notes && (
                    <div className="mt-4 text-sm">
                      <h4 className="font-medium mb-1">Notas:</h4>
                      <p className="text-muted-foreground">{recommendation.notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-4 py-3">
                  <Button
                    onClick={() => createWorkoutFromRecommendation(recommendation)}
                    className="w-full"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Crear Entrenamiento
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 