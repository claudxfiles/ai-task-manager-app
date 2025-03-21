"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -right-10 top-10 w-40 h-40 rounded-full bg-white blur-2xl"></div>
        <div className="absolute -left-20 bottom-10 w-60 h-60 rounded-full bg-white blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
              ¿Listo para transformar tu vida?
            </h2>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
              Únete a miles de personas que ya han mejorado su productividad, finanzas y bienestar con SoulDream. Comienza hoy mismo, gratis.
            </p>
            
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-indigo-900/20">
                <Link href="/auth/register">
                  Comenzar gratis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-indigo-700/30">
                <Link href="/contact-sales">
                  Contactar ventas
                </Link>
              </Button>
            </motion.div>
            
            <motion.p 
              className="mt-6 text-sm text-indigo-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              No se requiere tarjeta de crédito. Prueba gratuita por 14 días en planes premium.
            </motion.p>
          </motion.div>
          
          {/* Sellos de confianza */}
          <motion.div 
            className="mt-16 grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg">
              <img 
                src="https://placehold.co/80x30/ffffff/ffffff?text=Confiable" 
                alt="Sello de confianza" 
                className="h-6 w-auto opacity-70"
              />
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg">
              <img 
                src="https://placehold.co/80x30/ffffff/ffffff?text=Seguro" 
                alt="Sello de seguridad" 
                className="h-6 w-auto opacity-70"
              />
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg">
              <img 
                src="https://placehold.co/80x30/ffffff/ffffff?text=RGPD" 
                alt="Cumplimiento RGPD" 
                className="h-6 w-auto opacity-70"
              />
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg hidden md:block">
              <img 
                src="https://placehold.co/80x30/ffffff/ffffff?text=SSL" 
                alt="Cifrado SSL" 
                className="h-6 w-auto opacity-70"
              />
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg hidden md:block">
              <img 
                src="https://placehold.co/80x30/ffffff/ffffff?text=24/7" 
                alt="Soporte 24/7" 
                className="h-6 w-auto opacity-70"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 