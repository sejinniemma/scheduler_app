import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import ScheduleModel from '../db/models/Schedule';
import ReportModel from '../db/models/Report';
import UserModel from '../db/models/User';
import { connectToDatabase } from '../db/mongodb';
import { getToday } from './utiles';
import type { NextAuthOptions } from 'next-auth';
import type { Schedule } from '../types/schedule';

export async function getTodaySchedules(): Promise<Schedule[]> {
  try {
    const session = await getServerSession(authOptions as NextAuthOptions);

    if (!session?.user?.id) {
      return [];
    }

    await connectToDatabase();

    const query = {
      $or: [{ mainUser: session.user.id }, { subUser: session.user.id }],
      date: getToday(),
      subStatus: 'assigned',
    };

    const schedules = await ScheduleModel.find(query);

    // time 기준 정렬 (더 빠른 시간이 앞에)
    const sortedSchedules = schedules.sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    // User 찾기 (Report 조회를 위해)
    const user = await UserModel.findOne({ id: session.user.id });
    if (!user) {
      return [];
    }

    // 각 스케줄에 대한 Report의 currentStep 가져오기
    const schedulesWithCurrentStep = await Promise.all(
      sortedSchedules.map(async (schedule) => {
        // 해당 스케줄에 대한 Report 찾기
        const report = await ReportModel.findOne({
          schedule: schedule._id,
          user: user._id,
        });

        return {
          id: schedule.id,
          mainUser: schedule.mainUser,
          subUser: schedule.subUser,
          groom: schedule.groom,
          bride: schedule.bride,
          date: schedule.date,
          time: schedule.time,
          location: schedule.location,
          venue: schedule.venue,
          memo: schedule.memo,
          status: schedule.status,
          subStatus: schedule.subStatus,
          currentStep: report?.currentStep ?? 0,
          createdAt: schedule.createdAt?.toISOString(),
          updatedAt: schedule.updatedAt?.toISOString(),
        };
      })
    );

    return schedulesWithCurrentStep;
  } catch (error) {
    console.error('스케줄 가져오기 오류:', error);
    return [];
  }
}
