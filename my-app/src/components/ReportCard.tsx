'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface Report {
  title: string;
  description: string;
  icon: string;
  href: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (report.disabled) return;
    
    if (report.onClick) {
      report.onClick();
    } else {
      router.push(report.href);
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={`flex flex-col gap-[8px] w-full h-[130px] p-[12px] border border-line-edge rounded-xl ${
        report.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        backgroundColor: report.disabled ? '#DFDFDF' : '#fff',
        boxShadow: report.disabled ? 'none' : '0 2px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
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
