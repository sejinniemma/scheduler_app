'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_TODAY_SCHEDULES } from '@/src/client/graphql/Schedule';
import { getToday } from '@/src/lib/utiles';
import type { Schedule } from '@/src/types/schedule';

interface ScheduleContextType {
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
  refreshSchedules: () => Promise<unknown>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

interface ScheduleProviderProps {
  children: ReactNode;
  initialSchedules: Schedule[];
}

export function ScheduleProvider({
  children,
  initialSchedules,
}: ScheduleProviderProps) {
  // today를 useMemo로 메모이제이션하여 매 렌더링마다 새로 생성되지 않도록 함
  const today = useMemo(() => getToday(), []);

  const {
    data,
    loading,
    error,
    refetch: refetchQuery,
  } = useQuery<{ schedules: Schedule[] }>(GET_TODAY_SCHEDULES, {
    variables: { date: today },
    // 캐시를 사용하되, 필요시 네트워크 요청
    fetchPolicy: 'cache-and-network',
  });

  // 에러 로깅
  if (error) {
    console.error('스케줄 가져오기 오류:', error);
  }

  const schedules: Schedule[] = data?.schedules || initialSchedules || [];
  const isLoading = loading;
  const errorMessage = error ? error.message : null;
  console.log('schedules', schedules);
  // refetch 함수를 useCallback으로 메모이제이션하여 매번 새로 생성되지 않도록 함
  const refetch = useCallback(async () => {
    await refetchQuery({ variables: { date: getToday() } });
  }, [refetchQuery]);

  // refreshSchedules는 refetch의 별칭
  const refreshSchedules = refetch;

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        isLoading,
        error: errorMessage,
        refetch,
        refreshSchedules,
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
