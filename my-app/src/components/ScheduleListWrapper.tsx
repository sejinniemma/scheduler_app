import ScheduleListContent from './ScheduleList';
import type { Schedule } from '@/src/types/schedule';

interface ScheduleListWrapperProps {
  schedulesPromise: Promise<Schedule[]>;
}

export default async function ScheduleListWrapper({
  schedulesPromise,
}: ScheduleListWrapperProps) {
  const schedules = await schedulesPromise;

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
    // currentStep은 Report에서 가져와야 하지만 일단 0으로 설정
    currentStep: 0 as 0 | 1 | 2 | 3,
  }));

  return <ScheduleListContent schedules={transformedSchedules} />;
}
