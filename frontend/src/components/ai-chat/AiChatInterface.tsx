'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Paperclip, 
  MoreVertical, 
  Sparkles, 
  Clock, 
  Calendar, 
  DollarSign, 
  Dumbbell, 
  Target 
} from 'lucide-react';
import { GoalChatIntegration } from './GoalChatIntegration';
import { Goal } from '@/components/goals/GoalsDashboard';
import { useRouter } from 'next/navigation';

// Tipos para los mensajes
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

// Componente para un mensaje individual
const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className={`text-xs mt-1 ${isUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {message.status === 'sending' && ' · Enviando...'}
          {message.status === 'error' && ' · Error al enviar'}
        </div>
      </div>
    </div>
  );
};

// Componente para sugerencias de chat
const ChatSuggestions = ({ onSelectSuggestion }: { onSelectSuggestion: (suggestion: string) => void }) => {
  const suggestions = [
    {
      icon: <Target className="h-4 w-4" />,
      text: "Ayúdame a establecer una meta financiera"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      text: "¿Cómo puedo organizar mejor mi tiempo?"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      text: "Necesito planificar mi semana"
    },
    {
      icon: <DollarSign className="h-4 w-4" />,
      text: "Quiero ahorrar para comprar una moto"
    },
    {
      icon: <Dumbbell className="h-4 w-4" />,
      text: "Ayúdame con una rutina de ejercicios"
    }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={() => onSelectSuggestion(suggestion.text)}
        >
          <span className="mr-2 text-indigo-600 dark:text-indigo-400">{suggestion.icon}</span>
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

export function AiChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "¡Hola! Soy tu asistente personal en SoulDream. ¿En qué puedo ayudarte hoy?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [createdGoals, setCreatedGoals] = useState<Partial<Goal>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Crear un nuevo mensaje del usuario
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };
    
    // Actualizar el estado con el mensaje del usuario
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLastUserMessage(inputValue);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Llamar a la API de OpenRouter
      const response = await fetch('/api/v1/ai/openrouter-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: "qwen/qwq-32b:online" // Puedes cambiar el modelo según tus necesidades
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al comunicarse con la API');
      }
      
      const data = await response.json();
      
      // Actualizar el estado del mensaje a enviado
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
      
      // Añadir respuesta de la IA
      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Actualizar el estado del mensaje a error
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
      
      // Añadir mensaje de error
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        content: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleCreateGoal = (goalData: Partial<Goal>) => {
    // Añadir la meta a la lista de metas creadas
    setCreatedGoals(prev => [...prev, goalData]);
    
    // Generar respuesta de la IA confirmando la creación de la meta
    const aiResponse = `¡Excelente! He creado una meta para "${goalData.title}". 
    
He generado un plan personalizado con pasos a seguir para alcanzar esta meta. Puedes verlo en la sección de Metas.

¿Te gustaría que te ayude a establecer los pasos específicos para alcanzar esta meta?`;
    
    // Añadir respuesta de la IA
    const aiMessage: Message = {
      id: `msg-${Date.now()}`,
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, aiMessage]);
  };

  const handleViewGoals = () => {
    // Navegar a la página de metas
    router.push('/dashboard/goals');
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <Card className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {/* Componente de integración de metas */}
          {lastUserMessage && (
            <GoalChatIntegration 
              message={lastUserMessage} 
              onCreateGoal={handleCreateGoal} 
            />
          )}
          
          {/* Mostrar botón para ver metas creadas */}
          {createdGoals.length > 0 && (
            <div className="flex justify-center my-4">
              <button 
                className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm flex items-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                onClick={handleViewGoals}
              >
                <Target className="h-4 w-4 mr-2" />
                Ver {createdGoals.length} {createdGoals.length === 1 ? 'meta creada' : 'metas creadas'}
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {messages.length === 1 && (
          <ChatSuggestions onSelectSuggestion={handleSelectSuggestion} />
        )}
        
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="w-full p-3 pr-12 border rounded-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </Card>
    </div>
  );
} 