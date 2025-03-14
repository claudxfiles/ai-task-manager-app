"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Send, Brain, User, RefreshCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

function formatTime() {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

const initialMessages: Message[] = [{
  id: 1,
  content: "¡Hola! Soy tu asistente personal de SoulDream. Cuéntame sobre tu meta y te crearé un plan detallado para alcanzarla.",
  sender: "ai",
  timestamp: formatTime(),
}];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    
    // Agregar mensaje del usuario
    const newMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: "user" as const,
      timestamp: formatTime()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          model: "qwen/qwq-32b:online"
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: data.response,
        sender: "ai",
        timestamp: formatTime()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.",
        sender: "ai",
        timestamp: formatTime()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-b from-background to-background/80 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Chat con IA</h1>
            <p className="text-sm text-muted-foreground">Tu asistente personal</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMessages(initialMessages)}
          className="hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 p-3 rounded-lg",
                message.sender === "user" ? "bg-muted/50" : "bg-primary/5"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
                {message.sender === "user" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Brain className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{message.timestamp}</p>
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background/50">
        <div className="relative">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            className="pr-20 resize-none bg-background"
            rows={1}
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              isSending && "opacity-50 cursor-not-allowed"
            )}
            disabled={!inputMessage.trim() || isSending}
          >
            {isSending ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 