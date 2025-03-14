"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import Cookies from "js-cookie";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  className = "",
  showIcon = true,
  children
}: LogoutButtonProps) {
  const router = useRouter();
  const { isDemoSession } = useAuthStatus();

  const handleLogout = async () => {
    if (isDemoSession) {
      // Eliminar la cookie de sesión demo
      Cookies.remove("demo_session");
      
      // Eliminar los datos del usuario demo
      localStorage.removeItem("demoUser");
      
      // Redirigir a la página de inicio de sesión
      router.push("/auth/login");
    } else {
      // Cerrar sesión de NextAuth
      await signOut({ callbackUrl: "/auth/login" });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {children || "Cerrar sesión"}
    </Button>
  );
} 