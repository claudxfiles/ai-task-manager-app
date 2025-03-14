"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MuscleGroup, MuscleDetail } from '@/types/workout';

interface AnatomicalViewProps {
  selectedMuscle: MuscleGroup | null;
  muscleDetails: Record<string, MuscleDetail>;
  onMuscleHover: (muscle: string | null) => void;
  hoveredMuscle: string | null;
}

export function AnatomicalView({
  selectedMuscle,
  muscleDetails,
  onMuscleHover,
  hoveredMuscle
}: AnatomicalViewProps) {
  return (
    <div className="relative aspect-[3/4] bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {selectedMuscle ? (
          <div className="relative w-full h-full">
            {/* Base muscle group image */}
            <Image
              src={selectedMuscle.image}
              alt={selectedMuscle.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-contain p-8"
            />
            
            {/* Related muscles with hover effects */}
            {selectedMuscle.relatedMuscles.map((muscle) => (
              <motion.div
                key={muscle}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: hoveredMuscle === muscle ? 0.8 : 0.3,
                  scale: hoveredMuscle === muscle ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
                onHoverStart={() => onMuscleHover(muscle)}
                onHoverEnd={() => onMuscleHover(null)}
              >
                <Image
                  src={`/images/workout/${muscle}`}
                  alt={muscleDetails[muscle]?.name || ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-8 cursor-pointer"
                />
              </motion.div>
            ))}

            {/* Muscle information overlay */}
            {hoveredMuscle && muscleDetails[hoveredMuscle] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm"
              >
                <h4 className="font-semibold text-lg">
                  {muscleDetails[hoveredMuscle].name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {muscleDetails[hoveredMuscle].description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {muscleDetails[hoveredMuscle].exercises.map((exercise) => (
                    <span
                      key={exercise}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-lg text-muted-foreground">
              Selecciona un grupo muscular para ver detalles anatómicos
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 