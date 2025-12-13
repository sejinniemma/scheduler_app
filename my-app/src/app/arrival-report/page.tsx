'use client';
import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import Image from 'next/image';
import { useSchedule } from '@/src/contexts/ScheduleContext';
import { useSession } from 'next-auth/react';
import { formatScheduleDate } from '@/src/lib/utiles';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { CREATE_ARRIVAL_REPORT } from '@/src/client/graphql/Report';

const ArrivalReportPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const { schedules, refreshSchedules } = useSchedule();
  const router = useRouter();

  // useMutation으로 도착 보고 처리
  const [createArrivalReport, { loading: isLoading }] = useMutation(
    CREATE_ARRIVAL_REPORT,
    {
      onCompleted: () => {
        // 성공 시 스케줄 새로고침 후 완료 페이지로 이동
        refreshSchedules().then(() => {
          router.push('/report-success?status=arrival');
        });
      },
      onError: (error) => {
        console.error('도착 보고 오류:', error);
        alert(error.message || '도착 보고 중 오류가 발생했습니다.');
      },
    }
  );

  // 스케줄 데이터를 ScheduleInfoData 형식으로 변환
  const scheduleData: ScheduleInfoData[] = schedules.map((schedule) => ({
    groom: schedule.groom || '',
    bride: schedule.bride || '',
    date: formatScheduleDate(schedule.date, schedule.time),
    location: schedule.location || '',
    venue: schedule.venue || '',
    memo: schedule.memo || '',
  }));

  const handleArrivalReport = async () => {
    if (schedules.length === 0) {
      alert('보고할 스케줄이 없습니다.');
      return;
    }

    // 가장 가까운 시간의 스케줄에 대해 도착 보고
    const scheduleId = schedules[0].id;

    try {
      await createArrivalReport({
        variables: {
          scheduleId,
        },
      });
    } catch (error) {
      // onError에서 처리되지만, 여기서도 처리 가능
      console.error('도착 보고 오류:', error);
    }
  };

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
          title={`${userName}님 촬영 장소에 도착하셨나요?`}
          description='도착하셨다면 사진을 업로드하신 후 도착 보고해 주세요'
        />

        {/* 스케쥴 정보 */}
        <div className='flex flex-col gap-[10px] w-full'>
          {scheduleData.length === 0 ? (
            <p className='text-caption1 text-default text-center py-[20px]'>
              오늘의 스케줄이 없습니다.
            </p>
          ) : (
            scheduleData.map((schedule, index) => (
              <ScheduleInfo key={index} schedule={schedule} />
            ))
          )}
        </div>

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
        <Button
          text={isLoading ? '보고 중...' : '도착 보고하기'}
          mt='14px'
          onClick={handleArrivalReport}
          disabled={isLoading || scheduleData.length === 0}
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default ArrivalReportPage;
