import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Crear una instancia de axios con la configuración base
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token de autenticación en cada petición
api.interceptors.request.use(
  (config) => {
    // Obtener el token de sesión del localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    // Si hay un token, añadirlo a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores comunes
    const message = error.response?.data?.detail || error.message || 'Ha ocurrido un error';
    
    // Mostrar toast de error
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Redirigir a la página de login si no está autenticado
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
); 