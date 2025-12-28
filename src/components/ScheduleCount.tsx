import type { Schedule } from '@/src/types/schedule';

interface ScheduleCountProps {
  schedulesPromise: Promise<Schedule[]>;
}

export default async function ScheduleCount({
  schedulesPromise,
}: ScheduleCountProps) {
  const schedules = await schedulesPromise;
  return (
    <span className='text-caption2 text-default'>
      총 {schedules.length}건
    </span>
  );
}

