'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const PageHeader = ({ title, showBackButton = true }: PageHeaderProps) => {
  const router = useRouter();

  return (
    <header className='relative flex items-center py-[18px] px-[14px] bg-white mb-[18px]'>
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className='absolute left-[14px] z-10'
        >
          <Image
            src='/images/icons/arrow-left.png'
            alt='arrow-left'
            width={24}
            height={24}
          />
        </button>
      )}
      <div className='flex items-center justify-center w-full'>
        <h1 className='text-body2 text-normal font-bold'>{title}</h1>
      </div>
    </header>
  );
};

export default PageHeader;
