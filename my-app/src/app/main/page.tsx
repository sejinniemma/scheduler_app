'use client';

import ReportCard, { Report } from '@/src/components/ReportCard';
import MobileLayout from '@/src/layout/MobileLayout';
import { useSchedule } from '@/src/contexts/ScheduleContext';
import { useSession } from 'next-auth/react';
import { ScheduleListLoading } from '@/src/components/ScheduleList';
import ScheduleListContent from '@/src/components/ScheduleList';

const MainPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const { schedules } = useSchedule();

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
      | 'canceled',
    currentStep: 0 as 0 | 1 | 2 | 3,
  }));

  // 스케줄의 status를 확인하여 보고 완료 여부 판단
  const getReportStatus = (reportType: string) => {
    if (schedules.length === 0) return false;

    const scheduleStatus = schedules[0].status;

    switch (reportType) {
      case 'wakeup':
        return scheduleStatus === 'wakeup';
      case 'departure':
        return scheduleStatus === 'departure';
      case 'arrival':
        return scheduleStatus === 'arrival';
      case 'completed':
        return scheduleStatus === 'completed';
      default:
        return false;
    }
  };

  const reports: Report[] = [
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
    },
    {
      title: '도착 보고',
      description: '촬영 장소에 도착하셨나요?\n 도착 보고를 할 수 있어요',
      icon: '/images/icons/arrival.png',
      href: '/arrival-report',
      disabled: getReportStatus('arrival'),
    },
    {
      title: '종료 보고',
      description: '촬영을 마치 셨나요?\n 종료 보고를 할 수 있어요',
      icon: '/images/icons/completed.png',
      href: '/completed-report',
      disabled: getReportStatus('completed'),
    },
    {
      title: '내 스케줄 확정/확인',
      description: '스케줄을 한 번에 확인하거나\n 확정할 수 있어요',
      icon: '/images/icons/calendar.png',
      href: '/schedule-management',
    },
  ];

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
            {transformedSchedules.length === 0 ? (
              <ScheduleListLoading />
            ) : (
              <ScheduleListContent schedules={transformedSchedules} />
            )}
          </div>
        </div>

        {/* 보고 List */}
        <div className='grid grid-cols-2 gap-[10px] w-full'>
          {reports.map((report, index) => (
            <ReportCard key={index} report={report} />
          ))}
        </div>
      </section>
    </MobileLayout>
  );
};

export default MainPage;
