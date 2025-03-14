"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Por favor, completa todos los campos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': formData.email,
          'password': formData.password,
        })
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
      // Redirigir al dashboard después del inicio de sesión exitoso
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': 'demo@example.com',
          'password': 'demo123',
        })
      });

      if (!response.ok) {
        throw new Error('Error al iniciar sesión demo');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión demo:", error);
      setError("Error al iniciar sesión demo. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4">
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
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="********" 
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Cuenta Demo
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 