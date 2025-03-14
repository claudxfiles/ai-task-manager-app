"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, MoreVertical, Trophy, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Goal, Task, GoalStatus, GoalPriority, LifeAreaType, LIFE_AREAS } from "@/types/goals";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewGoalButton } from '@/components/goals/new-goal-button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { GoalCard } from '@/components/goals/goal-card';

interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

interface Project {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: "alta" | "media" | "baja";
  status: "pendiente" | "en progreso" | "completada";
  tasks: Task[];
  points: number;
}

interface LifeArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  projects: Project[];
}

interface FinancialAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: "checking" | "savings" | "investment" | "credit";
}

// Datos de ejemplo para la tabla de clasificación
const leaderboardData = [
  { id: 1, name: "Carlos Rodríguez", points: 1250, avatar: "/avatars/user1.png" },
  { id: 2, name: "María López", points: 980, avatar: "/avatars/user2.png" },
  { id: 3, name: "Tu", points: 820, avatar: "/avatars/user3.png", isCurrentUser: true },
  { id: 4, name: "Juan Pérez", points: 750, avatar: "/avatars/user4.png" },
  { id: 5, name: "Ana García", points: 620, avatar: "/avatars/user5.png" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "Dólar estadounidense" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "MXN", symbol: "$", name: "Peso mexicano" },
  { code: "CLP", symbol: "$", name: "Peso chileno" },
  // Añade más monedas según necesites
];

