'use client';

import Button from '@/src/components/Button';
import PageHeader from '@/src/components/PageHeader';
import MobileLayout from '@/src/layout/MobileLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ReportSuccessPage = () => {
  const router = useRouter();
  return (
    <MobileLayout>
      <PageHeader title='기상 보고 완료' showBackButton={false} />

      <div className='h-[calc(100%-100px)] flex items-center justify-center'>
        <div className='w-[270px] mx-auto flex flex-col items-center justify-center'>
          <Image
            src='/images/icons/success.png'
            alt='success'
            width={60}
            height={60}
          />
          <h1 className='text-body2 text-normal font-bold mt-[20px] mb-[12px]'>
            송명철님의 기상을 보고했어요 !
          </h1>
          <p className='text-caption1 text-dark font-medium'>
            오늘도 최고의 순간을 담아주세요
          </p>
          <Button text='확인' onClick={() => router.push('/main')} />
        </div>
      </div>
    </MobileLayout>
  );
};

export default ReportSuccessPage;
