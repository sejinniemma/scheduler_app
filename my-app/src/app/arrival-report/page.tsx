'use client';
import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { formatScheduleDate, getToday } from '@/src/lib/utiles';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_ARRIVAL_REPORT } from '@/src/client/graphql/Report';
import { GET_SCHEDULES } from '@/src/client/graphql/Schedule';
import type { Schedule } from '@/src/types/schedule';

interface GetSchedulesData {
  schedules: Schedule[];
}

const ArrivalReportPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const router = useRouter();
  const today = getToday();

  // 서버에서 오늘 날짜의 assigned이고 departure인 스케줄 중 가장 가까운 시간 하나만 가져오기
  const { data, loading, refetch } = useQuery<GetSchedulesData>(GET_SCHEDULES, {
    variables: {
      date: today,
      subStatus: 'assigned',
      status: 'departure',
    },
    fetchPolicy: 'cache-and-network',
  });

  // 서버에서 이미 정렬되어 있으므로 첫 번째 스케줄만 사용
  const targetSchedule = data?.schedules?.[0] || null;

  // useMutation으로 도착 보고 처리
  const [createArrivalReport, { loading: isSubmitting }] = useMutation(
    CREATE_ARRIVAL_REPORT,
    {
      onCompleted: () => {
        // 성공 시 스케줄 새로고침 후 완료 페이지로 이동
        refetch().then(() => {
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
  const scheduleData: ScheduleInfoData[] = targetSchedule
    ? [
        {
          groom: targetSchedule.groom || '',
          bride: targetSchedule.bride || '',
          date: formatScheduleDate(targetSchedule.date, targetSchedule.time),
          location: targetSchedule.location || '',
          venue: targetSchedule.venue || '',
          memo: targetSchedule.memo || '',
        },
      ]
    : [];

  const handleArrivalReport = async () => {
    if (!targetSchedule) {
      alert('보고할 스케줄이 없습니다.');
      return;
    }

    try {
      await createArrivalReport({
        variables: {
          scheduleId: targetSchedule.id,
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
          text={isSubmitting ? '보고 중...' : '도착 보고하기'}
          mt='14px'
          onClick={handleArrivalReport}
          disabled={loading || isSubmitting || scheduleData.length === 0}
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default ArrivalReportPage;
