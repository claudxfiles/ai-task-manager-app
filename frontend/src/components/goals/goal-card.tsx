'use client';

import { Goal, Task } from '@/types/goals';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskList } from './task-list';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddTask?: (goalId: string, task: Partial<Task>) => void;
  onToggleTask?: (goalId: string, taskId: string) => void;
  onDeleteTask?: (goalId: string, taskId: string) => void;
}

export function GoalCard({
  goal,
  onUpdateGoal,
  onDeleteGoal,
  onAddTask,
  onToggleTask,
  onDeleteTask
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddTask = (task: Partial<Task>) => {
    if (onAddTask) {
      onAddTask(goal.id, task);
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (onToggleTask) {
      onToggleTask(goal.id, taskId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(goal.id, taskId);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="font-medium">{goal.title}</h4>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateGoal(goal.id, { status: "pendiente" })}>
                Marcar como Pendiente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateGoal(goal.id, { status: "en progreso" })}>
                Marcar En Progreso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateGoal(goal.id, { status: "completada" })}>
                Marcar como Completada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteGoal(goal.id)}>
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs",
            {
              "bg-red-100 text-red-800": goal.priority === "alta",
              "bg-yellow-100 text-yellow-800": goal.priority === "media",
              "bg-green-100 text-green-800": goal.priority === "baja"
            }
          )}>
            {goal.priority}
          </span>
          <span className="text-xs text-muted-foreground">
            Vence: {new Date(goal.dueDate).toLocaleDateString()}
          </span>
        </div>

        {goal.isProject && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-between"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>Tareas del proyecto</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {isExpanded && (
              <div className="pt-4">
                <TaskList
                  tasks={goal.tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 