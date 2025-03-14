'use client';

import { useState } from 'react';
import { Task } from '@/types/goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

interface NewTaskForm {
  title: string;
  description: string;
  dueDate: string;
}

export function TaskList({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    dueDate: '',
  });

  const handleCreateTask = () => {
    onAddTask(newTask);
    setIsDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
    });
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          Completadas: {completedTasks} de {tasks.length} ({progress}%)
        </span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Agregar Tarea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha límite</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateTask} className="w-full">
                Crear Tarea
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleTask(task.id)}
            />
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Vence: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteTask(task.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 