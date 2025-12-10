import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import ScheduleModel from '@/src/db/models/Schedule';
import { connectToDatabase } from '@/src/db/mongodb';
import type { NextAuthOptions } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // @ts-ignore - NextAuth v4 타입 호환성
    const session = await getServerSession(authOptions as NextAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { scheduleIds } = await request.json();

    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return NextResponse.json(
        { error: '스케줄 ID 배열이 필요합니다.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 모든 스케줄을 찾아서 권한 확인 및 업데이트
    const schedules = await ScheduleModel.find({ id: { $in: scheduleIds } });

    if (schedules.length === 0) {
      return NextResponse.json(
        { error: '스케줄을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인 및 업데이트 (assigned인 것만)
    const updatedSchedules = [];
    for (const schedule of schedules) {
      // 본인이 mainUser 또는 subUser인지 확인
      if (
        schedule.mainUser !== session.user.id &&
        schedule.subUser !== session.user.id
      ) {
        continue; // 권한이 없는 스케줄은 건너뛰기
      }

      // subStatus가 'assigned'인 것만 업데이트
      if (schedule.subStatus === 'assigned') {
        schedule.subStatus = 'completed';
        await schedule.save();
        updatedSchedules.push(schedule);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedSchedules.length,
    });
  } catch (error) {
    console.error('스케줄 확정 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

