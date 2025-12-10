import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import Schedule from '../db/models/Schedule';
import { connectToDatabase } from '../db/mongodb';
import { getToday } from './utiles';
import type { NextAuthOptions } from 'next-auth';

export async function getTodaySchedules() {
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

    const schedules = await Schedule.find(query);

    // time 기준 정렬 (더 빠른 시간이 앞에)
    return schedules.sort((a, b) => a.time.localeCompare(b.time));
  } catch (error) {
    console.error('스케줄 가져오기 오류:', error);
    return [];
  }
}
