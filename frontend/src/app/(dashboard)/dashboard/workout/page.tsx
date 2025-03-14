"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Calendar, Play, Dumbbell } from 'lucide-react';
import { muscleGroups, muscleDetails, workoutPrograms } from '@/data/workout-data';
import { MuscleGroup, WorkoutProgram } from '@/types/workout';
import { AnatomicalView } from '@/components/workout/anatomical-view';

export default function WorkoutPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutProgram | null>(null);

  const handleMuscleHover = (muscle: string | null) => {
    setHoveredMuscle(muscle);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entrenamiento</h1>
          <p className="text-muted-foreground">
            Explora grupos musculares y rutinas personalizadas
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="icon">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Entrenamiento
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Anatomical View */}
        <div className="col-span-5">
          <Card className="p-6">
            <AnatomicalView
              selectedMuscle={selectedMuscle}
              muscleDetails={muscleDetails}
              onMuscleHover={handleMuscleHover}
              hoveredMuscle={hoveredMuscle}
            />
          </Card>
        </div>

        {/* Right Column - Muscle Groups & Workouts */}
        <div className="col-span-7">
          <Tabs defaultValue="muscles">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="muscles">Grupos Musculares</TabsTrigger>
              <TabsTrigger value="workouts">Rutinas</TabsTrigger>
            </TabsList>

            <TabsContent value="muscles" className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {muscleGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer bg-gradient-to-br ${group.color} ${
                        selectedMuscle?.id === group.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedMuscle(group)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-background/10 rounded-lg">
                          <Dumbbell className="h-6 w-6 text-background" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-background">
                            {group.name}
                          </h3>
                          <p className="text-sm text-background/80">
                            {group.exercises} ejercicios
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-background/90 font-medium">
                          Músculos principales:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {group.muscles.map((muscle) => (
                            <span
                              key={muscle}
                              className="text-xs px-2 py-1 rounded-full bg-background/20 text-background"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workouts" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {workoutPrograms.map((program) => (
                    <motion.div
                      key={program.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {program.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {program.description}
                            </p>
                            <div className="flex gap-4 mt-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {program.duration} min
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Flame className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {program.calories} kcal
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => setActiveWorkout(program)}
                            variant="secondary"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}