"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  Target,
  Calendar,
  Settings,
  BarChart,
  X,
  Brain,
  Activity,
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  Wallet,
  Dumbbell,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Metas",
    href: "/dashboard/goals",
    icon: Target
  },
  {
    name: "Hábitos",
    href: "/dashboard/habits",
    icon: Activity
  },
  {
    name: "Finanzas",
    href: "/dashboard/finances",
    icon: Wallet
  },
  {
    name: "Workout",
    href: "/dashboard/workout",
    icon: Dumbbell
  },
  {
    name: "Chat con IA",
    href: "/dashboard/ai-chat",
    icon: MessageSquare
  },
  {
    name: "Calendario",
    href: "/dashboard/calendar",
    icon: Calendar
  },
  {
    name: "Analítica",
    href: "/dashboard/analytics",
    icon: BarChart2
  },
  {
    name: "Planes",
    href: "/pricing",
    icon: CreditCard
  },
  {
    name: "Ajustes",
    href: "/dashboard/settings",
    icon: Settings
  }
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-background border-r p-6 transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button - mobile only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 md:hidden"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-soul-purple to-soul-blue flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">SoulDream</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "bg-muted text-foreground font-medium"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}