'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  Dumbbell, 
  TrendingUp, 
  Brain, 
  Clock, 
  ArrowRight,
  Target,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/hero/Hero';
import { FeatureSection } from '@/components/landing/features/FeatureSection';
import { TestimonialsSection } from '@/components/landing/testimonials/TestimonialsSection';
import { PricingSection } from '@/components/landing/pricing/PricingSection';
import { FaqSection } from '@/components/landing/faq/FaqSection';
import { CtaSection } from '@/components/landing/cta/CtaSection';
import { Footer } from '@/components/landing/footer/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-400">SoulDream</span>
          </div>
          <nav className="hidden md:flex space-x-10">
            <Link href="#caracteristicas" className="hover:text-indigo-400 transition-colors">
              Características
            </Link>
            <Link href="#precios" className="hover:text-indigo-400 transition-colors">
              Precios
            </Link>
            <Link href="#testimonios" className="hover:text-indigo-400 transition-colors">
              Testimonios
            </Link>
            <Link href="#faq" className="hover:text-indigo-400 transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="hover:text-indigo-400 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Tu vida organizada en 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"> una sola plataforma</span>
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Gestiona tus metas, hábitos, finanzas y fitness con ayuda de inteligencia artificial. Optimiza tu productividad y bienestar con una herramienta todo en uno.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-center font-medium transition-colors flex items-center justify-center">
                  Comenzar gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#caracteristicas" className="border border-gray-600 hover:border-gray-400 text-white px-6 py-3 rounded-md text-center font-medium transition-colors">
                  Ver funcionalidades
                </Link>
              </div>
              <div className="flex items-center mt-6 text-sm text-gray-400 space-x-6">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-2" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-2" />
                  <span>14 días prueba completa</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mr-2" />
                  <span>Cancelación fácil</span>
                </div>
              </div>
            </div>
            
            {/* Dashboard Preview */}
            <div className="lg:w-1/2 relative">
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-lg font-semibold text-indigo-400">SoulDream Dashboard</span>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-400">HÁBITO DESTACADO</p>
                          <h3 className="text-md font-bold text-white mt-1">Meditación</h3>
                          <div className="flex items-center mt-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <p className="text-xs text-gray-300">7 días consecutivos</p>
                          </div>
                        </div>
                        <div className="p-2 bg-green-900/30 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-400">FINANZAS</p>
                          <h3 className="text-md font-bold text-white mt-1">$3,650</h3>
                          <div className="flex items-center mt-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <p className="text-xs text-green-400">+15% este mes</p>
                          </div>
                        </div>
                        <div className="p-2 bg-amber-900/30 rounded-lg">
                          <DollarSign className="h-4 w-4 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-3">
                      <CheckSquare className="h-4 w-4 text-indigo-400 mr-2" />
                      <h3 className="text-sm font-semibold text-white">Tareas pendientes</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 bg-gray-600/50 rounded">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                        <p className="text-xs text-white">Completar informe mensual</p>
                      </div>
                      <div className="flex items-center p-2 bg-gray-600/50 rounded">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></div>
                        <p className="text-xs text-white">Reunión con cliente</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Target className="h-4 w-4 text-indigo-400 mr-2" />
                      <h3 className="text-sm font-semibold text-white">Metas en progreso</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs text-white">Comprar moto</p>
                          <span className="text-xs text-gray-400">35%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs text-white">Aprender desarrollo web</p>
                          <span className="text-xs text-gray-400">60%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notifications */}
                  <div className="absolute top-32 right-4 max-w-[220px]">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg mb-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">Hábito completado</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ¡Has mantenido tu racha por 7 días consecutivos!
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                          <span className="text-purple-500 text-xs">🔹</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">Finanzas</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Has ahorrado un 15% más que el mes pasado
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white dark:bg-gray-800">
        {/* Features content */}
      </section>

      <main>
        <FeatureSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
