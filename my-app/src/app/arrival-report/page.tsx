import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import Image from 'next/image';
import React from 'react';

const ArrivalReportPage = () => {
  return (
    <MobileLayout>
      <PageHeader title='도착 보고' />
      <ContentLayout>
        <MainSection
          icon={{
            src: '/images/icons/arrival.png',
            alt: 'arrival',
            width: 60,
            height: 60,
          }}
          title='송명철님 촬영 장소에 도착하셨나요?'
          description='도착하셨다면 사진을 업로드하신 후 도착 보고해 주세요'
        />

        <ScheduleInfo
          schedule={{
            groom: '송명철',
            bride: '이수연',
            date: '2025-01-01',
            memo: '도착 보고',
          }}
        />

        <Button
          text='사진 업로드'
          showShadow={false}
          leftIcon={
            <Image
              src='/images/icons/upload.png'
              alt='upload'
              width={21}
              height={21}
            />
          }
          className='border border-line-medium rounded-[10px] !text-normal-strong bg-transparent'
        />
        <Button text='도착 보고하기' mt='14px' />
      </ContentLayout>
    </MobileLayout>
  );
};

export default ArrivalReportPage;
