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
  GET_ASSIGNED_SCHEDULES,
  CONFIRM_SCHEDULES,
  GET_USER_CONFIRMED_SCHEDULES,
  GET_TODAY_SCHEDULES,
} from '@/src/client/graphql/Schedule';
import type { Schedule } from '@/src/types/schedule';
import { useRouter } from 'next/navigation';

interface ScheduleWithStatus extends ScheduleInfoData {
  id: string;
  status: 'assigned' | 'confirmed';
}

interface ScheduleGroup {
  rawDate: string;
  date: string;
  dateColor: 'blue' | 'red';
  schedules: ScheduleWithStatus[];
  scheduleIds: string[];
  assignedScheduleIds: string[];
  remainingAssignedIds: string[];
}

interface GetAssignedSchedulesData {
  getAssignedSchedules: Schedule[];
}

interface GetUserConfirmedSchedulesData {
  userConfirmedSchedules: string[];
}

const ScheduleManagementPage = () => {
  const router = useRouter();
  // 날짜 단위 로딩 상태 관리
  const [confirmingDates, setConfirmingDates] = useState<Set<string>>(
    new Set()
  );

  // useQuery로 스케줄 데이터 가져오기 (assigned 또는 completed)
  const { data, loading, refetch } = useQuery<GetAssignedSchedulesData>(
    GET_ASSIGNED_SCHEDULES,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  // 사용자가 이미 확정한 스케줄 ID 목록
  const {
    data: confirmedData,
    loading: confirmedLoading,
    refetch: refetchConfirmed,
  } = useQuery<GetUserConfirmedSchedulesData>(GET_USER_CONFIRMED_SCHEDULES, {
    fetchPolicy: 'cache-and-network',
  });

  // useMutation으로 스케줄 확정 처리
  const [confirmSchedules] = useMutation(CONFIRM_SCHEDULES, {
    onError: (error) => {
      console.error('스케줄 확정 오류:', error);
      setConfirmingDates(new Set()); // 에러 시에도 로딩 상태 초기화
      alert(error.message || '스케줄 확정 중 오류가 발생했습니다.');
    },
  });

  const schedules = useMemo(
    () => data?.getAssignedSchedules || [],
    [data?.getAssignedSchedules]
  );

  const confirmedSet = useMemo(
    () => new Set(confirmedData?.userConfirmedSchedules || []),
    [confirmedData?.userConfirmedSchedules]
  );

  // 날짜별로 그룹화
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
        // assigned 스케줄만 그룹화
        const assignedSchedules = dateSchedules.filter(
          (schedule) => schedule.status === 'assigned'
        );

        if (assignedSchedules.length > 0) {
          const remainingAssignedIds = assignedSchedules
            .map((s) => s.id)
            .filter((id) => !confirmedSet.has(id));

          result.push({
            rawDate: date,
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
              status: 'assigned',
            })),
            scheduleIds: assignedSchedules.map((schedule) => schedule.id),
            assignedScheduleIds: assignedSchedules.map(
              (schedule) => schedule.id
            ),
            remainingAssignedIds,
          });
        }
      });

    return result;
  }, [schedules, confirmedSet]);

  // 날짜 단위 스케줄 확정 처리 (해당 날짜의 모든 assigned 스케줄)
  const handleConfirmSchedulesByDate = async (
    date: string,
    scheduleIds: string[]
  ) => {
    if (scheduleIds.length === 0) return;
    setConfirmingDates((prev) => new Set(prev).add(date));

    try {
      await confirmSchedules({
        variables: {
          scheduleIds,
        },
        // 메인 페이지(useSchedule) 최신화만 우선 반영
        refetchQueries: [{ query: GET_TODAY_SCHEDULES }],
        awaitRefetchQueries: true,
      });
      await Promise.all([refetch(), refetchConfirmed()]); // 로컬 목록/확정 정보 갱신
      router.refresh(); // 캐시 무효화
      router.push('/');
    } catch (error) {
      // onError에서 처리되지만, 여기서도 처리 가능
      console.error('스케줄 확정 오류:', error);
      // 에러 시 로딩 상태 제거
      setConfirmingDates((prev) => {
        const next = new Set(prev);
        next.delete(date);
        return next;
      });
    }
  };

  if (loading || confirmedLoading) {
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
                    </div>
                  ))}
                  {/* 날짜 단위 확정 버튼 (해당 날짜의 assigned 스케줄 중 미확정만 처리) */}
                  {group.remainingAssignedIds.length > 0 && (
                    <Button
                      text={
                        confirmingDates.has(group.rawDate)
                          ? '확정 중...'
                          : '스케줄 확정'
                      }
                      onClick={() =>
                        handleConfirmSchedulesByDate(
                          group.rawDate,
                          group.remainingAssignedIds
                        )
                      }
                      disabled={confirmingDates.has(group.rawDate)}
                    />
                  )}
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
