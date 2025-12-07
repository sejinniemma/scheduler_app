import ProgressBar from '@/src/components/ProgressBar';

interface Schedule {
  time: string;
  location: string;
  currentStep: 0 | 1 | 2 | 3;
  status: 'pending' | 'ongoing' | 'upcoming' | 'completed' | 'canceled';
}

const MainPage = () => {
  const schedules: Schedule[] = [
    {
      time: '11:30',
      location: '영등포 해군호텔 2충 노블레스 홀 (라이트댓)',
      currentStep: 2,
      status: 'ongoing',
    },
    {
      time: '14:00',
      location: '강남 컨벤션센터 그랜드홀',
      currentStep: 0,
      status: 'completed',
    },
  ];

  return (
    <section className='flex flex-col items-center bg-lighter gap-[18px] pt-[18px] px-[14px]'>
      <div className='flex flex-col gap-[20px] w-full bg-white border border-line-edge rounded-xl p-[14px]'>
        {/* Title */}
        <div className='flex items-center justify-between'>
          <h1 className='text-body4 text-normal font-semibold'>
            금일 스케쥴 진행상황
          </h1>
          <span className='text-caption2 text-default'>
            총 {schedules.length}건
          </span>
        </div>

        {/* Schedule List */}
        <div className='flex flex-col gap-[20px]'>
          {schedules.map((schedule, index) => (
            <div key={index} className='flex flex-col gap-[20px]'>
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
                currentStep={schedule.currentStep}
                disabled={schedule.status !== 'ongoing'}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MainPage;
