'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  Dumbbell, 
  TrendingUp, 
  Clock, 
  Target 
} from 'lucide-react';

export default function DashboardPage() {
  // Datos de ejemplo para el dashboard
  const stats = [
    { 
      title: 'Tareas pendientes', 
      value: '5', 
      icon: <CheckSquare className="h-8 w-8 text-indigo-600" />,
      change: '+2 desde ayer',
      trend: 'up'
    },
    { 
      title: 'Eventos hoy', 
      value: '3', 
      icon: <Calendar className="h-8 w-8 text-emerald-600" />,
      change: '1 reunión importante',
      trend: 'neutral'
    },
    { 
      title: 'Balance', 
      value: '$2,450', 
      icon: <DollarSign className="h-8 w-8 text-amber-600" />,
      change: '+$150 este mes',
      trend: 'up'
    },
    { 
      title: 'Streak de hábitos', 
      value: '12 días', 
      icon: <TrendingUp className="h-8 w-8 text-indigo-600" />,
      change: 'Mejor racha: 15 días',
      trend: 'up'
    },
  ];

  const upcomingTasks = [
    { id: 1, title: 'Completar informe mensual', dueDate: '2023-05-15', priority: 'high' },
    { id: 2, title: 'Llamar al cliente', dueDate: '2023-05-14', priority: 'medium' },
    { id: 3, title: 'Preparar presentación', dueDate: '2023-05-16', priority: 'high' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Reunión de equipo', time: '10:00 AM', duration: '1h' },
    { id: 2, title: 'Almuerzo con cliente', time: '1:00 PM', duration: '1.5h' },
  ];

  const goals = [
    { id: 1, title: 'Ahorrar para vacaciones', progress: 65, category: 'finance' },
    { id: 2, title: 'Correr 5km', progress: 40, category: 'fitness' },
    { id: 3, title: 'Aprender React', progress: 80, category: 'education' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Bienvenido a tu centro de control personal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={`text-xs ${
                  stat.trend === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : stat.trend === 'down' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <Card className="p-4 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-indigo-600" />
              Próximas tareas
            </h2>
            <a href="/dashboard/tasks" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Ver todas
            </a>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vence: {task.dueDate}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                    : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Calendar Events */}
        <Card className="p-4 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-emerald-600" />
              Eventos de hoy
            </h2>
            <a href="/dashboard/calendar" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Ver calendario
            </a>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{event.time} ({event.duration})</p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay eventos para hoy</p>
            )}
          </div>
        </Card>

        {/* Goals Progress */}
        <Card className="p-4 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Target className="mr-2 h-5 w-5 text-amber-600" />
              Progreso de metas
            </h2>
            <a href="/dashboard/goals" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Ver todas
            </a>
          </div>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900 dark:text-white">{goal.title}</p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className={`h-2.5 rounded-full ${
                      goal.category === 'finance' 
                        ? 'bg-amber-600' 
                        : goal.category === 'fitness'
                          ? 'bg-emerald-600'
                          : 'bg-indigo-600'
                    }`} 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 