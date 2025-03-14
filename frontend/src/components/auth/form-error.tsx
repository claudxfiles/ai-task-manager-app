"use client";

import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormErrorProps {
  message: string | null;
  className?: string;
}

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm ${className}`}
      >
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
} 