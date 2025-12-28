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
    // Report의 status 사용 (없으면 'pending')
    status: (schedule.reportStatus || 'pending') as
      | 'pending'
      | 'ongoing'
      | 'upcoming'
      | 'completed'
      | 'canceled',
    currentStep: (schedule.currentStep ?? 0) as 0 | 1 | 2 | 3,
  }));

  return <ScheduleListContent schedules={transformedSchedules} />;
}