const ProjectCard = ({ 
  project, 
  onUpdateProject, 
  onDeleteProject, 
  onToggleTask 
}: { 
  project: Project;
  onUpdateProject: (projectId: number, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: number) => void;
  onToggleTask: (projectId: number, taskId: number) => void;
}) => {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{project.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdateProject(project.id, {})}>
              Editar proyecto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteProject(project.id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {project.description && (
        <p className="text-sm text-muted-foreground">{project.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
          {project.priority}
        </span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Progreso</span>
          <span>{calculateProgress(project)}%</span>
        </div>
        <Progress value={calculateProgress(project)} className="h-2" />
      </div>
      
      {project.tasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">
            Tareas ({project.tasks.filter(t => t.completed).length}/{project.tasks.length})
          </p>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <button 
                  onClick={() => onToggleTask(project.id, task.id)}
                  className="flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-sm text-muted-foreground">
        Fecha límite: {new Date(project.dueDate).toLocaleDateString()}
      </p>
      
      {project.points > 0 && (
        <div className="flex items-center gap-1 text-sm">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{project.points} puntos</span>
        </div>
      )}
    </Card>
  );
};

interface NewGoalForm {
  title: string;
  description: string;
  dueDate: string;
  priority: GoalPriority;
  category: LifeAreaType | '';
  isProject: boolean;
}

const CATEGORY_ALL = 'all' as const;
type CategoryType = LifeAreaType | typeof CATEGORY_ALL;

const CATEGORIES: Record<CategoryType, { label: string; icon: string }> = {
  [CATEGORY_ALL]: { label: 'Todas', icon: '📋' },
  'desarrollo-personal': { label: 'Desarrollo Personal', icon: '🎯' },
  'salud-bienestar': { label: 'Salud y Bienestar', icon: '💪' },
  'educacion': { label: 'Educación', icon: '📚' },
  'finanzas': { label: 'Finanzas', icon: '💰' },
  'hobbies': { label: 'Hobbies', icon: '🎨' },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CATEGORY_ALL);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoalForm>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'media',
    category: '',
    isProject: false,
  });

  useEffect(() => {
    fetchGoals();

    // Suscribirse a eventos de actualización de metas
    const handleGoalCreated = () => {
      console.log("Nueva meta detectada, actualizando lista...");
      fetchGoals();
    };

    window.addEventListener('goalCreated', handleGoalCreated);
    
    return () => {
      window.removeEventListener('goalCreated', handleGoalCreated);
    };
  }, []);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await api.goals.list();
      setGoals(response);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.category) return;
    
    try {
      const goalData: Partial<Goal> = {
        ...newGoal,
        status: 'pendiente' as const,
        progress: 0,
        tasks: [],
        isProject: newGoal.isProject || false,
        category: newGoal.category as LifeAreaType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await api.goals.create(goalData);
      setGoals([...goals, response]);
      setIsDialogOpen(false);
      setNewGoal({
        title: '',
        description: '',
        dueDate: '',
        priority: 'media',
        category: '',
        isProject: false,
      });
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const response = await api.goals.update(goalId, updates);
      setGoals(goals.map(goal => goal.id === goalId ? response : goal));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.goals.delete(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleAddTask = async (goalId: string, taskData: Partial<Task>) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newTask: Task = {
        id: Math.random().toString(),
        title: taskData.title || '',
        description: taskData.description || '',
        completed: false,
        dueDate: taskData.dueDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedGoal: Goal = {
        ...goal,
        tasks: [...goal.tasks, newTask],
      };

      const response = await api.goals.update(goalId, updatedGoal);
      setGoals(goals.map(g => g.id === goalId ? response : g));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (goalId: string, taskId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedTasks = goal.tasks.map((task: Task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );

      const updatedGoal = {
        ...goal,
        tasks: updatedTasks,
        progress: Math.round((updatedTasks.filter((t: Task) => t.completed).length / updatedTasks.length) * 100),
      };

      const response = await api.goals.update(goalId, updatedGoal);
      setGoals(goals.map(g => g.id === goalId ? response : g));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (goalId: string, taskId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedTasks = goal.tasks.filter((task: Task) => task.id !== taskId);
      const updatedGoal = {
        ...goal,
        tasks: updatedTasks,
        progress: updatedTasks.length > 0
          ? Math.round((updatedTasks.filter((t: Task) => t.completed).length / updatedTasks.length) * 100)
          : 0,
      };

      const response = await api.goals.update(goalId, updatedGoal);
      setGoals(goals.map(g => g.id === goalId ? response : g));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filterGoalsByStatus = (goals: Goal[], status: GoalStatus) => {
    return goals.filter(goal => goal.status === status);
  };

  const filterGoalsByCategory = (goals: Goal[], category: CategoryType) => {
    return category === CATEGORY_ALL ? goals : goals.filter(goal => goal.category === category);
  };

  return (
    <ApiErrorBoundary>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Metas y Proyectos</h2>
            <p className="text-muted-foreground">
              Gestiona tus metas y proyectos por categorías
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha límite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newGoal.dueDate}
                    onChange={e => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={value => setNewGoal({ ...newGoal, priority: value as GoalPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={value => setNewGoal({ ...newGoal, category: value as LifeAreaType | '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LIFE_AREAS).map(([key, area]) => (
                        <SelectItem key={key} value={key}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isProject"
                    checked={newGoal.isProject}
                    onChange={e => setNewGoal({ ...newGoal, isProject: e.target.checked })}
                  />
                  <Label htmlFor="isProject">Es un proyecto con tareas</Label>
                </div>
                <Button onClick={handleCreateGoal} className="w-full">
                  Crear Meta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue={CATEGORY_ALL} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            {Object.entries(CATEGORIES).map(([value, { label, icon }]) => (
              <TabsTrigger key={value} value={value} className="rounded-sm">
                {icon} {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(CATEGORIES).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Sección Pendiente */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Pendiente</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filterGoalsByStatus(filterGoalsByCategory(goals, category as CategoryType), 'pendiente').map(goal => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdateGoal={handleUpdateGoal}
                        onDeleteGoal={handleDeleteGoal}
                        onAddTask={handleAddTask}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    ))}
                  </div>
                </div>

                {/* Sección En Progreso */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">En Progreso</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filterGoalsByStatus(filterGoalsByCategory(goals, category as CategoryType), 'en progreso').map(goal => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdateGoal={handleUpdateGoal}
                        onDeleteGoal={handleDeleteGoal}
                        onAddTask={handleAddTask}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    ))}
                  </div>
                </div>

                {/* Sección Completada */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Completada</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filterGoalsByStatus(filterGoalsByCategory(goals, category as CategoryType), 'completada').map(goal => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdateGoal={handleUpdateGoal}
                        onDeleteGoal={handleDeleteGoal}
                        onAddTask={handleAddTask}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ApiErrorBoundary>
  );
}

function getPriorityColor(priority: GoalPriority) {
  switch (priority) {
    case "alta":
      return "bg-red-100 text-red-800";
    case "media":
      return "bg-yellow-100 text-yellow-800";
    case "baja":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusColor(status: GoalStatus) {
  switch (status) {
    case "pendiente":
      return "bg-gray-100 text-gray-800";
    case "en progreso":
      return "bg-blue-100 text-blue-800";
    case "completada":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function calculateProgress(project: Project): number {
  if (project.tasks.length === 0) return 0;
  const completedTasks = project.tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / project.tasks.length) * 100);
} 