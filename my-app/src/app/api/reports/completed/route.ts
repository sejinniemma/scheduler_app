import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import ScheduleModel from '@/src/db/models/Schedule';
import ReportModel from '@/src/db/models/Report';
import UserModel from '@/src/db/models/User';
import { connectToDatabase } from '@/src/db/mongodb';
import type { NextAuthOptions } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // @ts-ignore - NextAuth v4 타입 호환성
    const session = await getServerSession(authOptions as NextAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { scheduleId, memo } = await request.json();

    if (!scheduleId) {
      return NextResponse.json({ error: '스케줄 ID가 필요합니다.' }, { status: 400 });
    }

    await connectToDatabase();

    // 스케줄 확인 및 업데이트
    const schedule = await ScheduleModel.findOne({ id: scheduleId });
    if (!schedule) {
      return NextResponse.json({ error: '스케줄을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 본인이 mainUser 또는 subUser인지 확인
    if (
      schedule.mainUser !== session.user.id &&
      schedule.subUser !== session.user.id
    ) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // Schedule status를 'completed'로 업데이트
    schedule.status = 'completed';
    await schedule.save();

    // User 찾기 (user 필드는 ObjectId이므로 User의 _id를 찾아야 함)
    const user = await UserModel.findOne({ id: session.user.id });
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Report 찾기 또는 생성
    let report = await ReportModel.findOne({
      schedule: schedule._id,
      user: user._id,
    });

    if (report) {
      // 기존 Report 업데이트
      report.status = 'completed';
      report.currentStep = 3; // 종료 보고는 step 3
      if (memo !== undefined) report.memo = memo;
      await report.save();
    } else {
      // 새 Report 생성
      report = new ReportModel({
        schedule: schedule._id,
        user: user._id,
        status: 'completed',
        currentStep: 3,
        memo: memo || undefined,
      });
      await report.save();
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('종료 보고 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

