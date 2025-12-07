'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
}

const PageHeader = ({ title }: PageHeaderProps) => {
  const router = useRouter();

  return (
    <header className='flex items-center py-[18px] px-[14px] bg-white mb-[18px]'>
      <div className='flex items-center justify-between w-[203px]'>
        <button onClick={() => router.back()}>
          <Image
            src='/images/icons/arrow-left.png'
            alt='arrow-left'
            width={24}
            height={24}
          />
        </button>
        <h1 className='text-body2 text-normal font-bold'>{title}</h1>
      </div>
    </header>
  );
};

export default PageHeader;

