'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TaskBoard } from '@/components/tasks/TaskBoard';

export default function TasksPage() {
  return (
    <DashboardLayout>
      <TaskBoard />
    </DashboardLayout>
  );
} 