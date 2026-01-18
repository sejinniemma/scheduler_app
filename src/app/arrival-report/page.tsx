'use client';
import Button from '@/src/components/Button';
import ContentLayout from '@/src/components/ContentLayout';
import MainSection from '@/src/components/MainSection';
import PageHeader from '@/src/components/PageHeader';
import ScheduleInfo, { ScheduleInfoData } from '@/src/components/ScheduleInfo';
import MobileLayout from '@/src/layout/MobileLayout';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { formatScheduleDate } from '@/src/lib/utiles';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  UPDATE_ARRIVAL_REPORT,
  GET_REPORTS_BY_SCHEDULE,
} from '@/src/client/graphql/Report';
import { GET_SCHEDULES } from '@/src/client/graphql/Schedule';
import type { Schedule } from '@/src/types/schedule';
import { useState, useRef } from 'react';

interface GetSchedulesData {
  getTodaySchedules: Schedule[];
}

interface GetReportsByScheduleData {
  reportsBySchedule: Array<{
    id: string;
    scheduleId: string;
    userId: string;
    status: string;
    estimatedTime?: string;
    currentStep: number;
    memo?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

const ArrivalReportPage = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 서버에서 오늘 날짜의 confirmed인 스케줄 중 가장 가까운 시간 하나만 가져오기
  const { data, loading } = useQuery<GetSchedulesData>(GET_SCHEDULES, {
    fetchPolicy: 'cache-and-network',
  });

  // reportStatus가 'departure' 이상인 스케줄만 필터링 (출발 보고가 완료된 스케줄)
  const targetSchedule =
    data?.getTodaySchedules?.find(
      (schedule) =>
        schedule.reportStatus === 'departure' ||
        schedule.reportStatus === 'arrival' ||
        schedule.reportStatus === 'completed'
    ) || null;

  // 해당 스케줄의 Report 조회
  const { data: reportData } = useQuery<GetReportsByScheduleData>(
    GET_REPORTS_BY_SCHEDULE,
    {
      variables: {
        scheduleId: targetSchedule?.id || '',
      },
      skip: !targetSchedule || !targetSchedule.id,
      fetchPolicy: 'cache-and-network',
    }
  );

  const existingReport = reportData?.reportsBySchedule?.[0] || null;

  // useMutation으로 도착 보고 처리 (기존 Report 업데이트)
  const [updateArrivalReport, { loading: isSubmitting }] = useMutation(
    UPDATE_ARRIVAL_REPORT,
    {
      onCompleted: () => {
        // 성공 시 완료 페이지로 이동 (스케줄 상태는 서버에서 이미 업데이트됨)
        router.push('/report-success?status=arrival');
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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '이미지 업로드 실패');
      }

      const data = await response.json();
      setUploadedImageUrl(data.imageUrl);
      alert('이미지가 성공적으로 업로드되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : '이미지 업로드 중 오류가 발생했습니다.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleArrivalReport = async () => {
    if (!targetSchedule) {
      alert('보고할 스케줄이 없습니다.');
      return;
    }

    if (!existingReport) {
      alert('출발 보고를 먼저 완료해주세요.');
      return;
    }

    try {
      // 도착 예정 시간(기대 도착)과 현재 시간을 비교하여 지연 여부 판단
      const arrivalTargetTime =
        targetSchedule.userArrivalTime || targetSchedule.time;
      const arrivalTarget = arrivalTargetTime
        ? new Date(`${targetSchedule.date}T${arrivalTargetTime}:00`)
        : null;
      const now = new Date();
      const status =
        arrivalTarget && now > arrivalTarget ? 'delayed' : 'arrival';

      await updateArrivalReport({
        variables: {
          id: existingReport.id,
          status,
          imageUrl: uploadedImageUrl || undefined,
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

        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept='image/*'
          className='hidden'
        />
        <Button
          text={
            isUploading
              ? '업로드 중...'
              : uploadedImageUrl
              ? '사진 변경'
              : '사진 업로드'
          }
          showShadow={false}
          onClick={handleUploadClick}
          disabled={isUploading}
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
        {uploadedImageUrl && (
          <div className='mt-[10px] w-full'>
            <Image
              src={uploadedImageUrl}
              alt='Uploaded image'
              width={400}
              height={300}
              className='w-full h-auto rounded-[10px] object-cover'
              unoptimized
            />
          </div>
        )}
        <Button
          text={isSubmitting ? '보고 중...' : '도착 보고하기'}
          mt='14px'
          onClick={handleArrivalReport}
          disabled={
            loading ||
            isSubmitting ||
            scheduleData.length === 0 ||
            !existingReport
          }
        />
      </ContentLayout>
    </MobileLayout>
  );
};

export default ArrivalReportPage;
