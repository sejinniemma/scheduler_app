'use client';

import ProgressBar from './ProgressBar';

interface Schedule {
  id: string;
  time: string;
  location: string;
  status:
    | 'pending'
    | 'ongoing'
    | 'upcoming'
    | 'completed'
    | 'canceled'
    | 'wakeup'
    | 'departure'
    | 'arrival';
  currentStep: 0 | 1 | 2 | 3;
}

interface ScheduleListProps {
  schedules: Schedule[];
}

// status에 따라 currentStep 결정
const getCurrentStepFromStatus = (status: string): 0 | 1 | 2 | 3 => {
  switch (status) {
    case 'wakeup':
      return 0; // 0%
    case 'departure':
      return 1; // 30%
    case 'arrival':
      return 2; // 75%
    case 'completed':
      return 3; // 100%
    default:
      return 0; // pending, ongoing, upcoming 등은 0%
  }
};

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
      {schedules.map((schedule) => {
        // status에 따라 currentStep 결정
        const progressStep = getCurrentStepFromStatus(schedule.status);

        return (
          <div key={schedule.id} className='flex flex-col gap-[20px]'>
            {/* Schedule Info */}
            <div
              className={`flex items-center text-caption1 gap-[10px] ${
                schedule.status === 'ongoing' ? 'text-dark' : 'text-disabled'
              }`}
            >
              <span>{schedule.time}</span>
              <p>{schedule.location}</p>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              currentStep={progressStep}
              disabled={
                schedule.status === 'completed' ||
                schedule.status === 'canceled'
              }
            />
          </div>
        );
      })}
    </>
  );
}

export const ScheduleListLoading = () => {
  return (
    <p className='text-caption1 text-default text-center py-[20px]'>
      로딩 중...
    </p>
  );
};
