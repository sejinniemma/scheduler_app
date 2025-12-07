import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import React from 'react';

interface ScheduleGroup {
  date: string;
  dateColor: 'blue' | 'red';
  schedules: ScheduleInfoData[];
}

const ScheduleManagementPage = () => {
  const scheduleGroups: ScheduleGroup[] = [
    {
      date: '2025년 11월 29일 토요일',
      dateColor: 'blue',
      schedules: [
        {
          groom: '송명철',
          bride: '이수연',
          date: '2025-11-29',
          location: '강동 kdw 웨딩 3층 블랙스톤홀 (바모)',
          memo: 'DVD 진행',
        },
        {
          groom: '김민수',
          bride: '박지영',
          date: '2025-11-29',
          location: '영등포 해군호텔 2층 노블레스 홀',
          memo: '웨딩 촬영',
        },
      ],
    },
    {
      date: '2025년 11월 30일 일요일',
      dateColor: 'red',
      schedules: [
        {
          groom: '이동욱',
          bride: '최수진',
          date: '2025-11-30',
          location: '강남 컨벤션센터 그랜드홀',
          memo: '스튜디오 촬영',
        },
      ],
    },
  ];

  return (
    <MobileLayout>
      <PageHeader title='내 스케줄 확정/확인' />
      <ContentLayout>
        {scheduleGroups.map((group, groupIndex) => (
          <div key={groupIndex} className='mb-[24px]'>
            <p
              className={`text-body4 font-semibold text-center mb-[10px] ${
                group.dateColor === 'blue' ? 'text-blue' : 'text-red'
              }`}
            >
              {group.date}
            </p>
            <div className='flex flex-col gap-[10px]'>
              {group.schedules.map((schedule, scheduleIndex) => (
                <ScheduleInfo key={scheduleIndex} schedule={schedule} />
              ))}
            </div>
          </div>
        ))}
        <Button text='스케줄 확정' />
      </ContentLayout>
    </MobileLayout>
  );
};

export default ScheduleManagementPage;
