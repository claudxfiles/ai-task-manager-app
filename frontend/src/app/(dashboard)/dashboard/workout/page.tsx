"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Calendar, 
  History, 
  ChevronRight,
  Timer,
  Dumbbell,
  Flame,
  Trophy
} from 'lucide-react';
import { muscleGroups, muscleDetails, workoutPrograms } from '@/data/workout-data';
import { MuscleGroup, WorkoutProgram } from '@/types/workout';
import { useToast } from '@/components/ui/use-toast';
import { AnatomicalView } from '@/components/workout/anatomical-view';

export default function WorkoutPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMuscleClick = (muscle: MuscleGroup) => {
    setSelectedMuscle(muscle);
    toast({
      title: muscle.name,
      description: `Músculos principales: ${muscle.muscles.join(', ')}`,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Entrenamiento</h2>
          <p className="text-muted-foreground">
            Selecciona un grupo muscular para ver detalles anatómicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            Historial
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Programar
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Iniciar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Anatomical View */}
        <AnatomicalView
          selectedMuscle={selectedMuscle}
          muscleDetails={muscleDetails}
          onMuscleHover={setHoveredMuscle}
          hoveredMuscle={hoveredMuscle}
        />

        {/* Muscle Groups Grid */}
        <div className="grid grid-cols-2 gap-4">
          {muscleGroups.map((group) => (
            <motion.div
              key={group.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMuscleClick(group)}
            >
              <Card className={`h-full cursor-pointer overflow-hidden ${
                selectedMuscle?.id === group.id ? 'ring-2 ring-primary' : ''
              }`}>
                <div className="relative h-32">
                  <Image
                    src={group.image}
                    alt={group.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.exercises} ejercicios
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Workout Programs Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Programas de Entrenamiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workoutPrograms.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{program.name}</h4>
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                </div>
                
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 mr-1" />
                    {program.duration}
                  </div>
                  <div className="flex items-center">
                    <Dumbbell className="w-4 h-4 mr-1" />
                    {program.exercises.length} ejercicios
                  </div>
                  <div className="flex items-center">
                    <Flame className="w-4 h-4 mr-1" />
                    {program.calories} kcal
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {program.targetMuscles.map((muscle) => (
                    <div
                      key={muscle}
                      className="relative w-8 h-8"
                    >
                      <Image
                        src={`/images/workout/${muscle}`}
                        alt={muscleDetails[muscle]?.name || ''}
                        fill
                        className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>

                <Button className="w-full">
                  Comenzar Programa
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Entrenamientos</p>
              <h4 className="text-2xl font-bold">24</h4>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Timer className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tiempo Total</p>
              <h4 className="text-2xl font-bold">12.5 hrs</h4>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Calorías Quemadas</p>
              <h4 className="text-2xl font-bold">6,420</h4>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Dumbbell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ejercicios Completados</p>
              <h4 className="text-2xl font-bold">186</h4>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}