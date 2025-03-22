'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  TooltipRoot, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

type FixedTooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

export function FixedTooltip({ content, children }: FixedTooltipProps) {
  // Envolver el children en un div para asegurarnos de que es un único elemento
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {/* Pasamos un único elemento React como hijo */}
          <span>{children}</span>
        </TooltipTrigger>
        <TooltipContent>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

// Componente especializado para botones con tooltip
type TooltipButtonProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function TooltipButton({ 
  content, 
  children,
  onClick, 
  disabled = false,
  variant = 'ghost',
  size = 'icon'
}: TooltipButtonProps) {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            onClick={onClick}
            disabled={disabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
} 