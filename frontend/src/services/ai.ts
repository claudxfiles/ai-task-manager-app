import { api } from '@/lib/axios';

export interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatCompletionRequest {
  message: string;
  model?: string;
  messageHistory?: Array<{
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  }>;
}

export interface ChatCompletionResponse {
  response: string;
  has_goal?: boolean;
  metadata?: any;
}

export interface GoalMetadata {
  title: string;
  description: string;
  area: string;
  type: string;
  target_date?: string;
  priority: 'high' | 'medium' | 'low';
  steps?: string[];
}

export interface PersonalizedPlanRequest {
  user_data: any;
  goal_type: string;
  preferences?: {
    preferred_time_blocks?: string[];
    difficulty_preference?: 'easy' | 'moderate' | 'challenging' | 'balanced';
    priority_areas?: string[];
    learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'balanced';
  };
}

export interface PatternAnalysisRequest {
  user_data: any;
}

export interface LearningAdaptationRequest {
  user_data: any;
  interaction_history: Array<{
    recommendation_id: string;
    recommendation_type: string;
    recommendation_content: string;
    user_response: 'accepted' | 'rejected' | 'modified' | 'ignored';
    success_rating?: number;
    feedback?: string;
    timestamp: Date;
  }>;
}

export const aiService = {
  /**
   * Envía un mensaje al chat de IA
   */
  async sendChatMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await api.post('/api/v1/ai/openrouter-chat', request);
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje al chat de IA:', error);
      throw error;
    }
  },

  /**
   * Detecta si un mensaje contiene una meta
   */
  async detectGoal(message: string): Promise<{ has_goal: boolean; goal_metadata?: GoalMetadata }> {
    try {
      const response = await api.post('/api/v1/ai/detect-goal', { message });
      return response.data;
    } catch (error) {
      console.error('Error al detectar meta:', error);
      throw error;
    }
  },

  /**
   * Genera un plan detallado para una meta
   */
  async generateGoalPlan(goalMetadata: GoalMetadata): Promise<any> {
    try {
      const response = await api.post('/api/v1/ai/generate-goal-plan', { goal_metadata: goalMetadata });
      return response.data;
    } catch (error) {
      console.error('Error al generar plan para meta:', error);
      throw error;
    }
  },

  /**
   * Genera un plan personalizado basado en datos del usuario
   */
  async generatePersonalizedPlan(request: PersonalizedPlanRequest): Promise<any> {
    try {
      const response = await api.post('/api/v1/ai/generate-personalized-plan', request);
      return response.data;
    } catch (error) {
      console.error('Error al generar plan personalizado:', error);
      throw error;
    }
  },

  /**
   * Analiza patrones avanzados en los datos del usuario
   */
  async analyzePatterns(request: PatternAnalysisRequest): Promise<any> {
    try {
      const response = await api.post('/api/v1/ai/analyze-patterns', request);
      return response.data;
    } catch (error) {
      console.error('Error al analizar patrones:', error);
      throw error;
    }
  },

  /**
   * Genera adaptaciones basadas en aprendizaje continuo
   */
  async generateLearningAdaptation(request: LearningAdaptationRequest): Promise<any> {
    try {
      const response = await api.post('/api/v1/ai/learning-adaptation', request);
      return response.data;
    } catch (error) {
      console.error('Error al generar adaptación de aprendizaje:', error);
      throw error;
    }
  }
}; 