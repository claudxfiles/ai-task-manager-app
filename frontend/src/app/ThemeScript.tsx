'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    // Al montar el componente, comprobamos si hay un tema guardado
    const savedTheme = localStorage.getItem('theme');
    
    // Si no hay tema guardado, comprobamos la preferencia del sistema
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    } else {
      // Si hay tema guardado, lo aplicamos
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);
  
  // No renderizamos nada, es solo un script
  return null;
} 