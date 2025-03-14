import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Timer,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ActiveWorkoutProps {
  exercise: Exercise;
  onComplete: () => void;
  onClose: () => void;
}

export function ActiveWorkout({ exercise, onComplete, onClose }: ActiveWorkoutProps) {
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isPaused && ((isResting && timer < exercise.restTime) || (!isResting && timer < 60))) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPaused, isResting, timer, exercise.restTime]);

  useEffect(() => {
    if (isResting && timer >= exercise.restTime) {
      if (soundEnabled) {
        playSound('rest-complete');
      }
      setIsResting(false);
      setTimer(0);
    }
  }, [isResting, timer, exercise.restTime, soundEnabled]);

  const playSound = (type: 'rest-complete' | 'set-complete') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play();
  };

  const handleSetComplete = () => {
    if (soundEnabled) {
      playSound('set-complete');
    }
    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setTimer(0);
    } else {
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Entrenamiento Activo</DialogTitle>
          <DialogDescription>
            {exercise.name} - Serie {currentSet} de {exercise.sets}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={exercise.image}
                alt={exercise.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {isResting ? 'Tiempo de descanso' : 'Tiempo de ejercicio'}
                </span>
                <span className="font-mono text-lg">
                  {formatTime(isResting ? exercise.restTime - timer : timer)}
                </span>
              </div>
              <Progress 
                value={isResting 
                  ? ((exercise.restTime - timer) / exercise.restTime) * 100
                  : (timer / 60) * 100
                } 
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium">Series completadas</p>
                <div className="flex gap-1">
                  {Array.from({ length: exercise.sets }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < currentSet - 1 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Instrucciones</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {exercise.instructions.map((instruction, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {instruction}
                  </motion.li>
                ))}
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Detalles</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Repeticiones:</span>
                  <p className="font-medium">{exercise.reps}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Descanso:</span>
                  <p className="font-medium">{exercise.restTime}s</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Reanudar
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTimer(0);
                  setIsPaused(false);
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {!isResting && (
              <Button className="w-full" onClick={handleSetComplete}>
                {currentSet < exercise.sets ? 'Completar Serie' : 'Finalizar Ejercicio'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 