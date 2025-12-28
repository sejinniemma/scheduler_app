'use client';

import MobileLayout from '@/src/layout/MobileLayout';
import PageHeader from '@/src/components/PageHeader';
import MainSection from '@/src/components/MainSection';
import Button from '@/src/components/Button';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import ContentLayout from '@/src/components/ContentLayout';
import { useSession } from 'next-auth/react';
import { formatScheduleDate } from '@/src/lib/utiles';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  UPDATE_WAKEUP_REPORT,
  GET_REPORTS_BY_SCHEDULE,
} from '@/src/client/graphql/Report';
import { GET_SCHEDULES } from '@/src/client/graphql/Schedule';
import type { Schedule } from '@/src/types/schedule';

interface GetSchedulesData {
  getTodaySchedules: Schedule[];
}

interface GetReportsByScheduleData {
  reportsBySchedule: Array<{
    id: string;
    scheduleId: string;
    userId: string;
    role: string;
    status: string;
    estimatedTime?: string;
    currentStep: number;
    memo?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

const MorningReportPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const router = useRouter();

  // 서버에서 오늘 날짜의 confirmed인 스케줄 중 가장 가까운 시간 하나만 가져오기
  const { data, loading, refetch } = useQuery<GetSchedulesData>(GET_SCHEDULES, {
    fetchPolicy: 'cache-and-network',
  });

  // reportStatus가 null이거나 'pending'인 스케줄만 필터링 (기상 보고가 아직 안 된 스케줄)
  const targetSchedule =
    data?.getTodaySchedules?.find(
      (schedule) =>
        !schedule.reportStatus || schedule.reportStatus === 'pending'
    ) || null;

  // 해당 스케줄의 Report 조회 (pending 상태인 Report 찾기)
  const { data: reportData } = useQuery<GetReportsByScheduleData>(
    GET_REPORTS_BY_SCHEDULE,
    {
      variables: {
        scheduleId: targetSchedule?.id || '',
      },
      skip: !targetSchedule || !targetSchedule.id,
      fetchPolicy: 'cache-and-network',
    }
  );

  // pending 상태인 Report 찾기 (현재 사용자의 Report)
  const pendingReport =
    reportData?.reportsBySchedule?.find(
      (report) => report.status === 'pending'
    ) || null;

  // useMutation으로 기상 보고 처리 (기존 Report 업데이트)
  const [updateWakeupReport, { loading: isSubmitting }] = useMutation(
    UPDATE_WAKEUP_REPORT,
    {
      onCompleted: () => {
        // 성공 시 스케줄 새로고침 후 완료 페이지로 이동
        refetch().then(() => {
          router.push('/report-success?status=wakeup');
        });
      },
      onError: (error) => {
        console.error('기상 보고 오류:', error);
        alert(error.message || '기상 보고 중 오류가 발생했습니다.');
      },
    }
  );

  // 스케줄 데이터를 ScheduleInfoData 형식으로 변환
  const scheduleData: ScheduleInfoData[] = targetSchedule
    ? [
        {
          groom: targetSchedule.groom || '',
          bride: targetSchedule.bride || '',
          date: formatScheduleDate(targetSchedule.date, targetSchedule.time),
          location: targetSchedule.location || '',
          venue: targetSchedule.venue || '',
          memo: targetSchedule.memo || '',
        },
      ]
    : [];

  const handleWakeupReport = async () => {
    if (!targetSchedule) {
      alert('보고할 스케줄이 없습니다.');
      return;
    }

    if (!pendingReport) {
      alert('보고할 수 있는 pending 상태의 Report가 없습니다.');
      return;
    }

    try {
      await updateWakeupReport({
        variables: {
          id: pendingReport.id,
        },
      });
    } catch (error) {
      // onError에서 처리되지만, 여기서도 처리 가능
      console.error('기상 보고 오류:', error);
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
          text={isSubmitting ? '보고 중...' : '기상 보고하기'}
          onClick={handleWakeupReport}
          disabled={
            loading ||
            isSubmitting ||
            scheduleData.length === 0 ||
            !pendingReport
          }
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default MorningReportPage;
