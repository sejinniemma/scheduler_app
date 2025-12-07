import Image from 'next/image';

export interface ScheduleInfoData {
  groom: string;
  bride: string;
  date: string;
  memo: string;
}

interface ScheduleInfoProps {
  schedule: ScheduleInfoData;
}

const ScheduleInfo = ({ schedule }: ScheduleInfoProps) => {
  return (
    <div className='flex flex-col items-start justify-center border bg-white border-line-edge rounded-xl py-[18px] px-[12px]'>
      {/* 커플 정보 */}
      <div className='flex items-center gap-[14px] pb-[10px] border-b border-lighter w-full'>
        <div className='flex items-center gap-[6px]'>
          <Image
            src='/images/icons/groom.png'
            alt='groom'
            width={16}
            height={16}
          />
          <p className='text-caption1 text-normal font-medium'>
            {schedule.groom}
          </p>
        </div>
        <div className='flex items-center gap-[6px]'>
          <Image
            src='/images/icons/bride.png'
            alt='bride'
            width={16}
            height={16}
          />
          <p className='text-caption1 text-normal font-medium'>
            {schedule.bride}
          </p>
        </div>
      </div>

      {/* 날짜정보 */}
      <div className='flex items-center gap-[6px] pb-[10px] border-b border-lighter w-full'>
        <Image
          src='/images/icons/calendar.png'
          alt='calendar'
          width={16}
          height={16}
        />
        <p className='text-caption1 text-normal font-medium'>{schedule.date}</p>
      </div>

      {/* memo */}
      <div className='flex items-center gap-[6px] w-full'>
        <Image src='/images/icons/memo.png' alt='memo' width={16} height={16} />
        <p className='text-caption1 text-normal font-medium'>{schedule.memo}</p>
      </div>
    </div>
  );
};

export default ScheduleInfo;
