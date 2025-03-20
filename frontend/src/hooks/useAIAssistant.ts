import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './useAuth';

interface AIAssistantHook {
  generateResponse: (prompt: string) => Promise<string>;
  isLoading: boolean;
}

export function useAIAssistant(): AIAssistantHook {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const supabase = createClientComponentClient();

  const generateResponse = async (prompt: string): Promise<string> => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);

    try {
      // En un caso real, esta sería una llamada a un endpoint de OpenAI o tu proveedor de IA
      // Por ahora, simularemos una respuesta para el desarrollo

      // Registramos la interacción en la tabla ai_interactions
      const { data: interaction, error: interactionError } = await supabase
        .from('ai_interactions')
        .insert({
          user_id: user.id,
          query: prompt,
          context: 'workout',
          model_used: 'gpt-3.5-turbo-simulation',
          tokens_used: Math.round(prompt.length / 4), // Redondeamos el valor
          response: ''
        })
        .select()
        .single();

      if (interactionError) {
        console.error('Error registrando interacción con IA:', interactionError);
      }

      // Simular un tiempo de respuesta de la IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Para el ejemplo, simularemos respuestas de workout basadas en la entrada
      const simulatedResponse = generateSimulatedWorkoutResponse(prompt);
      
      // Actualizar la respuesta en la base de datos
      if (interaction?.id) {
        await supabase
          .from('ai_interactions')
          .update({
            response: simulatedResponse,
          })
          .eq('id', interaction.id);
      }

      return simulatedResponse;
    } catch (error) {
      console.error('Error al generar respuesta de IA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateResponse,
    isLoading,
  };
}

