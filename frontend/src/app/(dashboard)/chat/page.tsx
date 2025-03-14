'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessage } from '@/components/chat/chat-message';
import { useToast } from '@/components/ui/use-toast';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    try {
      // Agregar mensaje del usuario
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      // Enviar mensaje al backend
      const response = await api.chat.send(message);

      // Si se creó una meta, disparar evento
      if (response.goal_created) {
        window.dispatchEvent(new Event('goalCreated'));
        toast({
          title: "Meta creada",
          description: "Tu meta ha sido creada y puedes verla en la sección de Metas.",
        });
      }

      // Agregar respuesta del asistente
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} role={message.role} content={message.content} />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
} 