'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wallet, Dumbbell, Target, Activity, ArrowRight, TrendingUp, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const modules = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Finanzas',
      description: 'Gestiona tus finanzas personales y alcanza la libertad financiera',
      href: '/dashboard/finances',
      color: 'from-green-500 to-emerald-700',
      progress: 65,
      stats: {
        label: 'Ahorro mensual',
        value: '+12.5%'
      }
    },
    {
      icon: <Dumbbell className="w-6 h-6" />,
      title: 'Workout',
      description: 'Mantén un estilo de vida saludable y alcanza tus metas físicas',
      href: '/dashboard/workout',
      color: 'from-red-500 to-rose-700',
      progress: 78,
      stats: {
        label: 'Objetivos cumplidos',
        value: '8/10'
      }
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Metas',
      description: 'Define y alcanza tus objetivos personales y profesionales',
      href: '/dashboard/goals',
      color: 'from-blue-500 to-indigo-700',
      progress: 45,
      stats: {
        label: 'Progreso general',
        value: '45%'
      }
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Hábitos',
      description: 'Desarrolla hábitos positivos y transforma tu vida',
      href: '/dashboard/habits',
      color: 'from-purple-500 to-violet-700',
      progress: 92,
      stats: {
        label: 'Consistencia',
        value: '92%'
      }
    }
  ];

  const handleAnalysis = async () => {
    // TODO: Implementar análisis con IA
    console.log('Analizando progreso...');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Tu progreso general es excelente. ¡Sigue así!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Productividad: 76%</span>
          </div>
          <Button 
            onClick={handleAnalysis}
            className="bg-gradient-to-r from-soul-purple to-soul-blue hover:opacity-90 transition-opacity"
          >
            <Brain className="w-4 h-4 mr-2" />
            Análisis IA
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {modules.map((module, index) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={module.href} className="block">
              <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                      {module.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{module.stats.label}</span>
                      <span className="font-medium">{module.stats.value}</span>
                    </div>
                    <Progress 
                      value={module.progress} 
                      className="h-1.5 bg-muted"
                      indicatorClassName={`bg-gradient-to-r ${module.color}`}
                    />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}