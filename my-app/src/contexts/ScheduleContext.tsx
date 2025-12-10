'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Schedule } from '@/src/types/schedule';

interface ScheduleContextType {
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

interface ScheduleProviderProps {
  children: ReactNode;
  initialSchedules: Schedule[];
}

export function ScheduleProvider({
  children,
  initialSchedules,
}: ScheduleProviderProps) {
  return (
    <ScheduleContext.Provider
      value={{
        schedules: initialSchedules,
        isLoading: false,
        error: null,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

