import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import CheckboxList, { CheckboxItemData } from '@/src/components/CheckboxList';
import React, { useState } from 'react';

const CompletedReportPage = () => {
  const [checkboxItems, setCheckboxItems] = useState<CheckboxItemData[]>([
    {
      id: '1',
      label: '특이사항이 있어요',
      checked: false,
    },
  ]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckboxItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    );
  };

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

        <CheckboxList
          items={checkboxItems}
          onChange={handleCheckboxChange}
          size={16}
          className='mt-[12px]'
        />

        <Button text='촬영 종료 보고하기' />
      </ContentLayout>
    </MobileLayout>
  );
};

export default CompletedReportPage;
