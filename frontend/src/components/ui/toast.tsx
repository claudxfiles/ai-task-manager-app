import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  onClose: () => void;
}

export function Toast({ title, description, variant = 'default', onClose }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
        variant === 'destructive' ? 'bg-red-600' : 'bg-green-600'
      } text-white min-w-[300px] max-w-md`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: any[]; onClose: (toast: any) => void }) {
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <Toast key={index} {...toast} onClose={() => onClose(toast)} />
        ))}
      </AnimatePresence>
    </div>
  );
} 