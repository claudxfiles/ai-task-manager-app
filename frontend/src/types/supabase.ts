export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          phone: string | null;
          address: string | null;
          birth_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          birth_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          birth_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          category: string;
          description: string | null;
          date: string;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount: number;
          category: string;
          description?: string | null;
          date?: string;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          amount?: number;
          category?: string;
          description?: string | null;
          date?: string;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          deadline: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          deadline?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          deadline?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          metric_type: string;
          period: string;
          start_date: string;
          end_date: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: string;
          period: string;
          start_date: string;
          end_date: string;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: string;
          period?: string;
          start_date?: string;
          end_date?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          insight_type: string;
          description: string;
          data: Json | null;
          relevance: number | null;
          created_at: string;
          related_metrics: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          insight_type: string;
          description: string;
          data?: Json | null;
          relevance?: number | null;
          created_at?: string;
          related_metrics?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          insight_type?: string;
          description?: string;
          data?: Json | null;
          relevance?: number | null;
          created_at?: string;
          related_metrics?: Json | null;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: string[];
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency: string[];
          start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          frequency?: string[];
          start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          completion_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          completion_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          completion_date?: string;
          created_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          interval: string;
          features: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          interval?: string;
          features?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          interval?: string;
          features?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          payment_provider: string;
          payment_id: string | null;
          subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status?: string;
          payment_provider?: string;
          payment_id?: string | null;
          subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: string;
          payment_provider?: string;
          payment_id?: string | null;
          subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_history: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          payment_id: string;
          amount: number;
          currency: string;
          status: string;
          payment_method: string;
          payment_details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          payment_id: string;
          amount: number;
          currency?: string;
          status: string;
          payment_method?: string;
          payment_details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          payment_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          payment_method?: string;
          payment_details?: Json | null;
          created_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          duration_minutes: number | null;
          notes: string | null;
          workout_type: string | null;
          calories_burned: number | null;
          feeling_rating: number | null;
          muscle_groups: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          date?: string;
          duration_minutes?: number | null;
          notes?: string | null;
          workout_type?: string | null;
          calories_burned?: number | null;
          feeling_rating?: number | null;
          muscle_groups?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          duration_minutes?: number | null;
          notes?: string | null;
          workout_type?: string | null;
          calories_burned?: number | null;
          feeling_rating?: number | null;
          muscle_groups?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          name: string;
          sets: number;
          reps: number | null;
          weight: number | null;
          duration_seconds: number | null;
          distance: number | null;
          units: string | null;
          notes: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          name: string;
          sets: number;
          reps?: number | null;
          weight?: number | null;
          duration_seconds?: number | null;
          distance?: number | null;
          units?: string | null;
          notes?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workout_id?: string;
          name?: string;
          sets?: number;
          reps?: number | null;
          weight?: number | null;
          duration_seconds?: number | null;
          distance?: number | null;
          units?: string | null;
          notes?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercise_templates: {
        Row: {
          id: string;
          name: string;
          muscle_group: string;
          exercise_type: string;
          description: string | null;
          instructions: string | null;
          video_url: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          muscle_group: string;
          exercise_type: string;
          description?: string | null;
          instructions?: string | null;
          video_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          muscle_group?: string;
          exercise_type?: string;
          description?: string | null;
          instructions?: string | null;
          video_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          workout_type: string;
          estimated_duration: number | null;
          difficulty_level: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          workout_type: string;
          estimated_duration?: number | null;
          difficulty_level?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          workout_type?: string;
          estimated_duration?: number | null;
          difficulty_level?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_template_exercises: {
        Row: {
          id: string;
          template_id: string;
          exercise_template_id: string | null;
          name: string;
          sets: number;
          reps: number | null;
          weight: number | null;
          duration_seconds: number | null;
          distance: number | null;
          units: string | null;
          notes: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          exercise_template_id?: string | null;
          name: string;
          sets: number;
          reps?: number | null;
          weight?: number | null;
          duration_seconds?: number | null;
          distance?: number | null;
          units?: string | null;
          notes?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          exercise_template_id?: string | null;
          name?: string;
          sets?: number;
          reps?: number | null;
          weight?: number | null;
          duration_seconds?: number | null;
          distance?: number | null;
          units?: string | null;
          notes?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_progress: {
        Row: {
          id: string;
          user_id: string;
          exercise_name: string;
          max_weight: number | null;
          max_reps: number | null;
          max_duration: number | null;
          max_distance: number | null;
          start_date: string;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_name: string;
          max_weight?: number | null;
          max_reps?: number | null;
          max_duration?: number | null;
          max_distance?: number | null;
          start_date?: string;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_name?: string;
          max_weight?: number | null;
          max_reps?: number | null;
          max_duration?: number | null;
          max_distance?: number | null;
          start_date?: string;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 