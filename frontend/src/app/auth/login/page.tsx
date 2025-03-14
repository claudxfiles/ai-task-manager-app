"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FormError } from "@/components/auth/form-error";
import { PasswordInput } from "@/components/auth/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  // Mostrar error de URL si existe
  useEffect(() => {
    if (error) {
      setFormError("Hubo un problema con la autenticación. Por favor, inténtalo de nuevo.");
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formError) setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.email) {
      setFormError("Por favor, ingresa tu correo electrónico");
      return;
    }
    
    if (!formData.password) {
      setFormError("Por favor, ingresa tu contraseña");
      return;
    }
    
    // Si las credenciales son las del usuario demo, usar la ruta de demo
    if (formData.email === "demo@example.com" && formData.password === "demo123") {
      handleDemoLogin();
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Credenciales incorrectas. Inténtalo de nuevo.");
        return;
      }

      // Mostrar toast de éxito
      toast.success("Inicio de sesión exitoso", {
        description: "Redirigiendo al dashboard..."
      });

      router.push(callbackUrl);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setFormError("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simular un retraso para la experiencia de usuario
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Establecer una cookie para la sesión demo
      Cookies.set('demo_session', 'true', { expires: 1 });
      
      // Establecer datos de usuario demo en localStorage para simular una sesión
      localStorage.setItem('demoUser', JSON.stringify({
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Usuario Demo',
        role: 'user',
        credits: 1000
      }));
      
      // Mostrar toast de éxito
      toast.success("Inicio de sesión demo exitoso", {
        description: "Redirigiendo al dashboard..."
      });
      
      // Redirigir al dashboard
      router.push(callbackUrl);
    } catch (error) {
      console.error("Error al iniciar sesión demo:", error);
      setFormError("Error al iniciar sesión demo. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al inicio
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-soul-purple to-soul-blue flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <Card className="border-soul-purple/20 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignInButton 
              variant="default" 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full"
              text="Iniciar Sesión con Google" 
            />
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="demo@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="focus:border-soul-purple focus:ring-soul-purple/20"
                  aria-invalid={formError && !formData.email ? "true" : "false"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-soul-purple hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <PasswordInput
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="focus:border-soul-purple focus:ring-soul-purple/20"
                    aria-invalid={formError && !formData.password ? "true" : "false"}
                  />
                </div>
              </div>
              
              <FormError message={formError} />
              
              <LoadingButton 
                type="submit" 
                variant="purple"
                className="w-full" 
                isLoading={isLoading}
                loadingText="Iniciando sesión..."
              >
                Iniciar Sesión
              </LoadingButton>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  O prueba con
                </span>
              </div>
            </div>
            
            <LoadingButton 
              variant="outline" 
              className="w-full" 
              onClick={handleDemoLogin}
              isLoading={isLoading}
              loadingText="Iniciando sesión demo..."
            >
              Cuenta Demo
            </LoadingButton>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className="text-soul-purple hover:underline">
              Regístrate
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 