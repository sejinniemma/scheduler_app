import Image from 'next/image';

export interface Report {
  title: string;
  description: string;
  icon: string;
}

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  return (
    <div
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
  );
};

export default ReportCard;
