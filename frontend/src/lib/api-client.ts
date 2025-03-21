import axios from 'axios';
import { createClientComponent } from './supabase';

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token de autenticación en cada solicitud
apiClient.interceptors.request.use(async (config) => {
  try {
    const supabase = createClientComponent();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (session) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log(`Petición autenticada: ${config.url} - Token disponible`);
    } else {
      console.warn(`Petición sin autenticación: ${config.url} - No hay sesión activa`);
    }
    
    console.log(`Realizando petición a: ${config.url}`, config);
  } catch (error) {
    console.error('Error obteniendo la sesión:', error);
  }
  
  return config;
}, (error) => {
  console.error('Error en la solicitud:', error);
  return Promise.reject(error);
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Respuesta recibida de ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      console.error(`Error en la respuesta: ${error.response.status} ${error.message} ${originalRequest.url}`);
      
      // Mostrar más detalles sobre el error
      console.error('Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        // Añadir el payload enviado para depuración
        requestData: originalRequest.data ? JSON.parse(originalRequest.data) : null
      });
      
      // Si el error tiene un cuerpo de respuesta con mensaje, mostrarlo
      if (error.response.data && error.response.data.detail) {
        console.error(`Mensaje de error del servidor: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('Error: No se recibió respuesta del servidor', error.request);
    } else {
      // Algo ocurrió al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    // Si el error es 401 (no autorizado) y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Intentando refrescar la sesión debido a error 401');
        // Intentar refrescar la sesión
        const supabase = createClientComponent();
        const { data } = await supabase.auth.refreshSession();
        const session = data.session;
        
        if (session) {
          // Actualizar el token en la solicitud original y reintentarla
          console.log('Sesión refrescada correctamente, reintentando solicitud');
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        } else {
          console.log('No se pudo refrescar la sesión, redirigiendo al login');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      } catch (refreshError) {
        console.error('Error refrescando la sesión:', refreshError);
        // Redirigir al login si no se pudo refrescar el token
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
); 