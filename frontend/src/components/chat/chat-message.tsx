'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        role === 'user' ? 'bg-muted/50' : 'bg-primary/5'
      )}
    >
      <div className="h-6 w-6 flex-shrink-0">
        {role === 'user' ? (
          <User className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
} 