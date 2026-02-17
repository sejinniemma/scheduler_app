import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../db/mongodb';
import Schedule from '../../db/models/Schedule';
import Report from '../../db/models/Report';
import User from '../../db/models/User';
import {
  sendCronWakeupAlimtalk,
  sendCronDepartureAlimtalk,
  sendCronArrivalAlimtalk,
  sendCronCompletedAlimtalk,
  sendCronAdminDelayAlimtalk,
  sendCronAdminDepartureDelayAlimtalk,
  sendCronAdminArrivalDelayAlimtalk,
} from '@/src/lib/kakaoAlimtalk';

const CRON_SECRET = process.env.CRON_SECRET;
const MS_PER_HOUR = 60 * 60 * 1000;
const WINDOW_MINUTES = 15;
const windowMs = WINDOW_MINUTES * 60 * 1000;
const MS_PER_MIN = 60 * 1000;

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

// 종료 알림톡 발송 (예식+1h)
async function sendCompletedNotification(
  userPhone: string,
  scheduleInfo: string,
) {
  await sendCronCompletedAlimtalk(userPhone, scheduleInfo);
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

    // 오늘의 확정된 스케줄 조회
    const schedules = await Schedule.find({
      date: today,
      status: 'confirmed',
    }).lean();

    const results: { scheduleId: string; action?: string; error?: string }[] =
      [];

    for (const schedule of schedules) {
      // 작가 도착 예정시간
      const arrivalTime = parseArrivalTime(
        schedule.date,
        schedule.userArrivalTimes,
      );
      // ETA = 도착 예정 - 1시간 반
      const eta = new Date(arrivalTime.getTime() - 1.5 * MS_PER_HOUR);
      // 예식시간
      const ceremonyTime = parseArrivalTime(schedule.date, schedule.time);

      // ETA - 4h: 기상 알림
      const windowWakeupStart = new Date(eta.getTime() - 4 * MS_PER_HOUR);
      const windowWakeupEnd = new Date(windowWakeupStart.getTime() + windowMs);

      // ETA - 3h 40m: 출발 알림
      const windowDepartureStart = new Date(
        eta.getTime() - (3 * MS_PER_HOUR + 40 * MS_PER_MIN),
      );
      const windowDepartureEnd = new Date(
        windowDepartureStart.getTime() + windowMs,
      );

      // ETA - 3h 20m: 도착 확인 알림
      const windowArrivalStart = new Date(
        eta.getTime() - (3 * MS_PER_HOUR + 20 * MS_PER_MIN),
      );
      const windowArrivalEnd = new Date(
        windowArrivalStart.getTime() + windowMs,
      );

      // ETA 시점: 도착 지연 체크
      const windowEtaStart = new Date(eta.getTime());
      const windowEtaEnd = new Date(eta.getTime() + windowMs);

      // 예식+1h: 종료 알림 + completed
      const windowEndStart = new Date(ceremonyTime.getTime() + 1 * MS_PER_HOUR);
      const windowEndEnd = new Date(windowEndStart.getTime() + windowMs);

      // 스케줄에 해당하는 Report 조회
      const reports = await Report.find({ scheduleId: schedule.id }).lean();
      const scheduleLabel = `${schedule.date} ${schedule.userArrivalTime || schedule.time} ${schedule.groom}/${schedule.bride}`;

      for (const report of reports) {
        const user = await User.findOne({ id: report.userId }).lean();
        const userPhone = user?.phone ?? '';
        const userName = user?.name ?? '';

        // 예식+1h: 종료 알림만 발송. status=completed는 작가가 액션으로만 설정.
        if (now >= windowEndStart && now < windowEndEnd) {
          if (report.status !== 'completed') {
            await sendCompletedNotification(userPhone, scheduleLabel);
            results.push({
              scheduleId: schedule.id,
              action: 'completed_notification_sent',
            });
          }
          continue;
        }

        // cron은 지연 상태(wakeup_delayed, departure_delayed, arrival_delayed)만 설정.
        // wakeup_sent, departure_sent, arrival_sent, completed 등은 작가 액션으로만 변경.

        // ETA: 미도착 → ARRIVAL_DELAYED + 관리자 알림
        if (now >= windowEtaStart && now < windowEtaEnd) {
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
          continue;
        }

        // ETA - 3h 20m: DEPARTED → 도착 확인 알림 / 미출발 → DEPARTURE_DELAYED + 관리자
        if (now >= windowArrivalStart && now < windowArrivalEnd) {
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

        // ETA - 3h 40m: WAKE_UP → 출발 알림 / PENDING → WAKE_UP_DELAYED + 관리자
        if (now >= windowDepartureStart && now < windowDepartureEnd) {
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

        // ETA - 5h 30m: PENDING → 기상 알림
        if (now >= windowWakeupStart && now < windowWakeupEnd) {
          if (report.status === 'pending') {
            await sendWakeupNotification(userPhone, scheduleLabel);
            results.push({ scheduleId: schedule.id, action: 'wakeup_sent' });
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
