import WorkoutTracker from "@/components/workout/WorkoutTracker";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Metadata } from "next";
import { DumbbellIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Rastreador de Entrenamiento | SoulDream",
  description: "Registra tu progreso en tiempo real durante tus entrenamientos",
};

export default function WorkoutTrackerPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Rastreador de Entrenamiento"
        description="Registra tu progreso en tiempo real durante tus entrenamientos"
        icon={<DumbbellIcon className="h-6 w-6 text-indigo-500" />}
      />
      <div className="grid gap-8">
        <WorkoutTracker />
      </div>
    </div>
  );
} 