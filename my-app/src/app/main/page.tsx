'use client';

import ReportCard, { Report } from '@/src/components/ReportCard';
import MobileLayout from '@/src/layout/MobileLayout';
import { useSchedule } from '@/src/contexts/ScheduleContext';
import { useSession } from 'next-auth/react';
import { ScheduleListLoading } from '@/src/components/ScheduleList';
import ScheduleListContent from '@/src/components/ScheduleList';
import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const MainPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const { schedules, refetch, isLoading } = useSchedule();
  const router = useRouter();

  // 페이지가 보일 때 스케줄 새로고침 (다른 페이지에서 돌아올 때)
  useEffect(() => {
    // 페이지가 보일 때마다 실행 (visibilitychange 이벤트)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // refetch를 의존성에서 제거하여 무한 루프 방지
  // Context에서 가져온 스케줄 데이터 변환
  const transformedSchedules = schedules.map((schedule) => ({
    id: schedule.id,
    time: schedule.time,
    location: schedule.venue || schedule.location || '',
    status: schedule.status as
      | 'pending'
      | 'ongoing'
      | 'upcoming'
      | 'completed'
      | 'canceled'
      | 'wakeup'
      | 'departure'
      | 'arrival',
    currentStep: (schedule.currentStep ?? 0) as 0 | 1 | 2 | 3,
  }));

  // 가장 가까운 시간의 스케줄 상태를 확인하여 보고 완료 여부 판단
  // 순서: 기상(wakeup) -> 출발(departure) -> 도착(arrival) -> 종료(completed)
  const getReportStatus = useCallback(
    (reportType: string) => {
      if (schedules.length === 0) return false;

      // 가장 가까운 시간의 스케줄 (첫 번째 스케줄, 이미 시간 순으로 정렬됨)
      const nearestSchedule = schedules[0];
      const scheduleStatus = nearestSchedule.status;

      // 보고 순서에 따라 해당 단계 이상이면 disabled
      switch (reportType) {
        case 'wakeup':
          // 기상 보고: wakeup 이상이면 disabled
          return (
            scheduleStatus === 'wakeup' ||
            scheduleStatus === 'departure' ||
            scheduleStatus === 'arrival' ||
            scheduleStatus === 'completed'
          );
        case 'departure':
          // 출발 보고: departure 이상이면 disabled
          return (
            scheduleStatus === 'departure' ||
            scheduleStatus === 'arrival' ||
            scheduleStatus === 'completed'
          );
        case 'arrival':
          // 도착 보고: arrival 이상이면 disabled
          return scheduleStatus === 'arrival' || scheduleStatus === 'completed';
        case 'completed':
          // 종료 보고: completed이면 disabled
          return scheduleStatus === 'completed';
        default:
          return false;
      }
    },
    [schedules]
  );

  // 보고 순서 체크 함수
  const checkReportOrder = useCallback(
    (reportType: string): boolean => {
      if (schedules.length === 0) return true;

      const nearestSchedule = schedules[0];
      const scheduleStatus = nearestSchedule.status;

      switch (reportType) {
        case 'departure':
          // 출발보고는 기상보고가 완료되어야 함
          if (
            scheduleStatus !== 'wakeup' &&
            scheduleStatus !== 'departure' &&
            scheduleStatus !== 'arrival' &&
            scheduleStatus !== 'completed'
          ) {
            alert('기상 보고를 먼저 완료해주세요.');
            return false;
          }
          return true;
        case 'arrival':
          // 도착보고는 출발보고가 완료되어야 함
          if (
            scheduleStatus !== 'departure' &&
            scheduleStatus !== 'arrival' &&
            scheduleStatus !== 'completed'
          ) {
            alert('출발 보고를 먼저 완료해주세요.');
            return false;
          }
          return true;
        case 'completed':
          // 종료보고는 도착보고가 완료되어야 함
          if (scheduleStatus !== 'arrival' && scheduleStatus !== 'completed') {
            alert('도착 보고를 먼저 완료해주세요.');
            return false;
          }
          return true;
        default:
          return true;
      }
    },
    [schedules]
  );

  // 보고 카드 클릭 핸들러
  const handleReportClick = useCallback(
    (reportType: string, href: string) => {
      if (checkReportOrder(reportType)) {
        router.push(href);
      }
    },
    [checkReportOrder, router]
  );

  const reportCards: Report[] = useMemo(
    () => [
      {
        title: '기상 보고',
        description: `오늘의 스케줄을 보고\n기상을 보고 할 수 있어요`,
        icon: '/images/icons/alarm.png',
        href: '/morning-report',
        disabled: getReportStatus('wakeup'),
      },
      {
        title: '출발 보고',
        description: '오늘 스케줄을 보고\n출발을 보고 할 수 있어요',
        icon: '/images/icons/departure.png',
        href: '/departure-report',
        disabled: getReportStatus('departure'),
        onClick: () => handleReportClick('departure', '/departure-report'),
      },
      {
        title: '도착 보고',
        description: '촬영 장소에 도착하셨나요?\n 도착 보고를 할 수 있어요',
        icon: '/images/icons/arrival.png',
        href: '/arrival-report',
        disabled: getReportStatus('arrival'),
        onClick: () => handleReportClick('arrival', '/arrival-report'),
      },
      {
        title: '종료 보고',
        description: '촬영을 마치 셨나요?\n 종료 보고를 할 수 있어요',
        icon: '/images/icons/completed.png',
        href: '/completed-report',
        disabled: getReportStatus('completed'),
        onClick: () => handleReportClick('completed', '/completed-report'),
      },
    ],
    [getReportStatus, handleReportClick]
  );

  const scheduleManagementCard: Report = useMemo(
    () => ({
      title: '내 스케줄 확정/확인',
      description: '스케줄을 한 번에 확인하거나\n 확정할 수 있어요',
      icon: '/images/icons/calendar.png',
      href: '/schedule-management',
    }),
    []
  );

  return (
    <MobileLayout>
      <section className='flex flex-col items-center gap-[18px] py-[18px] px-[14px]'>
        {/* 금일 스케쥴 상황 */}
        <div className='flex flex-col gap-[20px] w-full bg-white border border-line-edge rounded-xl p-[14px]'>
          {/* Title */}
          <div className='flex items-center justify-between'>
            <h1 className='text-body4 text-normal font-semibold'>
              {userName ? `${userName}님, ` : ''}금일 스케쥴 진행상황
            </h1>
            <span className='text-caption2 text-default'>
              총 {transformedSchedules.length}건
            </span>
          </div>

          {/* Schedule List */}
          <div className='flex flex-col gap-[20px]'>
            {isLoading ? (
              <ScheduleListLoading />
            ) : transformedSchedules.length === 0 ? (
              <p className='text-caption1 text-default text-center py-[20px]'>
                오늘 해당하는 스케줄이 없습니다.
              </p>
            ) : (
              <ScheduleListContent schedules={transformedSchedules} />
            )}
          </div>
        </div>

        {/* 보고 List */}
        <div className='grid grid-cols-2 gap-[10px] w-full'>
          {/* 보고 카드들 - 스케줄이 있을 때만 표시 */}
          {!isLoading && transformedSchedules.length > 0 && (
            <>
              {reportCards.map((report, index) => (
                <ReportCard key={index} report={report} />
              ))}
            </>
          )}
          {/* 스케줄 관리 카드 - 항상 표시 */}
          <ReportCard report={scheduleManagementCard} />
        </div>
      </section>
    </MobileLayout>
  );
};

export default MainPage;
