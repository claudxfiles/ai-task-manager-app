'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';

export default function FinancePage() {
  return (
    <DashboardLayout>
      <FinanceDashboard />
    </DashboardLayout>
  );
} 