import MobileLayout from '@/src/layout/MobileLayout';
import PageHeader from '@/src/components/PageHeader';
import MainSection from '@/src/components/MainSection';
import Button from '@/src/components/Button';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import ContentLayout from '@/src/components/ContentLayout';

const MorningReportPage = () => {
  const schedules: ScheduleInfoData[] = [
    {
      groom: '김유준',
      bride: '서수연',
      date: '2025년 11월 29일 (토) 11:30',
      memo: '1.신랑신부님 2.양가 혼주분들,신랑신부님 (혼주는 어머님,아버님을 뜻함) 3.양가 가족 및 친척 전체 4.신랑+신부님 측 직계가족 (신랑님의 형제 자매분들 그리고 형제 자매가 결혼을 했다면 결혼한 배우자와 그 자녀까지) 5.직장동료 및 친구분들 전체 (**핸드폰 손전등 씬 생략 부탁, 컷 수도 짧게만 촬영 부탁드립니다) 6.신랑신부님 연출사진 7.신부님 독사진',
    },
    {
      groom: '이민호',
      bride: '박지은',
      date: '2025년 11월 29일 (토) 14:00',
      memo: '1.신랑신부님 2.양가 혼주분들 3.양가 가족 및 친척 전체 4.신랑+신부님 측 직계가족 5.직장동료 및 친구분들 전체 6.신랑신부님 연출사진 7.신부님 독사진',
    },
  ];

  return (
    <MobileLayout>
      <PageHeader title='기상 보고' />
      <ContentLayout>
        <MainSection
          icon={{
            src: '/images/icons/alarm.png',
            alt: 'alarm',
            width: 60,
            height: 60,
          }}
          title='송명철님 하루를 시작할 준비가 되셨나요 ?'
          description='오늘 진행될 일정을 확인하고 기상 보고를 해주세요'
        />

        {/* 스케쥴 정보 */}
        <div className='flex flex-col gap-[10px] w-full'>
          {schedules.map((schedule, index) => (
            <ScheduleInfo key={index} schedule={schedule} />
          ))}
        </div>

        <Button text='기상 보고하기' />
      </ContentLayout>
    </MobileLayout>
  );
};

export default MorningReportPage;
