'use client';
import CheckboxList, { CheckboxItemData } from '@/src/components/CheckboxList';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo from '@/src/components/ScheduleInfo';
import TimePickerWheel from '@/src/components/TimePickerWheel';
import MobileLayout from '@/src/layout/MobileLayout';
import React, { useState } from 'react';

const DepartureReportPage = () => {
  const handleTimeChange = (h: number, m: number) => {
    console.log('선택된 도착 예정 시간:', h, m);
  };

  const [checkboxItems, setCheckboxItems] = useState<CheckboxItemData[]>([
    {
      id: '1',
      label: '촬영 장비 (카메라, 렌즈, 플래시)',
      checked: false,
    },
    {
      id: '2',
      label: '메모리 & 전원 (메모리카드, 배터리)',
      checked: false,
    },
    {
      id: '3',
      label: '충전기 & 여분품',
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
      <PageHeader title='출발 보고' />
      <ContentLayout>
        <div className='space-y-[12px]'>
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
          {/* 🔥 여기 추가 */}

          <TimePickerWheel onChange={handleTimeChange} />

          <CheckboxList items={checkboxItems} onChange={handleCheckboxChange} />
          <ScheduleInfo
            schedule={{
              groom: '송명철',
              bride: '이수연',
              date: '2025-01-01',
              memo: '출발 보고',
            }}
          />
        </div>
      </ContentLayout>
    </MobileLayout>
  );
};

export default DepartureReportPage;
