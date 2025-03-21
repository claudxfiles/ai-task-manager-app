import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | SoulDream',
  description: 'Gestiona tus metas, hábitos, finanzas y más en un solo lugar.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Aquí iría el sidebar de navegación */}
        <div className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 