'use client';

import MobileLayout from '@/src/layout/MobileLayout';
import PageHeader from '@/src/components/PageHeader';
import MainSection from '@/src/components/MainSection';
import Button from '@/src/components/Button';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import ContentLayout from '@/src/components/ContentLayout';
import { useSchedule } from '@/src/contexts/ScheduleContext';
import { useSession } from 'next-auth/react';
import { formatScheduleDate } from '@/src/lib/utiles';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MorningReportPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const { schedules } = useSchedule();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 스케줄 데이터를 ScheduleInfoData 형식으로 변환
  const scheduleData: ScheduleInfoData[] = schedules.map((schedule) => ({
    groom: schedule.groom || '',
    bride: schedule.bride || '',
    date: formatScheduleDate(schedule.date, schedule.time),
    location: schedule.location || '',
    venue: schedule.venue || '',
    memo: schedule.memo || '',
  }));

  const handleWakeupReport = async () => {
    if (schedules.length === 0) {
      alert('보고할 스케줄이 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 첫 번째 스케줄에 대해 기상 보고
      const scheduleId = schedules[0].id;
      const response = await fetch('/api/reports/wakeup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기상 보고에 실패했습니다.');
      }

      // 완료 페이지로 이동 (status를 쿼리 파라미터로 전달)
      router.push('/report-success?status=wakeup');
    } catch (error) {
      console.error('기상 보고 오류:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '기상 보고 중 오류가 발생했습니다.';
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout>
      <PageHeader title='기상 보고' />
      <ContentLayout>
        <MainSection
          icon={{
            src: '/images/icons/alarm.png',
            alt: 'alarm',
            width: 60,
            height: 60,
          }}
          title={`${userName}님 하루를 시작할 준비가 되셨나요 ?`}
          description='오늘 진행될 일정을 확인하고 기상 보고를 해주세요'
        />

        {/* 스케쥴 정보 */}
        <div className='flex flex-col gap-[10px] w-full'>
          {scheduleData.length === 0 ? (
            <p className='text-caption1 text-default text-center py-[20px]'>
              오늘의 스케줄이 없습니다.
            </p>
          ) : (
            scheduleData.map((schedule, index) => (
              <ScheduleInfo key={index} schedule={schedule} />
            ))
          )}
        </div>

        <Button
          text={isLoading ? '보고 중...' : '기상 보고하기'}
          onClick={handleWakeupReport}
          disabled={isLoading || scheduleData.length === 0}
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default MorningReportPage;
