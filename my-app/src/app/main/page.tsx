import ReportCard, { Report } from '@/src/components/ReportCard';
import MobileLayout from '@/src/layout/MobileLayout';
import { getServerSession } from 'next-auth';
import { getTodaySchedules } from '@/src/lib/schedules';
import { ScheduleListLoading } from '@/src/components/ScheduleList';
import ScheduleListWrapper from '@/src/components/ScheduleListWrapper';
import ScheduleCount from '@/src/components/ScheduleCount';
import { Suspense } from 'react';
import { authOptions } from '@/src/lib/auth';
import { NextAuthOptions } from 'next-auth';

const MainPage = async () => {
  const session = await getServerSession(authOptions as NextAuthOptions);
  const userName = session?.user?.name || '';

  // 서버에서 스케줄 데이터 가져오기 (Promise로 전달하여 스트리밍 가능)
  const schedulesPromise = getTodaySchedules();

  const reports: Report[] = [
    {
      title: '기상 보고',
      description: `오늘의 스케줄을 보고\n기상을 보고 할 수 있어요`,
      icon: '/images/icons/alarm.png',
      href: '/morning-report',
    },
    {
      title: '출발 보고',
      description: '오늘 스케줄을 보고\n출발을 보고 할 수 있어요',
      icon: '/images/icons/departure.png',
      href: '/departure-report',
    },
    {
      title: '도착 보고',
      description: '촬영 장소에 도착하셨나요?\n 도착 보고를 할 수 있어요',
      icon: '/images/icons/arrival.png',
      href: '/arrival-report',
    },
    {
      title: '종료 보고',
      description: '촬영을 마치 셨나요?\n 종료 보고를 할 수 있어요',
      icon: '/images/icons/completed.png',
      href: '/completed-report',
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
            <Suspense
              fallback={
                <span className='text-caption2 text-default'>총 ...건</span>
              }
            >
              <ScheduleCount schedulesPromise={schedulesPromise} />
            </Suspense>
          </div>

          {/* Schedule List */}
          <div className='flex flex-col gap-[20px]'>
            <Suspense fallback={<ScheduleListLoading />}>
              <ScheduleListWrapper schedulesPromise={schedulesPromise} />
            </Suspense>
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
