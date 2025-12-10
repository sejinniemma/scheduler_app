'use client';

import Button from '@/src/components/Button';
import PageHeader from '@/src/components/PageHeader';
import MobileLayout from '@/src/layout/MobileLayout';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { useSchedule } from '@/src/contexts/ScheduleContext';

const ReportSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const status = searchParams.get('status') || 'wakeup';
  const { refreshSchedules } = useSchedule();

  const handleConfirm = () => {
    // 스케줄 새로고침 후 메인으로 이동
    refreshSchedules().then(() => {
      router.push('/main');
    });
  };

  // status에 따른 텍스트 설정
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'wakeup':
        return {
          pageTitle: '기상 보고 완료',
          title: `${userName}님의 기상을 보고했어요 !`,
          description: '오늘도 최고의 순간을 담아주세요',
          icon: '/images/icons/success.png',
        };
      case 'departure':
        return {
          pageTitle: '출발 보고 완료',
          title: `${userName}님의 출발을 보고했어요!`,
          description: '오늘도 최고의 순간을 담아주세요',
          icon: '/images/icons/success.png',
        };
      case 'arrival':
        return {
          pageTitle: '도착 보고 완료',
          title: `${userName}님의 도착을 보고했어요!`,
          description: '오늘도 최고의 순간을 담아주세요',
          icon: '/images/icons/success.png',
        };
      case 'completed':
        return {
          pageTitle: '종료 보고 완료',
          title: `${userName}님의 촬영 종료를 보고했어요!`,
          description: '촬영하느라 고생하셨어요',
          icon: '/images/icons/success.png',
        };
      default:
        return {
          pageTitle: '보고 완료',
          title: `${userName}님의 보고가 완료되었어요 !`,
          description: '감사합니다',
          icon: '/images/icons/success.png',
        };
    }
  }, [status, userName]);

  return (
    <MobileLayout>
      <PageHeader title={statusConfig.pageTitle} showBackButton={false} />

      <div className='h-[calc(100%-100px)] flex items-center justify-center'>
        <div className='w-[270px] mx-auto flex flex-col items-center justify-center'>
          <Image src={statusConfig.icon} alt='success' width={60} height={60} />
          <h1 className='text-body2 text-normal font-bold mt-[20px] mb-[12px] whitespace-nowrap'>
            {statusConfig.title}
          </h1>
          <p className='text-caption1 text-dark font-medium'>
            {statusConfig.description}
          </p>
          <Button text='확인' onClick={handleConfirm} />
        </div>
      </div>
    </MobileLayout>
  );
};

export default ReportSuccessPage;
