import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import Checkbox from '@/src/components/Checkbox';
import React from 'react';

const CompletedReportPage = () => {
  return (
    <MobileLayout>
      <PageHeader title='종료 보고' />
      <ContentLayout>
        <MainSection
          icon={{
            src: '/images/icons/completed.png',
            alt: 'completed',
            width: 60,
            height: 60,
          }}
          title='송명철님 촬영이 종료되었나요 ?'
          description='특이사항이 있다면 알려주시고 촬영 종료 보고를 해주세요'
        />

        <ScheduleInfo
          schedule={{
            groom: '송명철',
            bride: '이수연',
            date: '2025-01-01',
            memo: '종료 보고',
          }}
        />

        <div className='flex items-center gap-[10px] mt-[12px] border bg-white border-line-edge rounded-xl py-[15px] px-[20px]'>
          <Checkbox size={18} />
          <p className='text-caption1 text-normal-strong font-medium'>
            특이사항이 있어요
          </p>
        </div>

        <Button text='촬영 종료 보고하기' />
      </ContentLayout>
    </MobileLayout>
  );
};

export default CompletedReportPage;
