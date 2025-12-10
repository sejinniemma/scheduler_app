'use client';

import ProgressBar from './ProgressBar';

interface Schedule {
  id: string;
  time: string;
  location: string;
  status: 'pending' | 'ongoing' | 'upcoming' | 'completed' | 'canceled';
  currentStep: 0 | 1 | 2 | 3;
}

interface ScheduleListProps {
  schedules: Schedule[];
}

export default function ScheduleListContent({ schedules }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <p className='text-caption1 text-default text-center py-[20px]'>
        오늘의 스케줄이 없습니다.
      </p>
    );
  }

  return (
    <>
      {schedules.map((schedule) => (
        <div key={schedule.id} className='flex flex-col gap-[20px]'>
          {/* Schedule Info */}
          <div
            className={`flex items-center text-caption1 gap-[10px] ${
              schedule.status === 'ongoing'
                ? 'text-dark'
                : 'text-disabled'
            }`}
          >
            <span>{schedule.time}</span>
            <p>{schedule.location}</p>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            currentStep={schedule.currentStep}
            disabled={schedule.status !== 'ongoing'}
          />
        </div>
      ))}
    </>
  );
};

export const ScheduleListLoading = () => {
  return (
    <p className='text-caption1 text-default text-center py-[20px]'>
      로딩 중...
    </p>
  );
};

