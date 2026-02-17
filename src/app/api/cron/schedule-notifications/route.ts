import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../db/mongodb';
import Schedule from '../../db/models/Schedule';
import Report from '../../db/models/Report';
import User from '../../db/models/User';
import {
  sendCronWakeupAlimtalk,
  sendCronDepartureAlimtalk,
  sendCronArrivalAlimtalk,
  sendCronAdminDelayAlimtalk,
  sendCronAdminDepartureDelayAlimtalk,
  sendCronAdminArrivalDelayAlimtalk,
} from '@/src/lib/kakaoAlimtalk';

const CRON_SECRET = process.env.CRON_SECRET;
const MS_PER_HOUR = 60 * 60 * 1000;
const WINDOW_MINUTES = 15;

function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseArrivalTime(date: string, timeStr: string): Date {
  const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return new Date(`${date}T${t}`);
}

// 기상 알림톡 발송
async function sendWakeupNotification(userPhone: string, scheduleInfo: string) {
  await sendCronWakeupAlimtalk(userPhone, scheduleInfo);
}

// 출발 알림톡 발송
async function sendDepartureNotification(
  userPhone: string,
  scheduleInfo: string,
) {
  await sendCronDepartureAlimtalk(userPhone, scheduleInfo);
}

// 도착 알림톡 발송
async function sendArrivalNotification(
  userPhone: string,
  scheduleInfo: string,
) {
  await sendCronArrivalAlimtalk(userPhone, scheduleInfo);
}

// 관리자 기상 지연 알림톡 발송
async function sendAdminDelayNotification(
  scheduleInfo: string,
  userName: string,
) {
  await sendCronAdminDelayAlimtalk(scheduleInfo, userName);
}

// 관리자 출발 지연 알림톡 발송
async function sendAdminDepartureDelayNotification(
  scheduleInfo: string,
  userName: string,
) {
  await sendCronAdminDepartureDelayAlimtalk(scheduleInfo, userName);
}

// 관리자 도착 지연 알림톡 발송
async function sendAdminArrivalDelayNotification(
  scheduleInfo: string,
  userName: string,
) {
  await sendCronAdminArrivalDelayAlimtalk(scheduleInfo, userName);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const today = getToday();
    const now = new Date();

    const schedules = await Schedule.find({
      date: today,
      status: 'confirmed',
    }).lean();

    const results: { scheduleId: string; action?: string; error?: string }[] =
      [];

    for (const schedule of schedules) {
      const arrivalTime = parseArrivalTime(
        schedule.date,
        schedule.userArrivalTime || schedule.time,
      );
      const windowMs = WINDOW_MINUTES * 60 * 1000;
      const window4hStart = new Date(arrivalTime.getTime() - 4 * MS_PER_HOUR);
      const window4hEnd = new Date(window4hStart.getTime() + windowMs);
      const window3hStart = new Date(arrivalTime.getTime() - 3 * MS_PER_HOUR);
      const window3hEnd = new Date(window3hStart.getTime() + windowMs);
      const window2hStart = new Date(arrivalTime.getTime() - 2 * MS_PER_HOUR);
      const window2hEnd = new Date(window2hStart.getTime() + windowMs);
      const window0hStart = new Date(arrivalTime.getTime());
      const window0hEnd = new Date(arrivalTime.getTime() + windowMs);

      const reports = await Report.find({ scheduleId: schedule.id }).lean();
      const scheduleLabel = `${schedule.date} ${schedule.userArrivalTime || schedule.time} ${schedule.groom}/${schedule.bride}`;

      for (const report of reports) {
        const user = await User.findOne({ id: report.userId }).lean();
        const userPhone = user?.phone ?? '';
        const userName = user?.name ?? '';

        // ETA - 4h: PENDING → 기상 알림
        if (now >= window4hStart && now < window4hEnd) {
          if (report.status === 'pending') {
            await sendWakeupNotification(userPhone, scheduleLabel);
            results.push({ scheduleId: schedule.id, action: 'wakeup_sent' });
          }
          continue;
        }

        // ETA - 3h: WAKE_UP → 출발 보고 요청 / PENDING → WAKE_UP_DELAYED + 관리자 알림
        if (now >= window3hStart && now < window3hEnd) {
          if (report.status === 'wakeup') {
            await sendDepartureNotification(userPhone, scheduleLabel);
            results.push({ scheduleId: schedule.id, action: 'departure_sent' });
          } else if (report.status === 'pending') {
            await Report.updateOne(
              { id: report.id },
              { status: 'wakeup_delayed' },
            );
            await sendAdminDelayNotification(scheduleLabel, userName);
            results.push({ scheduleId: schedule.id, action: 'wakeup_delayed' });
          }
          continue;
        }

        // ETA - 2h: DEPARTED → 도착 보고 요청 / 미출발 → DEPARTURE_DELAYED + 관리자 알림
        if (now >= window2hStart && now < window2hEnd) {
          if (report.status === 'departure') {
            await sendArrivalNotification(userPhone, scheduleLabel);
            results.push({ scheduleId: schedule.id, action: 'arrival_sent' });
          } else if (
            report.status === 'wakeup' ||
            report.status === 'wakeup_delayed' ||
            report.status === 'pending'
          ) {
            await Report.updateOne(
              { id: report.id },
              { status: 'departure_delayed' },
            );
            await sendAdminDepartureDelayNotification(scheduleLabel, userName);
            results.push({
              scheduleId: schedule.id,
              action: 'departure_delayed',
            });
          }
          continue;
        }

        // ETA: ARRIVED → 정상 진행 / 미도착 → ARRIVAL_DELAYED + 관리자 알림 + 어드민 개입
        if (now >= window0hStart && now < window0hEnd) {
          const isArrived =
            report.status === 'arrival' ||
            report.status === 'arrival_delayed' ||
            report.status === 'completed';
          if (!isArrived) {
            await Report.updateOne(
              { id: report.id },
              { status: 'arrival_delayed' },
            );
            await sendAdminArrivalDelayNotification(scheduleLabel, userName);
            results.push({
              scheduleId: schedule.id,
              action: 'arrival_delayed',
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('[CRON] schedule-notifications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron failed' },
      { status: 500 },
    );
  }
}
