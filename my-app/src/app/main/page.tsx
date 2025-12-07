import ProgressBar from '@/src/components/ProgressBar';
import Image from 'next/image';

interface Schedule {
  time: string;
  location: string;
  currentStep: 0 | 1 | 2 | 3;
  status: 'pending' | 'ongoing' | 'upcoming' | 'completed' | 'canceled';
}

interface Report {
  title: string;
  description: string;
  icon: string;
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

  const reports: Report[] = [
    {
      title: '기상 보고',
      description: `오늘의 스케줄을 보고\n기상을 보고 할 수 있어요`,
      icon: '/images/icons/alarm.png',
    },
    {
      title: '출발 보고',
      description: '오늘 스케줄을 보고\n출발을 보고 할 수 있어요',
      icon: '/images/icons/departure.png',
    },
    {
      title: '도착 보고',
      description: '촬영 장소에 도착하셨나요?\n 도착 보고를 할 수 있어요',
      icon: '/images/icons/arrival.png',
    },
    {
      title: '종료 보고',
      description: '촬영을 마치 셨나요?\n 종료 보고를 할 수 있어요',
      icon: '/images/icons/completed.png',
    },
    {
      title: '내 스케줄 확정/확인',
      description: '스케줄을 한 번에 확인하거나\n 확정할 수 있어요',
      icon: '/images/icons/calendar.png',
    },
  ];

  return (
    <section className='flex flex-col items-center bg-lighter gap-[18px] py-[18px] px-[14px]'>
      {/* 금일 스케쥴 상황 */}
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

      {/* 보고 List */}
      <div className='grid grid-cols-2 gap-[10px] w-full'>
        {reports.map((report, index) => (
          <div
            key={index}
            className='flex flex-col gap-[8px] w-full h-[130px] p-[12px] bg-white border border-line-edge rounded-xl cursor-pointer'
            style={{ boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.05)' }}
          >
            <h2 className='text-body4 text-normal-strong font-bold'>
              {report.title}
            </h2>
            <p className='text-caption2 text-tertiary font-medium whitespace-pre-line'>
              {report.description}
            </p>

            <div className='relative flex justify-end w-full'>
              <Image
                src={report.icon}
                alt={report.title}
                width={32}
                height={32}
                className='object-contain'
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MainPage;
