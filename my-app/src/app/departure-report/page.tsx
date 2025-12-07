import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import React from 'react';

const DepartureReportPage = () => {
  return (
    <MobileLayout>
      <PageHeader title='출발 보고' />
      <ContentLayout>
        <MainSection
          icon={{
            src: '/images/icons/departure.png',
            alt: 'departure',
            width: 60,
            height: 60,
          }}
          title='송명철님 출발할 준비가 되셨나요 ?'
          description='도착예정시간을 알려주시고 출발 보고를해주세요'
        />

        <ScheduleInfo
          schedule={{
            groom: '송명철',
            bride: '이수연',
            date: '2025-01-01',
            memo: '출발 보고',
          }}
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default DepartureReportPage;
