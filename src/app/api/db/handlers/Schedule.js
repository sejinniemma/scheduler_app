import Schedule from '../models/Schedule';
import Report from '../models/Report';
import User from '../models/User';
import UserConfirm from '../models/UserConfirm';
import { gql } from '@apollo/client';
import { getToday } from '@/src/lib/utiles';
import { sendScheduleConfirmedAlimtalk } from '@/src/lib/kakaoAlimtalk';

export const typeDefs = gql`
  scalar DateTime

  type Schedule {
    id: String!
    mainUser: String!
    subUser: String
    groom: String!
    bride: String!
    date: String!
    time: String!
    userArrivalTime: String
    scheduledAt: DateTime
    location: String
    venue: String
    memo: String
    status: String!
    currentStep: Int
    reportStatus: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    getTodaySchedules: [Schedule!]!
    getAssignedSchedules: [Schedule!]!
    userConfirmedSchedules: [String!]!
    schedule(id: ID!): Schedule
  }

  type Mutation {
    createSchedule(
      mainUser: String!
      subUser: String
      groom: String!
      bride: String!
      date: String!
      time: String!
      userArrivalTime: String
      location: String
      venue: String
      memo: String
      status: String
    ): Schedule!

    updateSchedule(
      id: String!
      mainUser: String
      subUser: ID
      groom: String
      bride: String
      date: String
      time: String
      userArrivalTime: String
      location: String
      venue: String
      memo: String
      status: String
    ): Schedule!

    confirmSchedules(scheduleIds: [String!]!): ConfirmSchedulesResult!

    deleteSchedule(id: String!): Boolean!
  }

  type ConfirmSchedulesResult {
    success: Boolean!
    message: String!
  }
`;

