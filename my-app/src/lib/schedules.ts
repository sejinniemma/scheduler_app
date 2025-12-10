import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import ScheduleModel from '../db/models/Schedule';
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

    // Mongoose 문서를 일반 객체로 변환 (toJSON 메서드 제거)
    return sortedSchedules.map((schedule) => ({
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
      createdAt: schedule.createdAt?.toISOString(),
      updatedAt: schedule.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error('스케줄 가져오기 오류:', error);
    return [];
  }
}
