import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Dashboard | SoulDream',
  description: 'Tu centro de control personal para gestionar metas, hábitos, finanzas y más.',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Módulo de Metas */}
        <Link href="/dashboard/goals">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Metas</CardTitle>
              <CardDescription>Gestiona tus objetivos y metas personales</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Visualiza y actualiza el progreso de tus metas.</p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Módulo de Finanzas */}
        <Link href="/dashboard/finance">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Finanzas</CardTitle>
              <CardDescription>Administra tus ingresos y gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Controla tus finanzas y planifica tus ahorros.</p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Módulo de Hábitos */}
        <Link href="/dashboard/habits">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Hábitos</CardTitle>
              <CardDescription>Seguimiento de tus hábitos diarios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Construye buenos hábitos y mantén tus rachas.</p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Módulo de Ejercicio */}
        <Link href="/dashboard/workout">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Ejercicio</CardTitle>
              <CardDescription>Registro de tus actividades físicas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Realiza seguimiento de tus entrenamientos y progresos.</p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Módulo de Calendario */}
        <Link href="/dashboard/calendar">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Agenda y planificación</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Visualiza tus eventos y tareas programadas.</p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Módulo de Analítica */}
        <Link href="/dashboard/analytics">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Analítica</CardTitle>
              <CardDescription>Estadísticas y visualizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Analiza tus patrones y progreso en todas las áreas.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 