export const resolvers = {
  Query: {
    getTodaySchedules: async (parent, args, context) => {
      // 오늘 날짜 가져오기
      const today = getToday();

      // 기본 쿼리: 로그인한 사용자가 mainUser 또는 subUser인 스케줄만 조회
      // 오늘 날짜이고 확정된 스케줄만 조회
      const query = {
        $or: [{ mainUser: context.user.id }, { subUser: context.user.id }],
        date: today,
        status: 'confirmed',
      };

      const schedules = await Schedule.find(query);

      // scheduledAt 기준 정렬 (더 빠른 시간이 앞에)
      const sortedSchedules = schedules.sort((a, b) => {
        return a.date - b.date;
      });

      // User 찾기 (Report 조회를 위해)
      const user = await User.findOne({ id: context.user.id });
      if (!user) {
        return sortedSchedules.map((schedule) => ({
          ...schedule.toObject(),
          currentStep: 0,
          reportStatus: null,
        }));
      }

      // 각 스케줄에 대한 Report의 currentStep과 status 가져오기
      const schedulesWithReport = await Promise.all(
        sortedSchedules.map(async (schedule) => {
          const report = await Report.findOne({
            scheduleId: schedule.id,
            userId: user.id,
          });

          return {
            ...schedule.toObject(),
            currentStep: report?.currentStep ?? 0,
            // Report의 status를 사용 (없으면 null)
            reportStatus: report?.status || null,
          };
        }),
      );
      console.log('schedulesWithReport', schedulesWithReport);
      const withOutCompleted = schedulesWithReport.filter(
        (schedule) => schedule.reportStatus !== 'completed',
      );
      return withOutCompleted;
    },

    // 로그인 사용자의 assigned 스케줄 전체 조회 (날짜 제한 없음)
    getAssignedSchedules: async (parent, args, context) => {
      const today = getToday();
      const query = {
        $or: [{ mainUser: context.user.id }, { subUser: context.user.id }],
        status: 'assigned',
        date: { $gte: today }, // 오늘 이후만
      };

      const schedules = await Schedule.find(query).sort({ date: 1, time: 1 });
      return schedules;
    },

    // 현재 사용자가 이미 확정한 스케줄 ID 목록
    userConfirmedSchedules: async (parent, args, context) => {
      const confirms = await UserConfirm.find({
        userId: context.user.id,
        confirmed: true,
      }).select('scheduleId');
      return confirms.map((c) => c.scheduleId);
    },

    schedule: async (parent, { id }, context) => {
      const schedule = await Schedule.findOne({ id });
      if (!schedule) {
        throw new Error('스케줄을 찾을 수 없습니다.');
      }
      // 본인이 mainUser 또는 subUser인지 확인
      if (
        schedule.mainUser !== context.user.id &&
        schedule.subUser !== context.user.id
      ) {
        throw new Error('권한이 없습니다.');
      }

      // 현재 사용자의 Report 정보 추가
      const user = await User.findOne({ id: context.user.id });
      if (user) {
        const report = await Report.findOne({
          scheduleId: schedule.id,
          userId: user.id,
        });

        return {
          ...schedule.toObject(),
          currentStep: report?.currentStep ?? 0,
          reportStatus: report?.status || null,
        };
      }

      return {
        ...schedule.toObject(),
        currentStep: 0,
        reportStatus: null,
      };
    },
  },

  Mutation: {
    createSchedule: async (
      parent,
      {
        mainUser,
        subUser,
        groom,
        bride,
        date,
        time,
        userArrivalTime,
        location,
        venue,
        memo,
        status = 'unassigned',
      },
    ) => {
      const schedule = new Schedule({
        mainUser,
        subUser,
        groom,
        bride,
        date,
        time,
        userArrivalTime,
        location,
        venue,
        memo,
        status,
      });
      return await schedule.save();
    },

    updateSchedule: async (parent, { id, ...updates }, context) => {
      const schedule = await Schedule.findOne({ id });
      if (!schedule) {
        throw new Error('스케줄을 찾을 수 없습니다.');
      }
      // 본인이 mainUser 또는 subUser인지 확인
      if (
        schedule.mainUser !== context.user.id &&
        schedule.subUser !== context.user.id
      ) {
        throw new Error('권한이 없습니다.');
      }
      Object.assign(schedule, updates);
      return await schedule.save();
    },

    confirmSchedules: async (parent, { scheduleIds }, context) => {
      if (!scheduleIds || scheduleIds.length === 0) {
        return {
          success: false,
          message: '스케줄 ID 배열이 필요합니다.',
        };
      }

      // 모든 스케줄을 찾아서 권한 확인 및 업데이트
      const schedules = await Schedule.find({ id: { $in: scheduleIds } });

      if (schedules.length === 0) {
        return {
          success: false,
          message: '스케줄을 찾을 수 없습니다.',
        };
      }

      let confirmedCount = 0;

      for (const schedule of schedules) {
        // 본인이 mainUser 또는 subUser인지 확인
        if (
          schedule.mainUser !== context.user.id &&
          schedule.subUser !== context.user.id
        ) {
          continue; // 권한이 없는 스케줄은 건너뛰기
        }
        console.log('mainUser', schedule.mainUser);
        console.log('subUser', schedule.subUser);
        // status가 'assigned'인 것만 업데이트
        if (schedule.status === 'assigned') {
          // 작가 스케쥴 확정 기록 저장
          await UserConfirm.findOneAndUpdate(
            { scheduleId: schedule.id, userId: context.user.id },
            { confirmed: true, confirmedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );

          // 해당 스케쥴의 작가,서브작가 id 목록
          const requiredUserIds = [
            schedule.mainUser,
            ...(schedule.subUser ? [schedule.subUser] : []),
          ];
          console.log('requiredUserIds', requiredUserIds);
          // 모두 확정완료를 눌렀는지 확인
          const confirmations = await UserConfirm.find({
            scheduleId: schedule.id,
            userId: { $in: requiredUserIds },
            confirmed: true,
          }).select('userId');
          console.log('confirmations', confirmations);
          // 모든 필요 사용자에 대한 확정이 완료되면 스케줄 상태 'confirmed'로 변경
          if (confirmations.length === requiredUserIds.length) {
            await Schedule.updateOne(
              { id: schedule.id },
              { status: 'confirmed' }
            );
            confirmedCount++;

            // 확정 완료 즉시 카카오 알림톡 발송 (mainUser, subUser 각각)
            const userIds = [schedule.mainUser, schedule.subUser].filter(Boolean);
            const users = await User.find({ id: { $in: userIds } }).lean();
            const scheduleInfo = {
              date: schedule.date,
              time: schedule.time || schedule.userArrivalTime,
              groom: schedule.groom,
              bride: schedule.bride,
              venue: schedule.venue || schedule.location || '',
            };
            for (const u of users) {
              if (u.phone) {
                sendScheduleConfirmedAlimtalk(u.phone, u.name, scheduleInfo).catch(
                  (err) => console.error('[confirmSchedules] 알림톡 발송 실패', u.phone, err)
                );
              }
            }
          }
        }
      }

      return {
        success: confirmedCount > 0,
        message:
          confirmedCount > 0
            ? `총 ${confirmedCount}건 확정되었습니다.`
            : '확정 가능한 스케줄이 없습니다.',
      };
    },

    deleteSchedule: async (parent, { id }, context) => {
      const schedule = await Schedule.findOne({ id });
      if (!schedule) {
        return false;
      }
      // 본인이 mainUser 또는 subUser인지 확인
      if (
        schedule.mainUser === context.user.id ||
        schedule.subUser === context.user.id
      ) {
        await Schedule.findOneAndDelete({ id });
        return true;
      }
      return false;
    },
  },
};
