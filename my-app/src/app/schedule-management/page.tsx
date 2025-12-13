'use client';
import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import { formatScheduleDate, formatDateForGroup } from '@/src/lib/utiles';
import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_SCHEDULES,
  CONFIRM_SCHEDULES,
} from '@/src/client/graphql/Schedule';
import type { Schedule } from '@/src/types/schedule';

interface ScheduleGroup {
  date: string;
  dateColor: 'blue' | 'red';
  schedules: ScheduleInfoData[];
  scheduleIds: string[];
  assignedScheduleIds: string[];
}

interface GetSchedulesData {
  schedules: Schedule[];
}

const ScheduleManagementPage = () => {
  // useQuery로 스케줄 데이터 가져오기 (assigned 또는 completed)
  const { data, loading, refetch } = useQuery<GetSchedulesData>(GET_SCHEDULES, {
    fetchPolicy: 'cache-and-network',
  });

  // useMutation으로 스케줄 확정 처리
  const [confirmSchedules, { loading: isConfirming }] = useMutation(
    CONFIRM_SCHEDULES,
    {
      onCompleted: () => {
        alert('스케줄이 확정되었습니다.');
        refetch();
      },
      onError: (error) => {
        console.error('스케줄 확정 오류:', error);
        alert(error.message || '스케줄 확정 중 오류가 발생했습니다.');
      },
    }
  );

  const schedules = useMemo(() => data?.schedules || [], [data?.schedules]);

  // 날짜별로 그룹화
  const scheduleGroups = useMemo(() => {
    const groups: { [key: string]: Schedule[] } = {};

    schedules.forEach((schedule) => {
      if (!groups[schedule.date]) {
        groups[schedule.date] = [];
      }
      groups[schedule.date].push(schedule);
    });

    return Object.keys(groups)
      .sort()
      .map((date) => {
        const dateSchedules = groups[date];
        // 해당 날짜의 스케줄들 중 하나라도 completed가 있으면 파란색, 모두 assigned면 빨간색
        const hasCompleted = dateSchedules.some(
          (schedule) => schedule.subStatus === 'completed'
        );
        const assignedIds = dateSchedules
          .filter((schedule) => schedule.subStatus === 'assigned')
          .map((schedule) => schedule.id);

        return {
          date: formatDateForGroup(date),
          dateColor: hasCompleted ? 'blue' : 'red',
          schedules: dateSchedules.map((schedule) => ({
            groom: schedule.groom || '',
            bride: schedule.bride || '',
            date: formatScheduleDate(schedule.date, schedule.time),
            location: schedule.location || '',
            venue: schedule.venue || '',
            memo: schedule.memo || '',
          })),
          scheduleIds: dateSchedules.map((schedule) => schedule.id),
          assignedScheduleIds: assignedIds,
        };
      });
  }, [schedules]);

  // assigned인 스케줄이 있는지 확인
  const hasAssignedSchedules = useMemo(() => {
    return scheduleGroups.some((group) => group.assignedScheduleIds.length > 0);
  }, [scheduleGroups]);

  const handleConfirm = async () => {
    // assigned인 스케줄 ID만 수집
    const assignedScheduleIds = scheduleGroups.flatMap(
      (group) => group.assignedScheduleIds
    );

    if (assignedScheduleIds.length === 0) {
      alert('확정할 스케줄이 없습니다.');
      return;
    }

    try {
      await confirmSchedules({
        variables: {
          scheduleIds: assignedScheduleIds,
        },
      });
    } catch (error) {
      // onError에서 처리되지만, 여기서도 처리 가능
      console.error('스케줄 확정 오류:', error);
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <PageHeader title='내 스케줄 확정/확인' />
        <ContentLayout>
          <p className='text-caption1 text-default text-center py-[20px]'>
            로딩 중...
          </p>
        </ContentLayout>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <PageHeader title='내 스케줄 확정/확인' />
      <ContentLayout>
        {scheduleGroups.length === 0 ? (
          <p className='text-caption1 text-default text-center py-[20px]'>
            확정할 스케줄이 없습니다.
          </p>
        ) : (
          <>
            {scheduleGroups.map((group, groupIndex) => (
              <div key={groupIndex} className='mb-[24px]'>
                <p
                  className={`text-body4 font-semibold text-center mb-[10px] ${
                    group.dateColor === 'blue' ? 'text-blue' : 'text-red'
                  }`}
                >
                  {group.date}
                </p>
                <div className='flex flex-col gap-[10px]'>
                  {group.schedules.map((schedule, scheduleIndex) => (
                    <ScheduleInfo key={scheduleIndex} schedule={schedule} />
                  ))}
                </div>
              </div>
            ))}
            {hasAssignedSchedules && (
              <Button
                text={isConfirming ? '확정 중...' : '스케줄 확정'}
                onClick={handleConfirm}
                disabled={isConfirming}
              />
            )}
          </>
        )}
      </ContentLayout>
    </MobileLayout>
  );
};

export default ScheduleManagementPage;
