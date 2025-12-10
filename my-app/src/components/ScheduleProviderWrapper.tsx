'use client';

import { ScheduleProvider } from '@/src/contexts/ScheduleContext';
import type { Schedule } from '@/src/types/schedule';

interface ScheduleProviderWrapperProps {
  children: React.ReactNode;
  initialSchedules: Schedule[];
}

export default function ScheduleProviderWrapper({
  children,
  initialSchedules,
}: ScheduleProviderWrapperProps) {
  return (
    <ScheduleProvider initialSchedules={initialSchedules}>
      {children}
    </ScheduleProvider>
  );
}

