'use client';
import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import { formatScheduleDate, formatDateForGroup } from '@/src/lib/utiles';
import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_SCHEDULES,
  CONFIRM_SCHEDULES,
} from '@/src/client/graphql/Schedule';
import type { Schedule } from '@/src/types/schedule';

interface ScheduleWithStatus extends ScheduleInfoData {
  id: string;
  status: 'assigned' | 'confirmed';
}

interface ScheduleGroup {
  date: string;
  dateColor: 'blue' | 'red';
  schedules: ScheduleWithStatus[];
  scheduleIds: string[];
  assignedScheduleIds: string[];
}

interface GetSchedulesData {
  schedules: Schedule[];
}

const ScheduleManagementPage = () => {
  // 각 스케줄별 로딩 상태 관리
  const [confirmingScheduleIds, setConfirmingScheduleIds] = useState<
    Set<string>
  >(new Set());

  // useQuery로 스케줄 데이터 가져오기 (assigned 또는 completed)
  const { data, loading, refetch } = useQuery<GetSchedulesData>(GET_SCHEDULES, {
    fetchPolicy: 'cache-and-network',
  });

  // useMutation으로 스케줄 확정 처리
  const [confirmSchedules] = useMutation(CONFIRM_SCHEDULES, {
    onCompleted: () => {
      alert('스케줄이 확정되었습니다.');
      setConfirmingScheduleIds(new Set()); // 로딩 상태 초기화
      refetch();
    },
    onError: (error) => {
      console.error('스케줄 확정 오류:', error);
      setConfirmingScheduleIds(new Set()); // 에러 시에도 로딩 상태 초기화
      alert(error.message || '스케줄 확정 중 오류가 발생했습니다.');
    },
  });

  const schedules = useMemo(() => data?.schedules || [], [data?.schedules]);

  // 날짜별로 그룹화 (assigned와 completed를 분리)
  const scheduleGroups = useMemo<ScheduleGroup[]>(() => {
    const groups: { [key: string]: Schedule[] } = {};

    schedules.forEach((schedule) => {
      if (!groups[schedule.date]) {
        groups[schedule.date] = [];
      }
      groups[schedule.date].push(schedule);
    });

    const result: ScheduleGroup[] = [];

    Object.keys(groups)
      .sort()
      .forEach((date) => {
        const dateSchedules = groups[date];

        // assigned 스케줄만 필터링
        const assignedSchedules = dateSchedules.filter(
          (schedule) => schedule.status === 'assigned'
        );

        // confirmed 스케줄만 필터링
        const confirmedSchedules = dateSchedules.filter(
          (schedule) => schedule.status === 'confirmed'
        );

        // confirmed 스케줄이 있으면 파란색 그룹 먼저 추가 (확정된 것이 먼저 보이도록)
        if (confirmedSchedules.length > 0) {
          result.push({
            date: formatDateForGroup(date),
            dateColor: 'blue',
            schedules: confirmedSchedules.map((schedule) => ({
              id: schedule.id,
              groom: schedule.groom || '',
              bride: schedule.bride || '',
              date: formatScheduleDate(schedule.date, schedule.time),
              location: schedule.location || '',
              venue: schedule.venue || '',
              memo: schedule.memo || '',
              status: schedule.status as 'assigned' | 'confirmed',
            })),
            scheduleIds: confirmedSchedules.map((schedule) => schedule.id),
            assignedScheduleIds: [],
          });
        }

        // assigned 스케줄이 있으면 빨간색 그룹 추가
        if (assignedSchedules.length > 0) {
          result.push({
            date: formatDateForGroup(date),
            dateColor: 'red',
            schedules: assignedSchedules.map((schedule) => ({
              id: schedule.id,
              groom: schedule.groom || '',
              bride: schedule.bride || '',
              date: formatScheduleDate(schedule.date, schedule.time),
              location: schedule.location || '',
              venue: schedule.venue || '',
              memo: schedule.memo || '',
              status: schedule.status as 'assigned' | 'confirmed',
            })),
            scheduleIds: assignedSchedules.map((schedule) => schedule.id),
            assignedScheduleIds: assignedSchedules.map(
              (schedule) => schedule.id
            ),
          });
        }
      });

    return result;
  }, [schedules]);

  // 개별 스케줄 확정 처리
  const handleConfirmSchedule = async (scheduleId: string) => {
    // 해당 스케줄의 로딩 상태 시작
    setConfirmingScheduleIds((prev) => new Set(prev).add(scheduleId));

    try {
      await confirmSchedules({
        variables: {
          scheduleIds: [scheduleId],
        },
      });
    } catch (error) {
      // onError에서 처리되지만, 여기서도 처리 가능
      console.error('스케줄 확정 오류:', error);
      // 에러 시 로딩 상태 제거
      setConfirmingScheduleIds((prev) => {
        const next = new Set(prev);
        next.delete(scheduleId);
        return next;
      });
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
                <div className='flex flex-col gap-[30px]'>
                  {group.schedules.map((schedule, scheduleIndex) => (
                    <div
                      key={scheduleIndex}
                      className='flex flex-col gap-[10px]'
                    >
                      <ScheduleInfo schedule={schedule} />
                      {schedule.status === 'assigned' && (
                        <Button
                          text={
                            confirmingScheduleIds.has(schedule.id)
                              ? '확정 중...'
                              : '스케줄 확정'
                          }
                          onClick={() => handleConfirmSchedule(schedule.id)}
                          disabled={confirmingScheduleIds.has(schedule.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </ContentLayout>
    </MobileLayout>
  );
};

export default ScheduleManagementPage;
