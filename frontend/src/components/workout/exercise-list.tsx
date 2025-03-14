import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '@/types/workout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Clock, 
  Dumbbell, 
  Flame,
  ChevronRight,
  X
} from 'lucide-react';

interface ExerciseListProps {
  exercises: Exercise[];
  onClose: () => void;
  onStartWorkout: (exercise: Exercise) => void;
}

export function ExerciseList({ exercises, onClose, onStartWorkout }: ExerciseListProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto h-full py-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ejercicios Disponibles</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedExercise(exercise)}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={exercise.image}
                      alt={exercise.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{exercise.name}</h3>
                      <p className="text-sm text-muted-foreground">{exercise.description}</p>
                    </div>
                    
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Dumbbell className="w-4 h-4 mr-1" />
                        {exercise.equipment}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {exercise.restTime}s
                      </div>
                      <div className="flex items-center">
                        <Flame className="w-4 h-4 mr-1" />
                        {exercise.calories} kcal
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                        {exercise.difficulty}
                      </span>
                      <Button variant="ghost" size="sm">
                        Ver detalles
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-3xl">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedExercise.name}</DialogTitle>
                <DialogDescription>
                  {selectedExercise.description}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={selectedExercise.image}
                    alt={selectedExercise.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Detalles del ejercicio</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Series:</span>
                        <p className="font-medium">{selectedExercise.sets}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Repeticiones:</span>
                        <p className="font-medium">{selectedExercise.reps}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Descanso:</span>
                        <p className="font-medium">{selectedExercise.restTime}s</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Calorías:</span>
                        <p className="font-medium">{selectedExercise.calories} kcal/set</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Músculos trabajados</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.muscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Instrucciones</h4>
                    <ol className="list-decimal list-inside text-sm space-y-2">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => {
                      onStartWorkout(selectedExercise);
                      setSelectedExercise(null);
                    }}
                  >
                    Comenzar Ejercicio
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 