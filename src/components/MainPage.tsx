'use client';

import ReportCard, { Report } from '@/src/components/ReportCard';
import MobileLayout from '@/src/layout/MobileLayout';
import { useSchedule } from '@/src/contexts/ScheduleContext';
import { useSession } from 'next-auth/react';
import { ScheduleListLoading } from '@/src/components/ScheduleList';
import ScheduleListContent, {
  type Schedule as ScheduleListSchedule,
} from '@/src/components/ScheduleList';
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const { schedules, isLoading } = useSchedule();
  const router = useRouter();

  const transformedSchedules: ScheduleListSchedule[] = schedules.map((schedule) => ({
    id: schedule.id,
    time: schedule.time,
    location: schedule.venue || schedule.location || '',
    status: (schedule.reportStatus || 'pending') as
      | 'pending'
      | 'ongoing'
      | 'upcoming'
      | 'completed'
      | 'canceled'
      | 'wakeup'
      | 'wakeup_delayed'
      | 'departure'
      | 'departure_delayed'
      | 'arrival'
      | 'arrival_delayed'
      | 'delayed',
    currentStep: (schedule.currentStep ?? 0) as 0 | 1 | 2 | 3,
  }));

  const getReportStatus = useCallback(
    (reportType: string) => {
      if (schedules.length === 0) return false;
      const nearestSchedule = schedules[0];
      const scheduleStatus = nearestSchedule.reportStatus || 'pending';
      switch (reportType) {
        case 'wakeup':
          return (
            scheduleStatus === 'wakeup' ||
            scheduleStatus === 'wakeup_delayed' ||
            scheduleStatus === 'departure' ||
            scheduleStatus === 'departure_delayed' ||
            scheduleStatus === 'arrival' ||
            scheduleStatus === 'arrival_delayed' ||
            scheduleStatus === 'delayed' ||
            scheduleStatus === 'completed'
          );
        case 'departure':
          return (
            scheduleStatus === 'departure' ||
            scheduleStatus === 'departure_delayed' ||
            scheduleStatus === 'arrival' ||
            scheduleStatus === 'arrival_delayed' ||
            scheduleStatus === 'delayed' ||
            scheduleStatus === 'completed'
          );
        case 'arrival':
          return (
            scheduleStatus === 'arrival' ||
            scheduleStatus === 'arrival_delayed' ||
            scheduleStatus === 'delayed' ||
            scheduleStatus === 'completed'
          );
        case 'completed':
          return scheduleStatus === 'completed';
        default:
          return false;
      }
    },
    [schedules]
  );

  const checkReportOrder = useCallback(
    (reportType: string): boolean => {
      if (schedules.length === 0) return true;
      const nearestSchedule = schedules[0];
      const scheduleStatus = nearestSchedule.reportStatus || 'pending';
      switch (reportType) {
        case 'departure':
          if (scheduleStatus === 'wakeup_delayed') {
            alert('기상 지연되었습니다.');
            return false;
          }
          if (
            scheduleStatus !== 'wakeup' &&
            scheduleStatus !== 'departure' &&
            scheduleStatus !== 'departure_delayed' &&
            scheduleStatus !== 'arrival' &&
            scheduleStatus !== 'arrival_delayed' &&
            scheduleStatus !== 'delayed' &&
            scheduleStatus !== 'completed'
          ) {
            alert('기상 보고를 먼저 완료해주세요.');
            return false;
          }
          return true;
        case 'arrival':
          if (
            scheduleStatus !== 'departure' &&
            scheduleStatus !== 'departure_delayed' &&
            scheduleStatus !== 'arrival' &&
            scheduleStatus !== 'arrival_delayed' &&
            scheduleStatus !== 'delayed' &&
            scheduleStatus !== 'completed'
          ) {
            alert('출발 보고를 먼저 완료해주세요.');
            return false;
          }
          return true;
        case 'completed':
          if (
            scheduleStatus !== 'arrival' &&
            scheduleStatus !== 'arrival_delayed' &&
            scheduleStatus !== 'delayed' &&
            scheduleStatus !== 'completed'
          ) {
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

  const handleReportClick = useCallback(
    (reportType: string, href: string) => {
      if (checkReportOrder(reportType)) {
        router.push(href);
      }
    },
    [checkReportOrder, router]
  );

  const nearestReportStatus = schedules[0]?.reportStatus || 'pending';

  const reportCards: Report[] = useMemo(
    () => [
      {
        title: '기상 보고',
        description: `오늘의 스케줄을 보고\n기상을 보고 할 수 있어요`,
        icon: '/images/icons/alarm.png',
        href: '/morning-report',
        disabled: getReportStatus('wakeup'),
        onClick: () => {
          if (nearestReportStatus === 'wakeup_delayed') {
            alert('기상 지연되었습니다.');
            return;
          }
          handleReportClick('wakeup', '/morning-report');
        },
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
    [getReportStatus, handleReportClick, nearestReportStatus]
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
        <div className='flex flex-col gap-[20px] w-full bg-white border border-line-edge rounded-xl p-[14px]'>
          <div className='flex items-center justify-between'>
            <h1 className='text-body4 text-normal font-semibold'>
              {userName ? `${userName}님, ` : ''}금일 스케줄 진행상황
            </h1>
            <span className='text-caption2 text-default'>
              총 {transformedSchedules.length}건
            </span>
          </div>

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

        <div className='grid grid-cols-2 gap-[10px] w-full'>
          {!isLoading && transformedSchedules.length > 0 && (
            <>
              {reportCards.map((report, index) => (
                <ReportCard key={index} report={report} />
              ))}
            </>
          )}
          <ReportCard report={scheduleManagementCard} />
        </div>
      </section>
    </MobileLayout>
  );
}