// Función para generar respuestas simuladas
function generateSimulatedWorkoutResponse(prompt: string): string {
  // Extraer información del prompt para personalizar la respuesta
  const difficultyMatch = prompt.match(/dificultad: (principiante|intermedio|avanzado)/i);
  const difficulty = difficultyMatch ? difficultyMatch[1].toLowerCase() : 'intermedio';
  
  const durationMatch = prompt.match(/duración aproximada: (\d+)/i);
  const duration = durationMatch ? parseInt(durationMatch[1]) : 30;
  
  const includeCardioMatch = prompt.match(/incluir cardio: (sí|si|no)/i);
  const includeCardio = includeCardioMatch ? includeCardioMatch[1].toLowerCase() !== 'no' : true;
  
  const muscleGroupsMatch = prompt.match(/grupos musculares: ([^]+?)(?=(cada plan|devuelve))/i);
  const muscleGroups = muscleGroupsMatch 
    ? muscleGroupsMatch[1].split(',').map(g => g.trim()).filter(g => g !== 'Cualquiera')
    : [];

  // Generar respuestas basadas en las entradas del usuario
  return `
Aquí tienes 3 planes de entrenamiento personalizados basados en tus preferencias:

[
  {
    "name": "Fuerza Total ${difficulty === 'avanzado' ? 'Pro' : difficulty === 'intermedio' ? 'Plus' : 'Básico'}",
    "description": "Entrenamiento de fuerza completo para desarrollar músculos y mejorar resistencia",
    "workoutType": "strength",
    "difficultyLevel": "${difficulty}",
    "estimatedDuration": ${duration},
    "muscleGroups": ${JSON.stringify(muscleGroups.length > 0 ? muscleGroups : ["chest", "back", "legs", "shoulders"])},
    "exercises": [
      {
        "name": "Sentadillas con Peso",
        "sets": ${difficulty === 'avanzado' ? 5 : difficulty === 'intermedio' ? 4 : 3},
        "reps": ${difficulty === 'avanzado' ? 8 : difficulty === 'intermedio' ? 10 : 12},
        "restSeconds": ${difficulty === 'avanzado' ? 90 : difficulty === 'intermedio' ? 75 : 60},
        "notes": "Mantén la espalda recta y asegúrate de que las rodillas no sobrepasen la punta de los pies"
      },
      {
        "name": "Press de Banca",
        "sets": ${difficulty === 'avanzado' ? 5 : difficulty === 'intermedio' ? 4 : 3},
        "reps": ${difficulty === 'avanzado' ? 8 : difficulty === 'intermedio' ? 10 : 12},
        "restSeconds": ${difficulty === 'avanzado' ? 90 : difficulty === 'intermedio' ? 75 : 60},
        "notes": "Baja la barra hasta rozar el pecho y sube controlando el movimiento"
      },
      {
        "name": "Dominadas",
        "sets": ${difficulty === 'avanzado' ? 4 : difficulty === 'intermedio' ? 3 : 2},
        "reps": ${difficulty === 'avanzado' ? 10 : difficulty === 'intermedio' ? 8 : 5},
        "restSeconds": ${difficulty === 'avanzado' ? 90 : difficulty === 'intermedio' ? 75 : 60},
        "notes": "Si es necesario, usa asistencia con banda elástica"
      },
      {
        "name": "Peso Muerto",
        "sets": ${difficulty === 'avanzado' ? 4 : difficulty === 'intermedio' ? 3 : 2},
        "reps": ${difficulty === 'avanzado' ? 6 : difficulty === 'intermedio' ? 8 : 10},
        "restSeconds": ${difficulty === 'avanzado' ? 120 : difficulty === 'intermedio' ? 90 : 75},
        "notes": "Mantén la espalda recta y el core activado durante todo el movimiento"
      }${includeCardio ? `,
      {
        "name": "Burpees",
        "sets": 3,
        "reps": 15,
        "restSeconds": 45,
        "notes": "Realiza este ejercicio como finalizador para elevar el ritmo cardíaco"
      }` : ''}
    ],
    "notes": "Aumenta el peso gradualmente en cada serie manteniendo una técnica correcta"
  },
  {
    "name": "HIIT Express",
    "description": "Entrenamiento de alta intensidad para quemar calorías y mejorar resistencia cardiovascular",
    "workoutType": "hiit",
    "difficultyLevel": "${difficulty}",
    "estimatedDuration": ${Math.min(duration, 45)},
    "muscleGroups": ["full_body", "cardio"],
    "exercises": [
      {
        "name": "Mountain Climbers",
        "sets": 4,
        "reps": 30,
        "restSeconds": 20,
        "notes": "Mantén el core activado y realiza el movimiento a velocidad moderada-alta"
      },
      {
        "name": "Saltos en Caja",
        "sets": 4,
        "reps": 15,
        "restSeconds": 30,
        "notes": "Aterriza suavemente flexionando las rodillas para absorber el impacto"
      },
      {
        "name": "Plancha Lateral con Rotación",
        "sets": 3,
        "reps": 10,
        "restSeconds": 20,
        "notes": "Alterna ambos lados en cada repetición"
      },
      {
        "name": "Burpees",
        "sets": 3,
        "reps": ${difficulty === 'avanzado' ? 20 : difficulty === 'intermedio' ? 15 : 10},
        "restSeconds": 30,
        "notes": "Realiza un salto explosivo al final de cada repetición"
      },
      {
        "name": "Sprint en el Sitio",
        "sets": 4,
        "reps": 45,
        "restSeconds": 15,
        "notes": "Duración en segundos. Levanta bien las rodillas mantiendo un ritmo elevado"
      }
    ],
    "notes": "Descansa 1 minuto entre rondas completas. Realiza 3-4 rondas según tu nivel de condición física"
  },
  {
    "name": "Definición Muscular ${difficulty === 'avanzado' ? 'Elite' : difficulty === 'intermedio' ? 'Plus' : 'Inicio'}",
    "description": "Entrenamiento enfocado en tonificar músculos y mejorar definición corporal",
    "workoutType": "${muscleGroups.includes('abs') || muscleGroups.includes('chest') ? 'strength' : 'crossfit'}",
    "difficultyLevel": "${difficulty}",
    "estimatedDuration": ${duration},
    "muscleGroups": ${JSON.stringify(muscleGroups.length > 0 ? muscleGroups : ["abs", "chest", "arms", "legs"])},
    "exercises": [
      {
        "name": "Flexiones con Elevación de Pierna",
        "sets": 3,
        "reps": 15,
        "restSeconds": 45,
        "notes": "Alterna la pierna que elevas en cada repetición"
      },
      {
        "name": "Zancadas Caminando",
        "sets": 3,
        "reps": 20,
        "restSeconds": 45,
        "notes": "10 repeticiones con cada pierna"
      },
      {
        "name": "Elevaciones Laterales con Mancuernas",
        "sets": 3,
        "reps": 15,
        "restSeconds": 45,
        "notes": "Mantén una ligera flexión en los codos durante todo el movimiento"
      },
      {
        "name": "Plancha con Toques al Hombro",
        "sets": 3,
        "reps": 20,
        "restSeconds": 45,
        "notes": "10 toques a cada hombro manteniendo la estabilidad del core"
      }${includeCardio ? `,
      {
        "name": "Saltos de Tijera",
        "sets": 3,
        "reps": 30,
        "restSeconds": 30,
        "notes": "Mantén un ritmo constante durante todas las repeticiones"
      }` : ''}
    ],
    "notes": "Enfócate en la calidad de cada repetición y mantén una técnica correcta en todo momento"
  }
]
  `;
} 