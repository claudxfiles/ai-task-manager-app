import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-orange-500/10 via-orange-500/10 to-orange-500/5 border-b border-orange-500/20 backdrop-blur-sm",
        className
      )}
    >
      <div className="container flex items-center gap-1 px-2 py-0.5 text-xs text-orange-600">
        <AlertCircle className="h-3 w-3" />
        <p>
          <span className="font-medium">Modo Demo</span> - Los cambios no se guardarán
        </p>
      </div>
    </div>
  );
} 