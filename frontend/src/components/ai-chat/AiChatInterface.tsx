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

// Componente para las sugerencias de chat
const ChatSuggestions = ({ onSelectSuggestion }: { onSelectSuggestion: (suggestion: string) => void }) => {
  const suggestions = [
    {
      icon: <Target className="h-4 w-4 mr-2" />,
      text: "¿Cómo puedo establecer metas SMART?"
    },
    {
      icon: <Calendar className="h-4 w-4 mr-2" />,
      text: "Ayúdame a organizar mi semana"
    },
    {
      icon: <DollarSign className="h-4 w-4 mr-2" />,
      text: "Consejos para ahorrar dinero"
    },
    {
      icon: <Dumbbell className="h-4 w-4 mr-2" />,
      text: "Sugiéreme una rutina de ejercicios"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelectSuggestion(suggestion.text)}
          className="flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
        >
          {suggestion.icon}
          <span className="truncate">{suggestion.text}</span>
        </button>
      ))}
    </div>
  );
};

// Componente principal del chat
export function AiChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "¡Hola! Soy tu asistente personal en SoulDream. ¿En qué puedo ayudarte hoy?",
      sender: 'ai',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función para desplazarse al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Desplazarse al final cuando se añaden nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para manejar el envío de mensajes
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Generar un ID único para el mensaje
    const messageId = Date.now().toString();
    
    // Añadir el mensaje del usuario
    const userMessage: Message = {
      id: messageId,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Simular una respuesta de la IA (en una implementación real, aquí se llamaría a la API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar el estado del mensaje del usuario
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        )
      );
      
      // Generar respuesta de la IA
      const aiResponse = generateAiResponse(inputValue);
      
      // Añadir la respuesta de la IA
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      // Manejar errores
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'error' } : msg
        )
      );
      console.error('Error al enviar mensaje:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar la selección de sugerencias
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // Función para generar respuestas de la IA (simulada)
  const generateAiResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('meta') || lowerCaseMessage.includes('smart')) {
      return "Las metas SMART son Específicas, Medibles, Alcanzables, Relevantes y con Tiempo definido. Para establecer una meta SMART:\n\n1. Específica: Define claramente qué quieres lograr\n2. Medible: Establece criterios para medir el progreso\n3. Alcanzable: Asegúrate de que sea realista\n4. Relevante: Debe alinearse con tus objetivos más amplios\n5. Tiempo definido: Establece un plazo\n\n¿Quieres que te ayude a formular una meta SMART específica?";
    }
    
    if (lowerCaseMessage.includes('organizar') || lowerCaseMessage.includes('semana')) {
      return "Para organizar tu semana eficientemente, te recomiendo:\n\n1. Dedica 30 minutos cada domingo para planificar\n2. Identifica tus 3 prioridades principales para la semana\n3. Bloquea tiempo para tareas importantes en tu calendario\n4. Incluye tiempo para descanso y autocuidado\n5. Revisa tu progreso diariamente\n\n¿Te gustaría que creemos un plan semanal juntos?";
    }
    
    if (lowerCaseMessage.includes('ahorra') || lowerCaseMessage.includes('dinero')) {
      return "Aquí tienes algunos consejos para ahorrar dinero:\n\n1. Crea un presupuesto mensual detallado\n2. Automatiza tus ahorros (10-20% de tus ingresos)\n3. Reduce gastos innecesarios como suscripciones no utilizadas\n4. Compara precios antes de compras importantes\n5. Establece metas de ahorro específicas\n6. Considera inversiones a largo plazo\n\n¿Quieres que te ayude a crear un plan de ahorro personalizado?";
    }
    
    if (lowerCaseMessage.includes('ejercicio') || lowerCaseMessage.includes('rutina')) {
      return "Aquí tienes una rutina de ejercicios básica que puedes hacer en casa:\n\n• Calentamiento (5 min): Saltos, rotaciones de brazos\n• Fuerza (15 min):\n  - 3 series de 10 sentadillas\n  - 3 series de 10 flexiones (adaptadas a tu nivel)\n  - 3 series de 30 segundos de plancha\n• Cardio (10 min): Saltos de tijera, mountain climbers\n• Estiramiento (5 min)\n\nRecuerda adaptar la intensidad a tu nivel y consultar con un profesional si tienes condiciones médicas.\n\n¿Quieres una rutina más específica?";
    }
    
    return "Gracias por tu mensaje. Estoy aquí para ayudarte con la gestión de tareas, hábitos, finanzas, fitness y más. ¿Hay algo específico en lo que pueda asistirte hoy?";
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat con IA</h1>
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <Card className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Sugerencias */}
        {messages.length < 3 && (
          <ChatSuggestions onSelectSuggestion={handleSelectSuggestion} />
        )}
        
        {/* Área de entrada */}
        <div className="mt-auto">
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Paperclip size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-3 py-2 text-gray-900 dark:text-white"
            />
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Mic size={20} />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-full ${
                inputValue.trim() && !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400 flex items-center justify-center">
            <Sparkles size={12} className="mr-1" />
            Potenciado por IA • Tus datos están seguros y son privados
          </p>
        </div>
      </Card>
    </div>
  );
} 