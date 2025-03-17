'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, ArrowRight, Check } from 'lucide-react';
import { Goal } from '@/components/goals/GoalsDashboard';

interface GoalChatIntegrationProps {
  message: string;
  onCreateGoal: (goalData: Partial<Goal>) => void;
}

export function GoalChatIntegration({ message, onCreateGoal }: GoalChatIntegrationProps) {
  const [detectedGoal, setDetectedGoal] = useState<Partial<Goal> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Detectar posibles metas en el mensaje del usuario
  useEffect(() => {
    // Esta función simula la detección de metas mediante IA
    // En una implementación real, esto se haría con un modelo de NLP o llamada a API
    const detectGoalInMessage = (message: string) => {
      const lowerMessage = message.toLowerCase();
      
      // Detectar metas financieras
      if (
        lowerMessage.includes('comprar') || 
        lowerMessage.includes('ahorrar') || 
        lowerMessage.includes('adquirir')
      ) {
        // Detectar metas de adquisición
        if (
          lowerMessage.includes('casa') || 
          lowerMessage.includes('coche') || 
          lowerMessage.includes('moto') || 
          lowerMessage.includes('carro')
        ) {
          const type = 'adquisicion';
          const area = 'finanzas';
          
          // Extraer el objeto de la meta
          let title = '';
          if (lowerMessage.includes('casa')) title = 'Comprar una casa';
          else if (lowerMessage.includes('coche') || lowerMessage.includes('carro')) title = 'Comprar un coche';
          else if (lowerMessage.includes('moto')) title = 'Comprar una moto';
          
          return {
            title,
            description: `Meta para ${title.toLowerCase()}`,
            area,
            type,
            priority: 'high'
          };
        }
      }
      
      // Detectar metas de aprendizaje
      if (
        lowerMessage.includes('aprender') || 
        lowerMessage.includes('estudiar') || 
        lowerMessage.includes('dominar')
      ) {
        const type = 'aprendizaje';
        const area = 'educacion';
        
        // Extraer el tema de aprendizaje
        const learningTopics = [
          'programación', 'inglés', 'francés', 'alemán', 'italiano',
          'piano', 'guitarra', 'cocina', 'fotografía', 'diseño'
        ];
        
        let title = '';
        for (const topic of learningTopics) {
          if (lowerMessage.includes(topic)) {
            title = `Aprender ${topic}`;
            break;
          }
        }
        
        if (title) {
          return {
            title,
            description: `Meta para ${title.toLowerCase()}`,
            area,
            type,
            priority: 'medium'
          };
        }
      }
      
      // Detectar metas de salud
      if (
        lowerMessage.includes('ejercicio') || 
        lowerMessage.includes('entrenar') || 
        lowerMessage.includes('adelgazar') ||
        lowerMessage.includes('perder peso') ||
        lowerMessage.includes('correr') ||
        lowerMessage.includes('gimnasio')
      ) {
        const type = 'habito';
        const area = 'salud_bienestar';
        
        return {
          title: 'Mejorar condición física',
          description: 'Establecer rutina de ejercicios y mejorar salud',
          area,
          type,
          priority: 'medium'
        };
      }
      
      return null;
    };
    
    const goal = detectGoalInMessage(message);
    setDetectedGoal(goal);
  }, [message]);

  const handleCreateGoal = () => {
    setIsCreating(true);
    
    // Simular un pequeño retraso para mostrar el estado de creación
    setTimeout(() => {
      if (detectedGoal) {
        onCreateGoal(detectedGoal);
        setIsCreating(false);
        setDetectedGoal(null);
      }
    }, 1000);
  };

  if (!detectedGoal) return null;

  return (
    <Card className="mb-4 border-indigo-200 dark:border-indigo-800 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center text-indigo-600 dark:text-indigo-400">
          <Target className="h-4 w-4 mr-2" />
          Sugerencia de Meta Detectada
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          He detectado que podrías estar interesado en crear una meta para:
        </p>
        <p className="font-medium mt-1">{detectedGoal.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Área: {detectedGoal.area === 'finanzas' ? 'Finanzas' : 
                 detectedGoal.area === 'educacion' ? 'Educación' : 
                 detectedGoal.area === 'salud_bienestar' ? 'Salud y Bienestar' : 
                 detectedGoal.area === 'desarrollo_personal' ? 'Desarrollo Personal' : 
                 'Hobbies'}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs mr-2"
          onClick={() => setDetectedGoal(null)}
        >
          Ignorar
        </Button>
        <Button 
          size="sm" 
          className="text-xs bg-indigo-600 hover:bg-indigo-700"
          onClick={handleCreateGoal}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <span className="mr-2">Creando...</span>
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              <span>Crear Meta</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 