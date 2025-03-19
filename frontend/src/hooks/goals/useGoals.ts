import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GoalsService } from '@/lib/goals/goals-service';
import { useGoalsStore } from '@/store/goals/useGoalsStore';
import type { Goal, SubGoal, GoalStep } from '@/store/goals/useGoalsStore';
import { useToast } from '@/components/ui/use-toast';

export function useGoals(userId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    setGoals,
    addGoal,
    updateGoal: updateGoalInStore,
    deleteGoal: deleteGoalFromStore,
    addSubGoal: addSubGoalToStore,
    addGoalStep: addGoalStepToStore,
    updateGoalStep: updateGoalStepInStore,
    setError,
    setLoading,
  } = useGoalsStore();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ['goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('userId', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createGoal = useMutation({
    mutationFn: async (newGoal: Omit<Goal, 'id'>) => {
      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async (updatedGoal: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updatedGoal)
        .eq('id', updatedGoal.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  // Create sub-goal
  const { mutate: createSubGoal } = useMutation<
    SubGoal,
    Error,
    Omit<SubGoal, 'id' | 'createdAt' | 'updatedAt'>
  >({
    mutationFn: (subGoal) => GoalsService.createSubGoal(subGoal),
    onSuccess: (data) => {
      addSubGoalToStore(data);
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
      toast({
        title: 'Success',
        description: 'Sub-goal created successfully',
      });
    },
    onError: (error) => {
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to create sub-goal',
        variant: 'destructive',
      });
    },
  });

  // Create goal step
  const { mutate: createGoalStep } = useMutation<
    GoalStep,
    Error,
    Omit<GoalStep, 'id' | 'createdAt' | 'updatedAt'>
  >({
    mutationFn: (goalStep) => GoalsService.createGoalStep(goalStep),
    onSuccess: (data) => {
      addGoalStepToStore(data);
      queryClient.invalidateQueries({ queryKey: ['goalSteps', data.goalId] });
      toast({
        title: 'Success',
        description: 'Goal step created successfully',
      });
    },
    onError: (error) => {
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to create goal step',
        variant: 'destructive',
      });
    },
  });

  // Update goal step
  const { mutate: updateGoalStep } = useMutation<
    GoalStep,
    Error,
    { id: string; updates: Partial<GoalStep> }
  >({
    mutationFn: ({ id, updates }) => GoalsService.updateGoalStep(id, updates),
    onSuccess: (data) => {
      updateGoalStepInStore(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['goalSteps', data.goalId] });
      toast({
        title: 'Success',
        description: 'Goal step updated successfully',
      });
    },
    onError: (error) => {
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to update goal step',
        variant: 'destructive',
      });
    },
  });

  // Fetch goal steps
  const getGoalSteps = (goalId: string) =>
    useQuery<GoalStep[], Error>({
      queryKey: ['goalSteps', goalId],
      queryFn: () => GoalsService.getGoalSteps(goalId),
      onError: (error: Error) => {
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to fetch goal steps',
          variant: 'destructive',
        });
      },
    });

  // Fetch sub-goals
  const getSubGoals = (parentGoalId: string) =>
    useQuery<SubGoal[], Error>({
      queryKey: ['subGoals', parentGoalId],
      queryFn: () => GoalsService.getSubGoals(parentGoalId),
      onError: (error: Error) => {
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to fetch sub-goals',
          variant: 'destructive',
        });
      },
    });

  return {
    goals,
    isLoading,
    createGoal: createGoal.mutateAsync,
    updateGoal: updateGoal.mutateAsync,
    deleteGoal: deleteGoal.mutateAsync,
    createSubGoal,
    createGoalStep,
    updateGoalStep,
    getGoalSteps,
    getSubGoals,
  };
} 