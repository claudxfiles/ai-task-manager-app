"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Check, DumbbellIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  getWorkoutTemplates, 
  getWorkoutTemplateWithExercises, 
  createWorkoutFromTemplate 
} from "@/lib/workout";
import { 
  WorkoutTemplate, 
  WorkoutTemplateWithExercises, 
  MuscleGroup,
  WorkoutType,
  muscleGroupImages
} from "@/types/workout";

interface WorkoutTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function WorkoutTemplateSelector({
  open,
  onOpenChange,
  onSuccess,
}: WorkoutTemplateSelectorProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplateWithExercises | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<"muscle" | "type">("muscle");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user || !open) return;
      
      setIsLoading(true);
      try {
        const templatesData = await getWorkoutTemplates(user.id);
        setTemplates(templatesData);
        setFilteredTemplates(templatesData);
      } catch (error) {
        console.error("Error loading workout templates:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas de entrenamiento",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [user, open, toast]);

  useEffect(() => {
    let filtered = [...templates];
    
    // Filtrar por grupo muscular
    if (selectedMuscle !== "all") {
      filtered = filtered.filter(template => 
        template.muscle_groups && template.muscle_groups.includes(selectedMuscle)
      );
    }
    
    // Filtrar por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter(template => 
        template.workout_type === selectedType
      );
    }
    
    setFilteredTemplates(filtered);
  }, [templates, selectedMuscle, selectedType]);

  const loadTemplateDetails = async (templateId: string) => {
    if (!templateId) return;
    
    try {
      const templateData = await getWorkoutTemplateWithExercises(templateId);
      setSelectedTemplate(templateData);
    } catch (error) {
      console.error("Error loading template details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    loadTemplateDetails(templateId);
  };

  const handleFilterByMuscle = (muscle: string) => {
    setSelectedMuscle(muscle);
  };

  const handleFilterByType = (type: string) => {
    setSelectedType(type);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedTemplateId) {
      toast({
        title: "Error",
        description: "Selecciona una plantilla para continuar",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Crear entrenamiento a partir de la plantilla
      const workoutId = await createWorkoutFromTemplate(user.id, selectedTemplateId, date);
      
      toast({
        title: "Entrenamiento creado",
        description: "Se ha creado un nuevo entrenamiento a partir de la plantilla",
      });
      
      onSuccess();
      onOpenChange(false);
      
      // Navegar al detalle del entrenamiento
      router.push(`/dashboard/workout/${workoutId}`);
    } catch (error) {
      console.error("Error creating workout from template:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el entrenamiento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Seleccionar Rutina</DialogTitle>
          <DialogDescription>
            Elige una rutina predefinida según el grupo muscular o tipo de entrenamiento
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <Tabs 
            defaultValue="muscle" 
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as "muscle" | "type")}
          >
            <TabsList className="grid grid-cols-2 w-[300px] mb-4">
              <TabsTrigger value="muscle">Por Grupo Muscular</TabsTrigger>
              <TabsTrigger value="type">Por Tipo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="muscle" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedMuscle === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterByMuscle("all")}
                >
                  Todos
                </Button>
                {Object.entries(MuscleGroup).map(([name, value]) => (
                  <Button
                    key={value}
                    variant={selectedMuscle === value ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleFilterByMuscle(value)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="type" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterByType("all")}
                >
                  Todos
                </Button>
                {Object.entries(WorkoutType).map(([name, value]) => (
                  <Button
                    key={value}
                    variant={selectedType === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterByType(value)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="border rounded-md">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <DumbbellIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No hay plantillas disponibles con los filtros seleccionados</p>
              </div>
            ) : (
              <RadioGroup 
                value={selectedTemplateId} 
                onValueChange={handleTemplateSelect}
                className="divide-y"
              >
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer",
                      selectedTemplateId === template.id && "bg-muted/50"
                    )}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={template.id} id={template.id} />
                      <div>
                        <Label 
                          htmlFor={template.id} 
                          className="text-base font-medium cursor-pointer"
                        >
                          {template.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {template.muscle_groups && template.muscle_groups.map((muscle) => (
                            <div key={muscle} className="flex items-center gap-1">
                              {muscleGroupImages[muscle] && (
                                <div className="relative w-4 h-4">
                                  <Image
                                    src={muscleGroupImages[muscle]}
                                    alt={muscle}
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {template.estimated_duration} min
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          {selectedTemplate && (
            <div className="border rounded-md p-4 bg-muted/30">
              <h3 className="font-medium text-lg">{selectedTemplate.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{selectedTemplate.description}</p>
              
              <h4 className="font-medium mb-2">Ejercicios incluidos:</h4>
              <ul className="space-y-2">
                {selectedTemplate.exercises.map((exercise, index) => (
                  <li key={index} className="text-sm flex justify-between">
                    <span>{exercise.name}</span>
                    <span className="text-muted-foreground">
                      {exercise.sets} series x {exercise.reps || "-"} reps
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Fecha para el entrenamiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedTemplateId || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? "Creando..." : "Crear Entrenamiento"}
            {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 