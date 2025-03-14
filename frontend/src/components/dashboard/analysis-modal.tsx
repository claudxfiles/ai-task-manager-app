'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Brain, Loader2 } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    finanzas: number;
    workout: number;
    metas: number;
    habitos: number;
    productividad: number;
  };
}

export function AnalysisModal({ isOpen, onClose, metrics }: AnalysisModalProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada a la API de IA
      const demoAnalysis = `Basado en tus métricas actuales:

1. Fortalezas:
   ✓ Excelente consistencia en hábitos (92%)
   ✓ Buen progreso en workout (78%)
   ✓ Crecimiento positivo en finanzas (+12.5%)

2. Áreas de mejora:
   • Las metas generales están en 45% - Considera dividirlas en objetivos más pequeños
   • La productividad puede mejorarse desde 76%

3. Recomendaciones:
   • Aplica las estrategias exitosas de hábitos a tus metas
   • Mantén el impulso en finanzas y workout
   • Establece recordatorios diarios para tus objetivos

¡Vas por buen camino! Enfócate en mantener tu consistencia mientras trabajas en tus metas paso a paso.`;

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación de delay
      setAnalysis(demoAnalysis);
    } catch (error) {
      console.error('Error al generar análisis:', error);
      setAnalysis('Lo siento, hubo un error al generar el análisis. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-soul-purple" />
            Análisis Inteligente de Progreso
          </DialogTitle>
          <DialogDescription>
            Análisis detallado de tu rendimiento y recomendaciones personalizadas
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {!analysis && !loading && (
            <button
              onClick={generateAnalysis}
              className="w-full py-4 px-6 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-soul-purple/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-soul-purple"
            >
              <Brain className="w-5 h-5" />
              Generar análisis
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-soul-purple" />
            </div>
          )}

          {analysis && !loading && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 