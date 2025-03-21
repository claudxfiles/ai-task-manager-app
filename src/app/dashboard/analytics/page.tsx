import React from 'react';
import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analítica | SoulDream',
  description: 'Visualiza y analiza tus datos de productividad, finanzas, metas y hábitos.',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <AnalyticsDashboard />
    </div>
  );
} 