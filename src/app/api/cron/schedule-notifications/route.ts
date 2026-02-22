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
import {
  getToday,
  parseArrivalTime,
  TimeMs,
  NOTIFICATION_WINDOW_MINUTES,
} from '@/src/lib/dateUtils';

/** 각 알림/지연 체크 구간의 길이 (ms). 예: 15분 = 기상 알림이 유효한 시간 폭 */
const NOTIFICATION_WINDOW_MS = NOTIFICATION_WINDOW_MINUTES * TimeMs.MIN;

/** ETA·예식시간 기준 알림 시간대 (start ~ end) */
function getScheduleTimeRanges(eta: Date, ceremonyTime: Date) {
  /** 기준 시각에 시간·분을 더한 새 Date */
  const addHoursAndMinutes = (base: Date, hours: number, minutes = 0) =>
    new Date(base.getTime() + hours * TimeMs.HOUR + minutes * TimeMs.MIN);

  /** 시작 시각부터 NOTIFICATION_WINDOW_MS 길이의 구간 { start, end } */
  const timeRangeFrom = (start: Date) => ({
    start,
    end: new Date(start.getTime() + NOTIFICATION_WINDOW_MS), // 알림 구간 종료 시각
  });

  return {
    wakeup: timeRangeFrom(addHoursAndMinutes(eta, -4)),
    departure: timeRangeFrom(addHoursAndMinutes(eta, -3, -40)),
    arrival: timeRangeFrom(addHoursAndMinutes(eta, -3, -20)),
    eta: timeRangeFrom(eta),
    end: timeRangeFrom(addHoursAndMinutes(ceremonyTime, 1)),
  };
}

/** 지금 시각(now)이 해당 시간대(start ~ end) 안에 있는지 여부 */
function isInTimeRange(now: Date, range: { start: Date; end: Date }) {
  return now >= range.start && now < range.end;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
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
      // 작가 도착 에정시간
      const arrivalTime = parseArrivalTime(schedule.date, schedule.scheduledAt);
      // 작가 도착 에정시간 - 1.5시간 = eta
      const eta = new Date(arrivalTime.getTime() - 1.5 * TimeMs.HOUR);
      // 예식시간
      const ceremonyTime = parseArrivalTime(schedule.date, schedule.time);
      // 알림 구간 계산
      const notificationTimeRanges = getScheduleTimeRanges(eta, ceremonyTime);

      const reports = await Report.find({ scheduleId: schedule.id }).lean();
      /** 알림톡 본문에 넣을 스케줄 요약 (날짜, 시간, 신랑/신부) */
      const scheduleLabel = `${schedule.date} ${schedule.scheduledAt} ${schedule.groom}/${schedule.bride}`;

      for (const report of reports) {
        const user = await User.findOne({ id: report.userId }).lean();
        const userPhone = user?.phone ?? '';
        const userName = user?.name ?? '';

        // 예식+1h: 종료 알림만 발송. status=completed는 작가가 액션으로만 설정.
        if (isInTimeRange(now, notificationTimeRanges.end)) {
          if (report.status !== 'completed') {
            await sendCronCompletedAlimtalk(userPhone, scheduleLabel);
            results.push({
              scheduleId: schedule.id,
              action: 'completed_notification_sent',
            });
          }
          continue;
        }

        // cron은 지연 상태만 설정. 그 외는 작가 액션으로만 변경.
        if (isInTimeRange(now, notificationTimeRanges.eta)) {
          const isArrived =
            report.status === 'arrival' ||
            report.status === 'arrival_delayed' ||
            report.status === 'completed';
          if (!isArrived) {
            await Report.updateOne(
              { id: report.id },
              { status: 'arrival_delayed' },
            );
            await sendCronAdminArrivalDelayAlimtalk(scheduleLabel, userName);
            results.push({
              scheduleId: schedule.id,
              action: 'arrival_delayed',
            });
          }
          continue;
        }

        if (isInTimeRange(now, notificationTimeRanges.arrival)) {
          if (report.status === 'departure') {
            await sendCronArrivalAlimtalk(userPhone, scheduleLabel);
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
            await sendCronAdminDepartureDelayAlimtalk(scheduleLabel, userName);
            results.push({
              scheduleId: schedule.id,
              action: 'departure_delayed',
            });
          }
          continue;
        }

        if (isInTimeRange(now, notificationTimeRanges.departure)) {
          if (report.status === 'wakeup') {
            await sendCronDepartureAlimtalk(userPhone, scheduleLabel);
            results.push({ scheduleId: schedule.id, action: 'departure_sent' });
          } else if (report.status === 'pending') {
            await Report.updateOne(
              { id: report.id },
              { status: 'wakeup_delayed' },
            );
            await sendCronAdminDelayAlimtalk(scheduleLabel, userName);
            results.push({ scheduleId: schedule.id, action: 'wakeup_delayed' });
          }
          continue;
        }

        if (
          isInTimeRange(now, notificationTimeRanges.wakeup) &&
          report.status === 'pending'
        ) {
          await sendCronWakeupAlimtalk(userPhone, scheduleLabel);
          results.push({ scheduleId: schedule.id, action: 'wakeup_sent' });
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
