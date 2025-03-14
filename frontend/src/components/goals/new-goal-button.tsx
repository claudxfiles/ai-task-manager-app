'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const categories = [
  { id: 'desarrollo-personal', label: '🧠 Desarrollo Personal', value: 'desarrollo-personal' },
  { id: 'salud', label: '🏥 Salud y Bienestar', value: 'salud' },
  { id: 'educacion', label: '📚 Educación', value: 'educacion' },
  { id: 'finanzas', label: '💰 Finanzas', value: 'finanzas' },
  { id: 'hobbies', label: '🎨 Hobbies', value: 'hobbies' },
];

export function NewGoalButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    setLoading(true);
    try {
      await api.goals.create({
        title,
        description,
        category,
        status: 'pendiente'
      });
      
      toast({
        title: "Meta creada",
        description: "La meta se ha creado exitosamente.",
      });

      // Limpiar el formulario y cerrar el diálogo
      setTitle('');
      setCategory('');
      setDescription('');
      setOpen(false);
      
      // Recargar la página para mostrar la nueva meta
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la meta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Meta</DialogTitle>
          <DialogDescription>
            Define tu meta y comienza a trabajar en ella.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              placeholder="Título de la meta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Crear Meta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 