'use client';
import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import CheckboxList, { CheckboxItemData } from '@/src/components/CheckboxList';
import { useSchedule } from '@/src/contexts/ScheduleContext';
import { useSession } from 'next-auth/react';
import { formatScheduleDate } from '@/src/lib/utiles';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { CREATE_COMPLETED_REPORT } from '@/src/client/graphql/Report';

const CompletedReportPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const { schedules, refreshSchedules } = useSchedule();
  const router = useRouter();

  // useMutation으로 종료 보고 처리
  const [createCompletedReport, { loading: isLoading }] = useMutation(
    CREATE_COMPLETED_REPORT,
    {
      onCompleted: () => {
        // 성공 시 스케줄 새로고침 후 완료 페이지로 이동
        refreshSchedules().then(() => {
          router.push('/report-success?status=completed');
        });
      },
      onError: (error) => {
        console.error('종료 보고 오류:', error);
        alert(error.message || '종료 보고 중 오류가 발생했습니다.');
      },
    }
  );

  const [checkboxItems, setCheckboxItems] = useState<CheckboxItemData[]>([
    {
      id: '1',
      label: '특이사항이 있어요',
      checked: false,
    },
  ]);
  const [memo, setMemo] = useState('');

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckboxItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    );
    // 체크박스가 해제되면 메모도 초기화
    if (!checked) {
      setMemo('');
    }
  };

  // 스케줄 데이터를 ScheduleInfoData 형식으로 변환
  const scheduleData: ScheduleInfoData[] = schedules.map((schedule) => ({
    groom: schedule.groom || '',
    bride: schedule.bride || '',
    date: formatScheduleDate(schedule.date, schedule.time),
    location: schedule.location || '',
    venue: schedule.venue || '',
    memo: schedule.memo || '',
  }));

  const handleCompletedReport = async () => {
    if (schedules.length === 0) {
      alert('보고할 스케줄이 없습니다.');
      return;
    }

    // 가장 가까운 시간의 스케줄에 대해 종료 보고
    const scheduleId = schedules[0].id;

    try {
      await createCompletedReport({
        variables: {
          scheduleId,
          memo: checkboxItems[0].checked ? memo : undefined,
        },
      });
    } catch (error) {
      // onError에서 처리되지만, 여기서도 처리 가능
      console.error('종료 보고 오류:', error);
    }
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
          title={`${userName}님 촬영이 종료되었나요 ?`}
          description='특이사항이 있다면 알려주시고 촬영 종료 보고를 해주세요'
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

        <CheckboxList
          items={checkboxItems}
          onChange={handleCheckboxChange}
          size={16}
          className='mt-[12px]'
        />

        {/* 특이사항 메모 입력란 */}
        {checkboxItems[0].checked && (
          <div className='w-full mt-[12px]'>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder='특이사항을 입력해주세요'
              rows={4}
              className='w-full p-[12px] text-caption1 text-default border border-line-edge rounded-xl resize-none focus:outline-none focus:border-blue'
              style={{
                backgroundColor: '#fff',
              }}
            />
          </div>
        )}

        <Button
          text={isLoading ? '보고 중...' : '촬영 종료 보고하기'}
          onClick={handleCompletedReport}
          disabled={isLoading || scheduleData.length === 0}
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default CompletedReportPage;
