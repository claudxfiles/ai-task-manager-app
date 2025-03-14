'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Definición de interfaces
interface Exercise {
  id: string;
  name: string;
  equipment: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  primaryMuscle: string;
  secondaryMuscles?: string[];
}

interface MuscleGroup {
  id: string;
  name: string;
  image: string;
}

// Datos de grupos musculares
const muscleGroups: MuscleGroup[] = [
  { id: 'chest', name: 'Chest', image: '/images/workout/Chest.png' },
  { id: 'abs', name: 'Abs', image: '/images/workout/abs.png' },
  { id: 'biceps', name: 'Biceps', image: '/images/workout/Biceps.png' },
  { id: 'forearms', name: 'Forearms', image: '/images/workout/forearms.png' },
  { id: 'shoulders', name: 'Shoulders', image: '/images/workout/Shoulder.png' },
  { id: 'triceps', name: 'Triceps', image: '/images/workout/triceps.png' },
  { id: 'quadriceps', name: 'Quadriceps', image: '/images/workout/Quadriceps.png' },
  { id: 'hamstrings', name: 'Hamstrings', image: '/images/workout/Hamstring.png' },
  { id: 'calves', name: 'Calves', image: '/images/workout/Calves.png' },
  { id: 'glutes', name: 'Glutes', image: '/images/workout/Glutes.png' },
  { id: 'obliques', name: 'Obliques', image: '/images/workout/Obliques.png' },
];

// Datos de ejercicios
const exercisesData: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    equipment: 'barbell',
    description: 'Primary chest exercise',
    difficulty: 'intermediate',
    primaryMuscle: 'chest',
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    equipment: 'bodyweight',
    description: 'Basic chest exercise',
    difficulty: 'beginner',
    primaryMuscle: 'chest',
  },
  {
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    equipment: 'dumbbell',
    description: 'Chest isolation movement',
    difficulty: 'beginner',
    primaryMuscle: 'chest',
  },
  {
    id: 'incline-press',
    name: 'Incline Press',
    equipment: 'barbell',
    description: 'Upper chest focus',
    difficulty: 'intermediate',
    primaryMuscle: 'chest',
  },
  {
    id: 'bicep-curl',
    name: 'Bicep Curl',
    equipment: 'dumbbell',
    description: 'Basic bicep exercise',
    difficulty: 'beginner',
    primaryMuscle: 'biceps',
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    equipment: 'dumbbell',
    description: 'Works biceps and forearms',
    difficulty: 'beginner',
    primaryMuscle: 'biceps',
  },
  {
    id: 'crunch',
    name: 'Crunch',
    equipment: 'bodyweight',
    description: 'Basic ab exercise',
    difficulty: 'beginner',
    primaryMuscle: 'abs',
  },
  {
    id: 'leg-raise',
    name: 'Leg Raise',
    equipment: 'bodyweight',
    description: 'Lower abs focus',
    difficulty: 'intermediate',
    primaryMuscle: 'abs',
  },
];

export default function WorkoutPage() {
  const [activeTab, setActiveTab] = useState('ejercicios');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  // Filtrar ejercicios por grupo muscular
  const filteredExercises = selectedMuscleGroup
    ? exercisesData.filter(exercise => exercise.primaryMuscle === selectedMuscleGroup)
    : [];

  // Manejar la selección de un grupo muscular
  const handleMuscleGroupClick = (muscleGroupId: string) => {
    setSelectedMuscleGroup(muscleGroupId);
  };

  // Manejar la adición de un ejercicio a la rutina
  const handleAddExerciseToRoutine = (exercise: Exercise) => {
    if (!selectedExercises.some(e => e.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  // Obtener el color de la dificultad
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="ejercicios" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
          <TabsTrigger value="rutinas">Rutinas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="ejercicios" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Grupos Musculares */}
            <Card>
              <CardHeader>
                <CardTitle>Grupos Musculares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {muscleGroups.map((group) => (
                    <motion.div
                      key={group.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMuscleGroupClick(group.id)}
                      className={`flex flex-col items-center cursor-pointer p-2 rounded-lg ${
                        selectedMuscleGroup === group.id ? 'bg-primary/10 ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="relative w-16 h-16 mb-2">
                        <Image
                          src={group.image}
                          alt={group.name}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <span className="text-xs text-center font-medium">{group.name}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Biblioteca de Ejercicios */}
            {selectedMuscleGroup && (
              <Card>
                <CardHeader>
                  <CardTitle>Biblioteca de Ejercicios</CardTitle>
                  <CardDescription>
                    {muscleGroups.find(g => g.id === selectedMuscleGroup)?.name || 'Selecciona un grupo muscular'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExercises.map((exercise) => (
                      <Card key={exercise.id} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{exercise.name}</CardTitle>
                            <Badge className={getDifficultyColor(exercise.difficulty)}>
                              {exercise.difficulty}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <span className="capitalize">{exercise.equipment}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {}}
                          >
                            Ver Detalles
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAddExerciseToRoutine(exercise)}
                          >
                            Agregar a Rutina
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rutinas">
          <Card>
            <CardHeader>
              <CardTitle>Mis Rutinas</CardTitle>
              <CardDescription>Crea y gestiona tus rutinas de entrenamiento</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedExercises.length > 0 ? (
                <div className="grid gap-4">
                  {selectedExercises.map((exercise) => (
                    <Card key={exercise.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{exercise.name}</h3>
                          <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id))}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No has agregado ejercicios a tu rutina</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('ejercicios')}
                  >
                    Explorar Ejercicios
                  </Button>
                </div>
              )}
            </CardContent>
            {selectedExercises.length > 0 && (
              <CardFooter>
                <Button className="w-full">Guardar Rutina</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Entrenamientos</CardTitle>
              <CardDescription>Seguimiento de tus sesiones de entrenamiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay entrenamientos registrados</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}