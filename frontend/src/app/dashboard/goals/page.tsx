'use client';

import React from 'react';
import { GoalsDashboard } from '@/components/goals/GoalsDashboard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Mis Metas</h1>
        <GoalsDashboard />
      </div>
    </DashboardLayout>
  );
} 