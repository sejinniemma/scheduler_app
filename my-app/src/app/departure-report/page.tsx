'use client';
import Button from '@/src/components/Button';
import CheckboxList, { CheckboxItemData } from '@/src/components/CheckboxList';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import TimePickerWheel from '@/src/components/TimePickerWheel';
import MobileLayout from '@/src/layout/MobileLayout';
import { useSession } from 'next-auth/react';
import { formatScheduleDate, getToday } from '@/src/lib/utiles';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_DEPARTURE_REPORT } from '@/src/client/graphql/Report';
import { GET_SCHEDULES } from '@/src/client/graphql/Schedule';
import type { Schedule } from '@/src/types/schedule';

interface GetSchedulesData {
  schedules: Schedule[];
}

const DepartureReportPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const router = useRouter();
  const today = getToday();
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);

  // 서버에서 오늘 날짜의 assigned이고 wakeup인 스케줄 중 가장 가까운 시간 하나만 가져오기
  const { data, loading, refetch } = useQuery<GetSchedulesData>(GET_SCHEDULES, {
    variables: {
      date: today,
      subStatus: 'assigned',
      status: 'wakeup',
    },
    fetchPolicy: 'cache-and-network',
  });

  // 서버에서 이미 정렬되어 있으므로 첫 번째 스케줄만 사용
  const targetSchedule = data?.schedules?.[0] || null;

  // useMutation으로 출발 보고 처리
  const [createDepartureReport, { loading: isSubmitting }] = useMutation(
    CREATE_DEPARTURE_REPORT,
    {
      onCompleted: () => {
        // 성공 시 스케줄 새로고침 후 완료 페이지로 이동
        refetch().then(() => {
          router.push('/report-success?status=departure');
        });
      },
      onError: (error) => {
        console.error('출발 보고 오류:', error);
        alert(error.message || '출발 보고 중 오류가 발생했습니다.');
      },
    }
  );

  const handleTimeChange = (h: number, m: number) => {
    setSelectedHour(h);
    setSelectedMinute(m);
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

  // 모든 체크박스가 체크되었는지 확인
  const allChecked = useMemo(() => {
    return checkboxItems.every((item) => item.checked);
  }, [checkboxItems]);

  // 버튼 활성화 조건: 모든 체크박스가 체크되고 시간이 선택되었을 때
  const isButtonEnabled =
    allChecked && selectedHour !== null && selectedMinute !== null;

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

  const handleDepartureReport = async () => {
    if (!targetSchedule) {
      alert('보고할 스케줄이 없습니다.');
      return;
    }

    if (!allChecked) {
      alert('모든 준비물을 체크해주세요.');
      return;
    }

    if (selectedHour === null || selectedMinute === null) {
      alert('도착 예정 시간을 선택해주세요.');
      return;
    }

    const estimatedTime = `${String(selectedHour).padStart(2, '0')}:${String(
      selectedMinute
    ).padStart(2, '0')}`;

    try {
      await createDepartureReport({
        variables: {
          scheduleId: targetSchedule.id,
          estimatedTime,
        },
      });
    } catch (error) {
      // onError에서 처리되지만, 여기서도 처리 가능
      console.error('출발 보고 오류:', error);
    }
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
            title={`${userName}님 출발할 준비가 되셨나요 ?`}
            description='도착예정시간을 알려주시고 출발 보고를해주세요'
          />

          <TimePickerWheel onChange={handleTimeChange} />

          <CheckboxList items={checkboxItems} onChange={handleCheckboxChange} />

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
        </div>
        <Button
          text={isSubmitting ? '보고 중...' : '출발 보고하기'}
          onClick={handleDepartureReport}
          disabled={
            !isButtonEnabled ||
            loading ||
            isSubmitting ||
            scheduleData.length === 0
          }
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default DepartureReportPage;
